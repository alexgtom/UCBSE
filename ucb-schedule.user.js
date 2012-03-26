// ==UserScript==
// @name           UC Berkeley Schedule Enhancer (UCBSE)
// @description	   Enhances the look and feel of the UC Berkeley schedule making it easier to read and search for classes.
// @namespace      http://osoc.berkeley.edu/OSOC/
// @include        http://osoc.berkeley.edu/OSOC/*
// ==/UserScript==
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
//
//	  Want to make this script better? Fork us on github!
//	  https://github.com/athk/UCBSE
//

// GreaseMonkey API compatibility for Chrome
// @copyright      2009, 2010 James Campos
// @modified		2010 Steve Sobel - added some missing gm_* functions
// @license        cc-by-3.0; http://creativecommons.org/licenses/by/3.0/
if ((typeof GM_deleteValue == 'undefined') || (typeof GM_addStyle == 'undefined')) {
	GM_addStyle = function(css) {
		var style = document.createElement('style');
		style.textContent = css;
		var head = document.getElementsByTagName('head')[0];
		if (head) {
			head.appendChild(style);
		}
	}

	GM_deleteValue = function(name) {
		localStorage.removeItem(name);
	}

	GM_getValue = function(name, defaultValue) {
		var value = localStorage.getItem(name);
		if (!value)
			return defaultValue;
		var type = value[0];
		value = value.substring(1);
		switch (type) {
			case 'b':
				return value == 'true';
			case 'n':
				return Number(value);
			default:
				return value;
		}
	}

	GM_log = function(message) {
		console.log(message);
	}

	GM_registerMenuCommand = function(name, funk) {
	//todo
	}

	GM_setValue = function(name, value) {
		value = (typeof value)[0] + value;
		localStorage.setItem(name, value);
	}
	
	if (typeof(safari) != 'undefined')  {
		GM_xmlhttpRequest = function(obj) {
			obj.requestType = 'GM_xmlhttpRequest';
			// Safari is a bastard.  Since it doesn't provide legitimate callbacks, I have to store the onload function here
			// in the main userscript in a queue (see xhrQueue), wait for data to come back from the background page, then call the onload. Damn this sucks.
			// See how much easier it was up there in the Chrome statement?  Damn.
			if (typeof(obj.onload) != 'undefined') {
				obj.XHRID = xhrQueue.count;
				xhrQueue.onloads[xhrQueue.count] = obj.onload;
				safari.self.tab.dispatchMessage("GM_xmlhttpRequest", obj);
				xhrQueue.count++;
			}
		}
	} else if (typeof(opera) != 'undefined') {
		GM_xmlhttpRequest = function(obj) {
			obj.requestType = 'GM_xmlhttpRequest';
			// Turns out, Opera works this way too, but I'll forgive them since their extensions are so young and they're awesome people...
			// Really though, we need callbacks like Chrome has!  This is such a hacky way to emulate GM_xmlhttpRequest.

			// oy vey... another problem. When Opera sends xmlhttpRequests from the background page, it loses the cookies etc that it'd have 
			// had from the foreground page... so we need to write a bit of a hack here, and call different functions based on whether or 
			// not the request is cross domain... For same-domain requests, we'll call from the foreground...
			var crossDomain = (obj.url.indexOf(location.hostname) == -1);
			
			if ((typeof(obj.onload) != 'undefined') && (crossDomain)) {
				obj.XHRID = xhrQueue.count;
				xhrQueue.onloads[xhrQueue.count] = obj.onload;
				opera.extension.postMessage(JSON.stringify(obj));
				xhrQueue.count++;
			} else {
				var request=new XMLHttpRequest();
				request.onreadystatechange=function() { if(obj.onreadystatechange) { obj.onreadystatechange(request); }; if(request.readyState==4 && obj.onload) { obj.onload(request); } }
				request.onerror=function() { if(obj.onerror) { obj.onerror(request); } }
				try { request.open(obj.method,obj.url,true); } catch(e) { if(obj.onerror) { obj.onerror( {readyState:4,responseHeaders:'',responseText:'',responseXML:'',status:403,statusText:'Forbidden'} ); }; return; }
				if(obj.headers) { for(name in obj.headers) { request.setRequestHeader(name,obj.headers[name]); } }
				request.send(obj.data); return request;
			}
		}
	} else {
		GM_xmlhttpRequest=function(obj) {
			var request=new XMLHttpRequest();
			request.onreadystatechange=function() { if(obj.onreadystatechange) { obj.onreadystatechange(request); }; if(request.readyState==4 && obj.onload) { obj.onload(request); } }
			request.onerror=function() { if(obj.onerror) { obj.onerror(request); } }
			try { request.open(obj.method,obj.url,true); } catch(e) { if(obj.onerror) { obj.onerror( {readyState:4,responseHeaders:'',responseText:'',responseXML:'',status:403,statusText:'Forbidden'} ); }; return; }
			if(obj.headers) { for(name in obj.headers) { request.setRequestHeader(name,obj.headers[name]); } }
			request.send(obj.data); return request;
		}
	}

}
JSON.stringify = JSON.stringify || function (obj) {  
    var t = typeof (obj);  
    if (t != "object" || obj === null) {  
        // simple data type  
        if (t == "string") obj = '"'+obj+'"';  
        return String(obj);  
    }  
    else {  
        // recurse array or object  
        var n, v, json = [], arr = (obj && obj.constructor == Array);  
        for (n in obj) {  
            v = obj[n]; t = typeof(v);  
            if (t == "string") v = '"'+v+'"';  
            else if (t == "object" && v !== null) v = JSON.stringify(v);  
            json.push((arr ? "" : '"' + n + '":') + String(v));  
        }  
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");  
    }  
};  

// implement JSON.parse de-serialization  
JSON.parse = JSON.parse || function (str) {  
	if (str === "") str = '""';  
	eval("var p=" + str + ";");  
	return p;  
};  
function post_to_url(path, params, method, target) 
{
    method = method || "post"; // Set method to post by default, if not specified.
	target = target || "_self";

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    form.setAttribute("target", target);

    for(var key in params) {
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", params[key]);

        form.appendChild(hiddenField);
    }

    document.body.appendChild(form);
    form.submit();
}

function associativeArrayToString(arr)
{
	var str = "{ ";
	for(var key in arr)
	{
		str += "'" + key + "' : '" + arr[key] + "', ";
	}
	str = str.replace(/,[\s]*$/, '');
	str += "}";
	return str;
}
/*
 * splits a string up into tokens based on word boundaries
 *
 * For example. "how    are you doin." is transformed into
 * "how" "are" "you" "doin."
 *
 * @return array of strings 
 */

function tokenize(str)
{
	str = str.match(/[A-Za-z0-9.-]+/g) + "";
	return str.split(',');
}


function toggleColumn(element, n) {
    var object = document.getElementById(element);
	if(hasClass(object, "hide" + n))
		removeClass(object, "hide" + n);
	else
		addClass(object, "hide" + n);
}

function createToggleColumnElement(container, n, label, id)
{
	id = id || "enhanced";

	var divContainer = document.createElement("div");
	divContainer.setAttribute("class", "checkboxElement");

	var toggleColElement = document.createElement("input");

	toggleColElement.setAttribute("type", "checkbox");
	toggleColElement.setAttribute("onclick", 'toggleColumn("' + id + '", ' + n + ')');
	var toggleColLabel = document.createTextNode(label);
	toggleColElement.addEventListener("click", function() { 
			if(GM_getValue("isCol" + n) == false) 
				GM_setValue("isCol" + n, true); 
			else 
				GM_setValue("isCol" + n, false); 
		}, false);
	
    var currentClass = document.getElementById(id).className;

	if(GM_getValue("isCol" + n) != false)
	{
        document.getElementById(id).className = currentClass.replace("hide"+n, "");
		toggleColElement.setAttribute("checked", "yes");
	}
	else
        document.getElementById(id).className += " " + "hide"+n;

	divContainer.appendChild(toggleColElement);
	divContainer.appendChild(toggleColLabel);

	container.appendChild(divContainer);
}

function popupwindow(url, name, width, height)
{
	var newwindow = window.open(url, name, "width=" + width + ",height=" + height);
	if(window.focus) { newwindow.focus() }
	return false;
}

function highlightRow(element) 
{
	if(hasClass(element, "highlightonclick"))
		removeClass(element, "highlightonclick");
	else
		addClass(element, "highlightonclick");
}

function addHighlightedCourse(crs)
{
	UCBSE.highlightedCourses.push(crs);
	GM_setValue("highlightArrayJSON", JSON.stringify(UCBSE.highlightedCourses));

	var counter = document.getElementById("counter");
	counter.innerHTML = UCBSE.highlightedCourses.length;
}

function removeHighlightedCourse(crs, foundIndex)
{
	foundIndex = foundIndex || UCBSE.searchCourses(crs, UCBSE.highlightedCourses);

	UCBSE.highlightedCourses.splice(foundIndex, 1);
	GM_setValue("highlightArrayJSON", JSON.stringify(UCBSE.highlightedCourses));

	var counter = document.getElementById("counter");
	counter.innerHTML = UCBSE.highlightedCourses.length;
}

function highlightListener(crs) 
{
	var foundIndex = UCBSE.searchCourses(crs, UCBSE.highlightedCourses);

	if(foundIndex != null)	// null needed
		removeHighlightedCourse(crs, foundIndex);
	else
		addHighlightedCourse(crs);

	highlightedCoursesTableCreator(UCBSE.highlightedCoursesContainer);
}

function schedulebuilderListener(crs)
{
	try
	{
		GM_xmlhttpRequest({method: 'GET', 
			url: 'http://schedulebuilder.berkeley.edu/explore/department/' + crs.getSchedulebuilderId() + '/' + UCBSE.term + '/' + UCBSE.year + '/courses.json', 
			onload: function(response) {
				var my_data = JSON.parse(response.responseText);
				for(var i = 0, len = my_data.courses.length; i < len; i++)
				{
					if(my_data.courses[i].identifier == crs.getCourseNum())
					{
						window.open('http://schedulebuilder.berkeley.edu/explore/course/' + my_data.courses[i].id + '/');
						break;
					}	
				}
			}
		 })
	}
	catch(err)
	{
		alert("It looks like your browser dosent support GM_xmlhttpRequest. The schedulebuilder link cannot work without it. Please use a different browser such as Firefox or Chrome.");
	}
}


function toggleClassPersistent(gmid)
{
	if(GM_getValue(gmid) != false)
	{
		GM_setValue(gmid, false);
	}
	else
	{
		GM_setValue(gmid, true);
	}
}

function highlightedCoursesTableCreator(container)
{
	var table = document.createElement("table");
	table.setAttribute("cellspacing", "0");
	var tableHTML = "";
	
	tableHTML += '<thead><tr>';
	tableHTML += '<th></th>';
	tableHTML += '<th>CCN</th>';
	tableHTML += '<th colspan="3" align="left">Course</th>';
	tableHTML += '<th align="left">Class<br>Type</th>';
	tableHTML += '<th align="left">Section<br>Number</th>';
	tableHTML += '<th align="left">Units</th>';
	tableHTML += '<th align="left">Instructor</th>';
	tableHTML += '<th align="left">Days</th>';
	tableHTML += '<th align="left">Time</th>';
	tableHTML += '<th align="left">Location</th>';
	tableHTML += '<th></th>';
	tableHTML += '</tr></thead>';
	table.innerHTML = tableHTML;

	for(var i = 0, len = UCBSE.highlightedCourses.length; i < len; i++)
	{
		var row = document.createElement("tr");
		var crs = UCBSE.highlightedCourses[i];
		var rowHTML = "";
	
		rowHTML += '<td style="white-space:nowrap;">[ <a>X</a> ]</td>';
		rowHTML += '<td><input type="text" onclick="select()" class="ccnInput" value="' + nullToEmpty(crs.ccn) + '" ></td>';
		rowHTML += "<td>" + nullToEmpty(crs.departmentAbrev) + "</td>";
		rowHTML += "<td>" + nullToEmpty(crs.courseNum) + "</td>";
		rowHTML += "<td>" + nullToEmpty(crs.title) + "</td>";
		rowHTML += "<td>" + nullToEmpty(crs.classType) + "</td>";
		rowHTML += "<td>" + nullToEmpty(crs.secNum) + "</td>";
		rowHTML += "<td>" + nullToEmpty(crs.units) + "</td>";
		rowHTML += "<td>" + nullToEmpty(crs.instructor) + "</td>";
		rowHTML += "<td>" + nullToEmpty(crs.days) + "</td>";
		rowHTML += "<td>" + nullToEmpty(crs.time) + "</td>";
		rowHTML += "<td>" + nullToEmpty(crs.room) + "</td>";
		rowHTML += "<td>";
			if(crs.enrollmentLink == true)
				rowHTML += '<a href="http://infobears.berkeley.edu:3400/osc/?_InField1=RESTRIC&_InField2=' + crs.ccn + '&_InField3=12B4" target="_blank" alt="Enrollment">[E]</a> ';
			if(crs.bookLink)
				rowHTML += '<a href="' + crs.bookLink + '" target="_blank" alt="Books">[B]</a>';
		rowHTML += "</td>";
		row.innerHTML = rowHTML;

		var deleteLink = row.getElementsByTagName("a")[0];
		deleteLink.addEventListener("click", (function(course) {
				return function() {
					removeHighlightedCourse(course);

					// render new updated table
					highlightedCoursesTableCreator(container);

					UCBSE.tbodyCoursesHTML = UCBSE.tbodyCoursesHTML || UCBSE.table.getElementsByClassName("course");

					var ElementToRemoveHighlight = UCBSE.tbodyCoursesHTML[ UCBSE.searchCourses(course, UCBSE.courseList) ];


					removeClass(ElementToRemoveHighlight, "highlightonclick");
				}
			}(crs)), false);

		table.appendChild(row);
	}
	
	var footer = document.createElement("tfoot");
	var footerRow = document.createElement("tr");
	var left = document.createElement("td");
	left.setAttribute("colspan", "6");

	var clearLinkContainer = document.createElement("div");
	var clearLink = document.createElement("a");
	clearLink.innerHTML = "clear all highlighted courses"; 
	clearLink.addEventListener("click", function() {
			var r = confirm("Are you sure you want to clear all highlighted courses?");
			if(r == true)
			{
				UCBSE.highlightedCourses = Array();
				GM_setValue("highlightArrayJSON", JSON.stringify(UCBSE.highlightedCourses));
				highlightedCoursesTableCreator(container);
			}
		}, false);
	clearLinkContainer.appendChild(document.createTextNode("[ "));
	clearLinkContainer.appendChild(clearLink);
	clearLinkContainer.appendChild(document.createTextNode(" ]"));
	left.appendChild(clearLinkContainer);
	footerRow.appendChild(left);

	var right = document.createElement("td");
	right.setAttribute("colspan", "7");
	right.appendChild(closeContainer("highlightedCourses", 800, "isHigh"));
	footerRow.appendChild(right);

	footer.appendChild(footerRow);
	table.appendChild(footer);

	if(container.firstChild)
		container.replaceChild(table, container.firstChild);
	else
	{
		container.appendChild(table);
	}

}

function closeContainer(id, colNum, gmValue)
{
	var close = document.createElement("div");
	close.setAttribute("id","close");
	close.appendChild(document.createTextNode("[ "));

	var link = document.createElement("a");
	link.innerHTML = "close";
	link.setAttribute("onclick", "toggleColumn('" + id + "', " + colNum + ")");

	if(typeof gmValue !==  undefined)
	{
		link.addEventListener("click", function() { toggleClassPersistent(gmValue); }, false);
	}

	close.appendChild(link);

	close.appendChild(document.createTextNode(" ]"));


	return close;
}
/*
 * converts spaces to +
 *
 * @return string
 */
function spaceToPlus(str)
{
	return str.replace(' ', '+');
}

/*
 * strips a string of its HTML tags
 *
 * @return string
 */
function strip(html)
{
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent||tmp.innerText;
}

function insertAfter( referenceNode, newNode )
{
    referenceNode.parentNode.insertBefore( newNode, referenceNode.nextSibling );
}

function toggleMaximize()
{
	var table = document.getElementById('enhanced');
	if( hasClass(table, 'enhancedFull'))
	{
		GM_setValue("isMaximum", false);
		removeClass(table, 'enhancedFull');
		addClass(table, 'enhanced');
	}
	else
	{
		removeClass(table, 'enhanced');
		addClass(table, 'enhancedFull');
		GM_setValue("isMaximum", true);
	}

}

function toggleCCNBg()
{
    var currentClass = document.getElementById("enhanced");

	if(GM_getValue("isBg") == false)
	{
		removeClass(currentClass, "nobg");
		GM_setValue("isBg", true);
	}
	else
	{
		addClass(currentClass, "nobg");
		GM_setValue("isBg", false);
	}
}

function hasClass(ele,cls) 
{
	if ((typeof(ele) == 'undefined') || (ele == null)) {
		return false;
	}
	return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}

function addClass(ele,cls) 
{
	if (!hasClass(ele,cls)) ele.className += " "+cls;
}

function removeClass(ele,cls) 
{
	if (hasClass(ele,cls)) {
		var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		ele.className=ele.className.replace(reg,' ');
	}
}

/*
 * strips a string of the trailing and leading whitespace
 *
 * @return string
 */
function stripSpace(str)
{
	return str.replace(/^(\s|&nbsp;)+/, "").replace(/(\s|&nbsp)+$/, "");
}

/*
 * @return null to empty string
 */
function nullToEmpty(str)
{
	if(str)
		return str;
	else
		return "";
}


var UCBSE = UCBSE || {};

if(GM_getValue("highlightArrayJSON"))
	UCBSE.highlightedCourses = JSON.parse(GM_getValue("highlightArrayJSON"));
else
	UCBSE.highlightedCourses = new Array();

var temp = tokenize(strip((document.body.innerHTML.match(/request for .+:/) + "").replace("request for ", "").replace(":",  "")));

UCBSE.term = temp[0]
UCBSE.year = temp[1]

UCBSE.searchCourses = function(needle, haystack)
{
	haystack = haystack || this.courseList;
	needle.ccn = needle.ccn || needle.getCCN();
	needle.courseNum = needle.courseNum || needle.getCourseNum();
	needle.secNum = needle.secNum || needle.getSecNum();
	needle.classType = needle.classType || needle.getClassType();

	for(i = 0; i < haystack.length; i++)
	{
		var crs = haystack[i];
		if(	needle.ccn == crs.ccn &&
			needle.courseNum == crs.courseNum &&
			needle.secNum == crs.secNum &&
			needle.classType == crs.classType
		  )
			return i;
	}
	return null;
}



// -- cache --
// Used for caching. Massive speed boost!
UCBSE.prevDept = "";
UCBSE.prevDeptAbrev = "";
UCBSE.tbodyCoursesHTML;



UCBSE.Course = function()
{
	// private attributes 
	
	var DEPARTMENTS = {
		"AEROSPACE STUDIES" : { abrev: "AEROSPC", schedulebuilderId: 97 },
		"AFRICAN AMERICAN STUDIES" : { abrev: "AFRICAM", schedulebuilderId: 1 },
		"AGRICULTURAL AND ENVIRON CHEMISTRY" : { abrev: "AGR CHM", schedulebuilderId: 2 },
		"ANCIENT HISTORY AND MED. ARCH." : { abrev: "AHMA", schedulebuilderId: 6 },
		"AMERICAN STUDIES" : { abrev: "AMERSTD", schedulebuilderId: 5 },
		"ANTHROPOLOGY" : { abrev: "ANTHRO", schedulebuilderId: 7 },
		"ARABIC" : { abrev: "ARABIC", schedulebuilderId: 106 },
		"ARCHITECTURE" : { abrev: "ARCH", schedulebuilderId: 9 },
		"AGRICULTURAL AND RESOURCE ECONOMICS" : { abrev: "A,RESEC", schedulebuilderId: 4 },
		"PRACTICE OF ART" : { abrev: "ART", schedulebuilderId: 11 },
		"ASIAN AMERICAN STUDIES" : { abrev: "ASAMST", schedulebuilderId: 13 },
		"ASIAN STUDIES" : { abrev: "ASIANST", schedulebuilderId: 14 },
		"APPLIED SCIENCE AND TECHNOLOGY" : { abrev: "AST", schedulebuilderId: 8 },
		"ASTRONOMY" : { abrev: "ASTRON", schedulebuilderId: 15 },
		"BENGALI" : { abrev: "BANGLA", schedulebuilderId: 142 },
		"BIOENGINEERING" : { abrev: "BIO ENG", schedulebuilderId: 16 },
		"BIOLOGY" : { abrev: "BIOLOGY", schedulebuilderId: 159 },
		"BIOPHYSICS" : { abrev: "BIOPHY", schedulebuilderId: 17 },
		"BUDDHISM" : { abrev: "BUDDHSM" },
		"GROUP IN BUDDHIST STUDIES" : { abrev: "BUDDSTD", schedulebuilderId: 18 },
		"CATALAN" : { abrev: "CATALAN", schedulebuilderId: 154 },
		"CELTIC STUDIES" : { abrev: "CELTIC", schedulebuilderId: 26 },
		"COMPUTATIONAL AND GENOMIC BIOLOGY" : { abrev: "CGB", schedulebuilderId: 39 },
		"CHEMISTRY" : { abrev: "CHEM", schedulebuilderId: 28 },
		"CHICANO STUDIES" : { abrev: "CHICANO", schedulebuilderId: 29 },
		"CHINESE" : { abrev: "CHINESE", schedulebuilderId: 45 },
		"CHEMICAL & BIOMOLECULAR ENGINEERING" : { abrev: "CHM ENG", schedulebuilderId: 27 },
		"CIVIL AND ENVIRONMENTAL ENGINEERING" : { abrev: "CIV ENG", schedulebuilderId: 31 },
		"CLASSICS" : { abrev: "CLASSIC", schedulebuilderId: 32 },
		"NEW MEDIA" : { abrev: "CNM", schedulebuilderId: 115 },
		"COGNITIVE SCIENCE" : { abrev: "COG SCI", schedulebuilderId: 35 },
		"COLLEGE WRITING PROGRAM" : { abrev: "COLWRIT", schedulebuilderId: 36 },
		"COMPARATIVE LITERATURE" : { abrev: "COM LIT", schedulebuilderId: 38 },
		"COMPARATIVE BIOCHEMISTRY" : { abrev: "COMPBIO", schedulebuilderId: 37 },
		"COMPUTER SCIENCE" : { abrev: "COMPSCI", schedulebuilderId: 53 },
		"CRITICAL THEORY GRADUATE GROUP" : { abrev: "CRIT TH", schedulebuilderId: 40 },
		"CUNEIFORM" : { abrev: "CUNEIF", schedulebuilderId: 107 },
		"CITY AND REGIONAL PLANNING" : { abrev: "CY PLAN", schedulebuilderId: 30 },
		"DEMOGRAPHY" : { abrev: "DEMOG", schedulebuilderId: 41 },
		"DEVELOPMENT STUDIES" : { abrev: "DEV STD", schedulebuilderId: 42 },
		"DUTCH" : { abrev: "DUTCH", schedulebuilderId: 70 },
		"EAST EUROPEAN STUDIES" : { abrev: "EAEURST", schedulebuilderId: 135 },
		"EAST ASIAN LANGUAGES AND CULTURES" : { abrev: "EA LANG", schedulebuilderId: 44 },
		"ECONOMICS" : { abrev: "ECON", schedulebuilderId: 50 },
		"EDUCATION" : { abrev: "EDUC", schedulebuilderId: 51 },
		"EGYPTIAN" : { abrev: "EGYPT", schedulebuilderId: 108 },
		"ELECTRICAL ENGINEERING" : { abrev: "EL ENG", schedulebuilderId: 52 },
		"ENERGY AND RESOURCES GROUP" : { abrev: "ENE,RES", schedulebuilderId: 54 },
		"ENGINEERING" : { abrev: "ENGIN", schedulebuilderId: 55 },
		"ENGLISH" : { abrev: "ENGLISH", schedulebuilderId: 56 },
		"ENVIRONMENTAL DESIGN" : { abrev: "ENV DES", schedulebuilderId: 57 },
		"ENVIRONMENTAL ECONOMICS AND POLICY" : { abrev: "ENVECON", schedulebuilderId: 3 },
		"ENVIRONMENTAL SCIENCES" : { abrev: "ENV SCI", schedulebuilderId: 59 },
		"EARTH AND PLANETARY SCIENCE" : { abrev: "EPS", schedulebuilderId: 43 },
		"ENVIRON SCI POLICY, AND MANAGEMENT" : { abrev: "ESPM", schedulebuilderId: 58 },
		"ETHNIC STUDIES GRADUATE GROUP" : { abrev: "ETH GRP", schedulebuilderId: 61 },
		"ETHNIC STUDIES" : { abrev: "ETH STD", schedulebuilderId: 60 },
		"EURASIAN STUDIES" : { abrev: "EURA ST", schedulebuilderId: 136 },
		"EVE/WKND MASTERS IN BUS. ADM." : { abrev: "EWMBA", schedulebuilderId: 22 },
		"FILIPINO" : { abrev: "FILIPN", schedulebuilderId: 162 },
		"FILM AND MEDIA" : { abrev: "FILM", schedulebuilderId: 62 },
		"FOLKLORE" : { abrev: "FOLKLOR", schedulebuilderId: 63 },
		"FRENCH" : { abrev: "FRENCH", schedulebuilderId: 64 },
		"GEOGRAPHY" : { abrev: "GEOG", schedulebuilderId: 67 },
		"GERMAN" : { abrev: "GERMAN", schedulebuilderId: 68 },
		"GLOBAL METROPOLITAN STUDIES" : { abrev: "GMS", schedulebuilderId: 1170 },
		"GLOBAL POVERTY AND PRACTICE" : { abrev: "GPP", schedulebuilderId: 204 },
		"GREEK" : { abrev: "GREEK", schedulebuilderId: 33 },
		"GRAD STUDENT PROF DEVELOPMENT PGM" : { abrev: "GSPDP", schedulebuilderId: 72 },
		"GENDER AND WOMEN'S STUDIES" : { abrev: "GWS", schedulebuilderId: 65 },
		"HEBREW" : { abrev: "HEBREW", schedulebuilderId: 109 },
		"HINDI-URDU" : { abrev: "HIN-URD", schedulebuilderId: 143 },
		"HISTORY OF ART" : { abrev: "HISTART", schedulebuilderId: 12 },
		"HISTORY" : { abrev: "HISTORY", schedulebuilderId: 75 },
		"HEALTH AND MEDICAL SCIENCES" : { abrev: "HMEDSCI", schedulebuilderId: 74 },
		"INTERNATIONAL AND AREA STUDIES" : { abrev: "IAS", schedulebuilderId: 80 },
		"INTERDEPARTMENTAL STUDIES" : { abrev: "IDS"},
		"INDIGENOUS LANGUAGES OF AMERICAS" : { abrev: "ILA", schedulebuilderId: 155 },
		"INDUSTRIAL ENGIN AND OPER RESEARCH" : { abrev: "IND ENG", schedulebuilderId: 76 },
		"INFORMATION" : { abrev: "INFO", schedulebuilderId: 77 },
		"INFORMATION SYSTEMS AND MANAGEMENT" : { abrev: "INFOSYS"},
		"INTEGRATIVE BIOLOGY" : { abrev: "INTEGBI", schedulebuilderId: 78 },
		"IRANIAN" : { abrev: "IRANIAN", schedulebuilderId: 111 },
		"INTERDISCIPLINARY STUDIES FIELD MAJ" : { abrev: "ISF", schedulebuilderId: 79 },
		"ITALIAN STUDIES" : { abrev: "ITALIAN", schedulebuilderId: 81 },
		"JAPANESE" : { abrev: "JAPAN", schedulebuilderId: 46 },
		"JEWISH STUDIES" : { abrev: "JEWISH", schedulebuilderId: 82 },
		"JOURNALISM" : { abrev: "JOURN", schedulebuilderId: 83 },
		"KHMER" : { abrev: "KHMER", schedulebuilderId: 144 },
		"KOREAN" : { abrev: "KOREAN", schedulebuilderId: 48 },
		"LANGUAGE PROFICIENCY PROGRAM" : { abrev: "LAN PRO", schedulebuilderId: 73 },
		"LANGUAGE PROFICIENCY PROGRAM" : { abrev: "LANGPRO"},
		"LATIN AMERICAN STUDIES" : { abrev: "LATAMST", schedulebuilderId: 85 },
		"LATIN" : { abrev: "LATIN", schedulebuilderId: 34 },
		"LAW" : { abrev: "LAW", schedulebuilderId: 86 },
		"LANDSCAPE ARCHITECTURE" : { abrev: "LD ARCH", schedulebuilderId: 84 },
		"LEGAL STUDIES" : { abrev: "LEGALST", schedulebuilderId: 87 },
		"LESBIAN GAY BISEXUAL TRANSGENDER ST" : { abrev: "LGBT", schedulebuilderId: 66 },
		"LINGUISTICS" : { abrev: "LINGUIS", schedulebuilderId: 89 },
		"LETTERS AND SCIENCE" : { abrev: "LNS", schedulebuilderId: 88 },
		"MALAY/INDONESIAN" : { abrev: "MALAY/I", schedulebuilderId: 145 },
		"MASS COMMUNICATIONS" : { abrev: "MASSCOM", schedulebuilderId: 90 },
		"MATHEMATICS" : { abrev: "MATH", schedulebuilderId: 92 },
		"MATERIALS SCIENCE AND ENGINEERING" : { abrev: "MAT SCI", schedulebuilderId: 91 },
		"MASTERS IN BUSINESS ADMINISTRATION" : { abrev: "MBA", schedulebuilderId: 21 },
		"MOLECULAR AND CELL BIOLOGY" : { abrev: "MCELLBI", schedulebuilderId: 100 },
		"MECHANICAL ENGINEERING" : { abrev: "MEC ENG", schedulebuilderId: 93 },
		"MEDIA STUDIES" : { abrev: "MEDIAST", schedulebuilderId: 160 },
		"MEDIEVAL STUDIES" : { abrev: "MED ST", schedulebuilderId: 94 },
		"MIDDLE EASTERN STUDIES" : { abrev: "M E STU", schedulebuilderId: 95 },
		"MASTERS IN FINANCIAL ENGINEERING" : { abrev: "MFE", schedulebuilderId: 24 },
		"MILITARY AFFAIRS" : { abrev: "MIL AFF", schedulebuilderId: 96 },
		"MILITARY SCIENCE" : { abrev: "MIL SCI", schedulebuilderId: 98 },
		"MUSIC" : { abrev: "MUSIC", schedulebuilderId: 101 },
		"NATIVE AMERICAN STUDIES" : { abrev: "NATAMST", schedulebuilderId: 103 },
		"NATURAL RESOURCES" : { abrev: "NAT RES", schedulebuilderId: 104 },
		"NAVAL SCIENCE" : { abrev: "NAV SCI", schedulebuilderId: 99 },
		"NEAR EASTERN STUDIES" : { abrev: "NE STUD", schedulebuilderId: 105 },
		"NEUROSCIENCE" : { abrev: "NEUROSC", schedulebuilderId: 114 },
		"NANOSCALE SCIENCE AND ENGINEERING" : { abrev: "NSE", schedulebuilderId: 102 },
		"NUCLEAR ENGINEERING" : { abrev: "NUC ENG", schedulebuilderId: 116 },
		"NUTRITIONAL SCIENCES AND TOXICOLOGY" : { abrev: "NUSCTX", schedulebuilderId: 117 },
		"NEW MEDIA" : { abrev: "NWMEDIA", schedulebuilderId: 115 },
		"OCEAN ENGINEERING" : { abrev: "OC ENG", }, 
		"OPTOMETRY" : { abrev: "OPTOM", schedulebuilderId: 118 },
		"PEACE AND CONFLICT STUDIES" : { abrev: "PACS", schedulebuilderId: 120 },
		"PUBLIC HEALTH" : { abrev: "PB HLTH", schedulebuilderId: 128 },
		"PERSIAN" : { abrev: "PERSIAN", schedulebuilderId: 110 },
		"PH.D. IN BUSINESS ADMINISTRATION" : { abrev: "PHDBA", schedulebuilderId: 25 },
		"PHILOSOPHY" : { abrev: "PHILOS", schedulebuilderId: 121 },
		"PHYSICAL EDUCATION" : { abrev: "PHYS ED", schedulebuilderId: 122 },
		"PHYSICS" : { abrev: "PHYSICS", schedulebuilderId: 123 },
		"PLANT AND MICROBIAL BIOLOGY" : { abrev: "PLANTBI", schedulebuilderId: 124 },
		"POLITICAL ECONOMY OF INDUSTRIAL SOC" : { abrev: "POLECIS", schedulebuilderId: 125 },
		"POLITICAL SCIENCE" : { abrev: "POL SCI", schedulebuilderId: 126 },
		"PORTUGUESE" : { abrev: "PORTUG", schedulebuilderId: 153 },
		"PSYCHOLOGY" : { abrev: "PSYCH", schedulebuilderId: 127 },
		"PUBLIC POLICY" : { abrev: "PUB POL", schedulebuilderId: 129 },
		"PUNJABI" : { abrev: "PUNJABI", schedulebuilderId: 146 },
		"RELIGIOUS STUDIES" : { abrev: "RELIGST", schedulebuilderId: 130 },
		"RHETORIC" : { abrev: "RHETOR", schedulebuilderId: 131 },
		"SANSKRIT" : { abrev: "SANSKR", schedulebuilderId: 147 },
		"SOUTH ASIAN" : { abrev: "S ASIAN", schedulebuilderId: 140 },
		"SCANDINAVIAN" : { abrev: "SCANDIN", schedulebuilderId: 132 },
		"SCIENCE AND MATHEMATICS EDUCATION" : { abrev: "SCMATHE", schedulebuilderId: 133 },
		"SOUTHEAST ASIAN" : { abrev: "SEASIAN", schedulebuilderId: 141 },
		"SEMITICS" : { abrev: "SEMITIC", schedulebuilderId: 112 },
		"SLAVIC LANGUAGES AND LITERATURES" : { abrev: "SLAVIC", schedulebuilderId: 134 },
		"SOCIOLOGY" : { abrev: "SOCIOL", schedulebuilderId: 138 },
		"SOCIAL WELFARE" : { abrev: "SOC WEL", schedulebuilderId: 137 },
		"SPANISH" : { abrev: "SPANISH", schedulebuilderId: 152 },
		"SOUTH AND SOUTHEAST ASIAN STUDIES" : { abrev: "S,SEASN", schedulebuilderId: 139 },
		"STATISTICS" : { abrev: "STAT", schedulebuilderId: 156 },
		"STUDIES" : { abrev: "STUDIES"},
		"TAGALOG" : { abrev: "TAGALG", schedulebuilderId: 148 },
		"TAMIL" : { abrev: "TAMIL", schedulebuilderId: 149 },
		"TELUGU" : { abrev: "TELUGU", schedulebuilderId: 161 },
		"THAI" : { abrev: "THAI", schedulebuilderId: 150 },
		"THEATER DANCE, AND PERFORMANCE ST" : { abrev: "THEATER", schedulebuilderId: 157 },
		"TIBETAN" : { abrev: "TIBETAN", schedulebuilderId: 49 },
		"TURKISH" : { abrev: "TURKISH", schedulebuilderId: 113 },
		"UNDERGRAD. BUSINESS ADMINISTRATION" : { abrev: "UGBA", schedulebuilderId: 20 },
		"UNDERGRAD INTERDISCIPLINARY STUDIES" : { abrev: "UGIS", schedulebuilderId: 158 },
		"UNIVERSITY EXTENSION" : { abrev: "UNIVEXT"},
		"VIETNAMESE" : { abrev: "VIETNMS", schedulebuilderId: 151 },
		"VISION SCIENCE" : { abrev: "VIS SCI", schedulebuilderId: 119 },
		"VISUAL STUDIES" : { abrev: "VIS STD", schedulebuilderId: 10 },
		"EXECUTIVE MASTERS IN BUS. ADM." : { abrev: "XMBA", schedulebuilderId: 23 },
		"YIDDISH" : { abrev: "YIDDISH", NINJACOURSESID: 69 },

	};

	var department = null;
	var courseNum = null;
	var departmentAbrev = null;
	var ccn = null;
	var ps = null;
	var secNum = null;
	var classType = null;
	var title = null;
	var catalogDescLink = null;
	var locn = null;
	var instructor = null;
	var lastName = null;
	var note = null;
	var bookLink = null;
	var units = null;
	var finalExamGroup = null;
	var restrictions = null;
	var limit = null;
	var enrolled = null;
	var waitlist = null;
	var availSeats = null;
	var enrollmentLink = null;
	var enrollmentMsg = null;
	var statusLastChanged = null;
	var sessionDates = null;
	var summerFees = null;
	var courseWebsite = null;
	var days = null;
	var room = null;
	var time = null;
	var inField3 = null;

	// private methods
	
	/**
	 * Gets the apartments abbreviation
	 * @param str department name
	 * @return department abbreviation 
	 */
	var _getDeptAbrev = function(str)
	{
		if(DEPARTMENTS.hasOwnProperty(str))
			return DEPARTMENTS[str].abrev;
		else
			return str;
	};


	return {
		// public attributes	

		// public methods
		getSchedulebuilderId: function()
		{
			var str = this.department;
			if(DEPARTMENTS.hasOwnProperty(str) && DEPARTMENTS[str].hasOwnProperty('schedulebuilderId'))
				return DEPARTMENTS[str].schedulebuilderId;
			else
				return null;
		},
	
		getDepartment: 			function(){ return this.department; },
		getDepartmentAbrev: 	function(){ return this.departmentAbrev; },
		getCourseNum: 			function(){ return this.courseNum; },
		getCCN: 				function(){ return this.ccn; },
		getPS: 					function(){ return this.ps; },
		getSecNum: 				function(){ return this.secNum; },
		getClassType: 			function(){ return this.classType; },
		getTitle: 				function(){ return this.title; },
		getCatalogDescLink: 	function(){ return this.catalogDescLink; },
		getLocn: 				function(){ return this.locn; },
		getInstructor: 			function(){ return this.instructor; },
		getLastName: 			function(){ return this.lastName; },
		getNote: 				function(){ return this.note; },
		getBookLink: 			function(){ return this.bookLink; },
		getUnits: 				function(){ return this.units; },
		getFinalExamGroup: 		function(){ return this.finalExamGroup; },
		getRestrictions: 		function(){ return this.restrictions; },
		getLimit: 				function(){ return this.limit; },
		getEnrolled: 			function(){ return this.enrolled; },
		getWaitlist: 			function(){ return this.waitlist; },
		getAvailSeats: 			function(){ return this.availSeats; },
		getEnrollmentLink: 		function(){ return this.enrollmentLink; },
		getEnrollmentMsg: 		function(){ return this.enrollmentMsg; },
		getStatusLastChanged: 	function(){ return this.statusLastChanged; },
		getSessionDates: 		function(){ return this.sessionDates; },
		getSummerFees: 			function(){ return this.summerFees; },
		getCourseWebsite: 		function(){ return this.courseWebsite; },
		getDays: 				function(){ return this.days; },
		getRoom: 				function(){ return this.room; },
		getTime: 				function(){ return this.time; },
		getInField3: 			function(){ return this.inField3; },

		setDepartment: 			function(str){ this.department = str; },
		setDepartmentAbrev: 	function(str){ this.departmentAbrev = str; },
		setCCN: 				function(str){ this.ccn = str; },
		setPS: 					function(str){ this.ps = str; },
		setSecNum: 				function(str){ this.secNum = str; },
		setClassType: 			function(str){ this.classType = str; },
		setTitle: 				function(str){ this.title = str; },
		setCatalogDescLink: 	function(str){ this.catalogDescLink = str; },
		setLocn: 				function(str){ this.locn = str; },
		setInstructor: 			function(str){ this.instructor = str; },
		setLastName: 			function(str){ this.lastName = str; },
		setNote: 				function(str){ this.note = str; },
		setBookLink: 			function(str){ this.bookLink = str; },
		setUnits: 				function(str){ this.units = str; },
		setFinalExamGroup: 		function(str){ this.finalExamGroup = str; },
		setRestrictions: 		function(str){ this.restrictions = str; },
		setLimit: 				function(str){ this.limit = str; },
		setEnrolled: 			function(str){ this.enrolled = str; },
		setWaitlist: 			function(str){ this.waitlist = str; },
		setAvailSeats: 			function(str){ this.availSeats = str; },
		setEnrollmentLink: 		function(str){ this.enrollmentLink = str; },
		setEnrollmentMsg: 		function(str){ this.enrollmentMsg = str; },
		setStatusLastChanged: 	function(str){ this.statusLastChanged = str; },
		setSessionDates: 		function(str){ this.sessionDates = str; },
		setSummerFees: 			function(str){ this.summerFees = str; },
		setCourseWebsite: 		function(str){ this.courseWebsite = str; },
		setDays: 				function(str){ this.days = str; },
		setRoom: 				function(str){ this.room = str; },
		setTime: 				function(str){ this.time = str; },

		/**
		 * Parses TT elements
		 * @param table the array of courses
		 * @return locn, instructor, ccn, units, finalexamgroup, restricions, note, enrollment, sessiondates, summer fees set
		 */
		parseTT: function(table)
		{
			var ttArr = table.querySelectorAll('TT');
			var bArr = table.querySelectorAll('TD[ALIGN="right"] FONT[size="1"] B');

			for(var i = 0, len = ttArr.length; i < len; i++)
			{
				var label = bArr[i+1].innerHTML; // we don't want to parse the "Course:"
												 // because it's a special case, so we 
												 // skip it
				
				if(label.match("Location:"))
					this.parseLocn(ttArr[i].innerHTML);
				else if(label.match("Instructor:"))
					this.parseInstructor(ttArr[i].innerHTML);
				else if(label.match("Status/Last Changed:"))
					this.parseStatus(ttArr[i].innerHTML);
				else if(label.match("Course Control Number:"))
					this.parseCourseControlNumber(ttArr[i].innerHTML);
				else if(label.match("Units/Credit:"))
					this.units						= ttArr[i].innerHTML;
				else if(label.match("Final Exam Group:"))
					this.parseFinalExamGroup(ttArr[i].innerHTML);
				else if(label.match("Restrictions:"))
					this.restrictions				= ttArr[i].innerHTML;
				else if(label.match("Note:"))
					this.parseNote(ttArr[i].innerHTML);
				else if(label.match("Enrollment on "))
					this.parseEnrollment(ttArr[i].innerHTML);
				else if(label.match("Session Dates:"))
					this.sessionDates 				= ttArr[i].innerHTML;
				else if(label.match("Summer Fees:"))
					this.summerFees					= ttArr[i].innerHTML;
			}
		},

		/*
		 * @return string the link inside the href property
		 */

		extractHref: function(str)
		{
			if(typeof str != 'string')
				throw new Error("extractHref : Paramater is not a string");

			str = str.match(/(href=\")([^\"]*)(\")/gi);
			if(str == null)
				return null;
			str = str[0];
			str = str.replace(/^href[\s]*=[\s]*"/, '');
			str = str.replace(/\"$/,'');

			return str;
		},

		/**
		 * Selects all TT tags in the entry and sets the according 
		 * properties
		 */

		parseInstructor: function(str)
		{
			if(str)
			{
				this.instructor = stripSpace(str);
				this.lastName = str.replace(/,[^$]*$/g, '');
			}
		},

		parseCourseTitle: function(table)
		{
			var htmlCourseTitle = table.getElementsByClassName("coursetitle")[0];
			this.title = strip(htmlCourseTitle.innerHTML);
		},

		parseLocn: function(str)
		{
			var temp = str.match(/^[\s]*[MTWFuhSA]{1,7}[\s]+[0-9\-AP]+,/);


			if(temp != null)
			{
				days = str.match(/^[\s]*(M|Tu|W|Th|F|SA){1,7}[\s]/);
				if(days)
					this.days = days[0];
				else if(str.match(/^[\s]*MTWTF[\s]/))
					this.days = "MTuWThF";				// this is a special case

				// remove the days
				temp = str.replace(/^[\s]*[MTWFuhSA]{1,7}[\s]*/, '');

				// get the time
				time = temp.match(/^[0-9\-AP]+/);

				if(time != null)
				{
					this.time = time[0];

					// remove the time
					temp = temp.replace(/^[0-9\-AP]+,[\s]*/, '');

					// get the room
					this.room = temp;
				}
			}
			else if(str.match(/^UNSCHED/))
			{
				temp = str.replace(/^UNSCHED\s*/, '');
				this.room = temp;
				this.days = "UNSCHED";
			}
			else if(str.match(/CANCELLED/))
			{
				this.days = "CANCELLED";
			}
			else
				this.locn = str;
		},
		parseCourseControlNumber: function(str)
		{
			var temp = str.match(/^[0-9]+/);

			if(temp != null)
				this.ccn = temp[0];
			else
			{
				temp = str.match(/^[0-9A-Za-z ]+(?=\s*<)?/);
				this.ccn = temp[0];
			}
		},


		parseEnrollment: function(str)
		{
			var temp = str.match(/[0-9]+/g);	

			if(temp == null)
			{
				this.enrollmentMsg = str;
				this.limit = null;
				this.enrolled = null;
				this.waitlist = null;
				this.availSeats = null;
			}
			else
			{
				this.enrollmentMsg = null;
				this.limit = parseInt(temp[0]);
				this.enrolled = parseInt(temp[1]);
				this.waitlist = parseInt(temp[2]);
				this.availSeats = parseInt(temp[3]);
			}
		},

		/*
		 * @return string "javascript:call_to_function()"
		 */
		parseLinks: function(table)
		{
			function getValue(tbl, name)
			{
				for(var i = 0, len = tbl.length; i < len; i++)
					if(tbl[i].getAttribute("name") == name)
						return tbl[i].getAttribute("value");
			}

			var input = table.getElementsByTagName("input");

			for(var i = 0, len = input.length; i < len; i++)
			{
				var temp = input[i].getAttribute("value");
				if(temp.match(/(catalog description)/) != null)
				{
					var catalogDescParams = new Array();

					catalogDescParams['p_dept_name'] = spaceToPlus(stripSpace(this.department));
					catalogDescParams['p_dept_cd'] = spaceToPlus(stripSpace(this.departmentAbrev));
					catalogDescParams['p_title'] = "";
					catalogDescParams['p_number'] = this.courseNum;

					this.catalogDescLink = "http://osoc.berkeley.edu/catalog/gcc_search_sends_request?p_dept_cd=" + catalogDescParams['p_dept_cd'] + "&p_title=&p_number=" + catalogDescParams['p_number'];
				}
				else if(temp.match(/Click here for current enrollment/) != null)
				{
					this.enrollmentLink = true;
					this.inField3 = getValue(input, "_InField3");
				}
				else if(temp.match(/View Books/) != null)
				{
					var bookParams = new Array();

					bookParams['bookstore_id-1'] = getValue(input, "bookstore_id-1");
					bookParams['term_id-1'] = getValue(input, "term_id-1");
					bookParams['div-1'] = getValue(input, "div-1");
					bookParams['crn-1'] = this.ccn;

					this.bookLink = "http://www.bkstr.com/webapp/wcs/stores/servlet/booklookServlet?bookstore_id-1=" + bookParams['bookstore_id-1'] + "&term_id-1=" + bookParams['term_id-1'] + "&crn-1=" + this.ccn;
				}
			}
		},

		/**
		 * Parses the course under the "Course" label
		 */
		parseCourse: function(table)
		{
			var course = table.querySelector('TBODY TR TD FONT[size="2"] B').innerHTML;
			var link = this.extractHref(course);

			if(link)
			{
				this.courseWebsite = link;
				str = course.match(/^[A-Z0-9.,&$#@\s]+/i);
				str = str[0];
			}
			else
				str = course;	

			if(str)
			{
				str = tokenize(str);

				var beginCourseIndex = str.length - 4;
				var courseName = "";

				for(var i = 0; i < beginCourseIndex; i++)
					courseName += str[i] + " ";

				this.department = stripSpace(courseName);					// Department
				
				if(this.department != UCBSE.prevDept)
				{
					UCBSE.prevDept = this.department
					this.departmentAbrev = _getDeptAbrev(this.department); // Department Abrev
					UCBSE.prevDeptAbrev = this.departmentAbrev;
				}
				else
				{
					this.departmentAbrev = UCBSE.prevDeptAbrev;
				}


				this.courseNum = str[beginCourseIndex];			// Course Number
				this.ps = str[beginCourseIndex + 1];			// P/S (not sure what P or S means)
				this.secNum = str[beginCourseIndex + 2];		// Section Number
				this.classType = str[beginCourseIndex + 3];		// Class type (LEC, SEM, LAB, etc.)
			}
		},

		/**
		 * Parses the note. It removes the html code for the space and
		 * sets it to an empty string.
		 */
		parseNote: function(str)
		{
			this.note = stripSpace(str);
		},

		/**
		 * Parses status. removes the html code for the space and sets 
		 * to an empty trying if there is only a space there.
		 */
		parseStatus: function(str)
		{
			this.statusLastChanged = stripSpace(str);
		},

		/**
		 * Removes the date from the Final Exam Group leaving only
		 * the number
		 */
		parseFinalExamGroup: function(str)
		{
			var temp = str.match("^[0-9][0-9]*(?=:)");
			if(temp != null)
				this.finalExamGroup = temp[0];
			else
				this.finalExamGroup = str;
		},

		/**
		 * used for debugging
		 *
		 * @return dump of course object in log
		 */
		log: function()
		{
			console.log('\nTitle: ' + this.title + 
						'\nDepartment: ' + this.department + 
						'\nPS: ' + this.ps + 
						'\nSection Number' + this.secNum + 
						'\nLocation: ' + this.locn +
						'\nClass Type: ' + this.classType + 
						'\nInstructor: ' + this.instructor +
						'\nStatus Last Changed: ' + this.statusLastChanged +
						'\nBook Link: ' + this.bookLink +
						'\nCCN: ' + this.ccn +
						'\nUnits: ' + this.units +
						'\nFinal Exam Group: ' + this.finalExamGroup +
						'\nRestructions: ' + this.restrictions +
						'\nNote: ' + this.note +
						'\nLimit: ' + this.limit +
						'\nEnrolled: ' + this.enrolled +
						'\nWaitlist: ' + this.waitlist +
						'\nAvailble Seats: ' + this.availSeats + 
						'\nCatalog Description Link: ' + this.catalogDescLink + 
						'\nEnrollment Link: ' + this.enrollmentLink + 
						'\nDays: ' + this.days + 
						'\nRoom: ' + this.room + 
						'\nTime: ' + this.time
						);
		},
		/*
		 * Determines if the second row is required
		 *
		 * @return true, false
		 */
		needSecondRow: function()
		{
			if(this.note || this.summerFees || this.sessionDates)
				return true;
			else
				return false;
		},

		/*
		 * Appends row border where specified depending if a 
		 * second row is required
		 *
		 * @return string
		 */
		needRowBorder: function()
		{
			if(!this.needSecondRow())
				return " rowBorder";
			else
				return "";
		},
		fancyCourseControlNumber: function(str)
		{
			var fanCCN = "";
			var cssClass = "";

			if(this.isFull() == 1)
				cssClass += "full";
			else if(this.isFull() == 0)
				cssClass += "open";
			else if(this.isFull() == -1)
				cssClass += "openButWaitlist";
			else
				cssClass += "full";
			
			fanCCN += '<td class="ccn ' + this.needRowBorder() + '"><div class="col2">'
			if(str.match(/[0-9]+/) != null)
				fanCCN += '<input type="text" onclick="select()" class="ccnInput ' + cssClass + '" value="' + str + '" >';
			else
				fanCCN += '<b>' + str + '</b>';
			
			fanCCN += '</div></td>';
			return fanCCN;
		},

		/*
		 * Produces the days in a fancy format
		 *
		 * @return string
		 */
		fancyDays: function(days)
		{
			dayArr = Array();
			fanDays = "";
			
			if(days.match(/UNSCHED/))
				return '<div class="unsched">UNSCHED</div>';
			if(days.match(/CANCELLED/))
				return '<div class="unsched">CANCELLED</div>';
			
			if(days.match(/M/))
				dayArr.push("M");
			else
				dayArr.push("--");

			if(days.match(/Tu/))
				dayArr.push("Tu");
			else
				dayArr.push("--");
			
			if(days.match(/W/))
				dayArr.push("W");
			else
				dayArr.push("--");
			
			if(days.match(/Th/))
				dayArr.push("Th");
			else
				dayArr.push("--");

			if(days.match(/F/))
				dayArr.push("F");
			else
				dayArr.push("--");
			
			if(days.match(/SA/))
				dayArr.push("SA");

			for(var i = 0, len = dayArr.length; i < len; i++)
			{
				day = dayArr.shift();

				if(day != "--")
					fanDays += '<div class="dayActive">' + day + '</div>';
				else
					fanDays += '<div class="dayInactive">' + day + '</div>';
			}

			return fanDays;
		},

		/*
		 * @return 1 if full or canceled, 0 if open, -1 if open but theres a waitlist
		 */
		isFull: function()
		{
			if(!this.days)
				return 0;

			if((this.days).match(/CANCELLED/))
				return 1;
			if(this.limit == this.enrolled)
				return 1;
			if(this.enrolled < this.limit && this.waitlist > 0)
				return -1;
			if(this.enrolled < this.limit)
				return 0;
		},

		isFinalExamGroup: function()
		{
			if(this.finalExamGroup == "")
				return false;
			else 
				return true;
		}
	}
}



/*
 * Parse all the information into an array of courses
 */
UCBSE.courseList = (function()
{
	var entryList = document.querySelectorAll("TABLE");
	var imgList = document.querySelectorAll('IMG[src="http://schedule.berkeley.edu/graphs/hr2.gif"]');
	var courseList = Array();

	for(var i = 1, len = entryList.length; i < len - 1; i++)
	{
		var crs = new UCBSE.Course();

		crs.parseTT(entryList[i]);
		crs.parseCourse(entryList[i]);		
		crs.parseCourseTitle(entryList[i]);
		crs.parseLinks(entryList[i]);

		courseList.push(crs);
	}

	// Begin deleting page elements
	var body = document.body;
	for(var i = 1, len = entryList.length; i < len - 1; i++)
		body.removeChild(entryList[i]);
	for(var i = 0, len = imgList.length; i < len; i++)
		body.removeChild(imgList[i]);

	var imgDel = document.querySelectorAll('IMG[src="http://schedule.berkeley.edu/graphs/sp.gif"]');
	for(var i = 0; i < imgDel.length; i++)
		imgDel[i].parentNode.removeChild(imgDel[i]);

	return courseList;
}());

/*
 * Set CSS properties
 */
UCBSE.css = (function()
{
	var head = document.querySelector("HEAD");
	var styleElt = document.createElement("style");

	css = "";
	css += "body { font-family:arial, tahoma, verdana; font-size:1em; } ";
	css += "table, tr, td { font-size:.9em; } ";
	css += "table { empty-cells:show; }";
	css += ".enhancedFull { width:100%; }";
	css += ".enhanced { width:auto; }";

	var numCol = 23;
	// col23 = courserank link

	for(var i = 1; i <= numCol - 1; i++)
		css += "table.hide" + i + " .col" + i + ",";
	css += "table.hide" + i + " .col" + i;

	css += "{ display:none;}";

	for(var i = 1; i <= numCol - 1; i++)
		css += ".col" + i + ",";
	css += ".col" + i;

	css += "{ display: table-cell; }";

	css += ".col23, .col22, .col21, .col20, .col19 { padding:0 2px; }"

	// for showing and hiding second row
	css += "table.hide200 .col200 { display:none; }";

	// for showing and hiding controls
	css += "div.hide900 { display:none; background-color:#000; }";

	// for showing and hiding highlightedcourses
	css += "div.hide800 { display:none; background-color:#000; }";

	// links
	css += "a {color:#336699}";

	// Top row (Course Number, CCN, Class type, etc.)
	css += ".topRow { font-weight: bold; text-align: center; } ";

	// Course title
	css += ".title { background-color:#e8f1fa; }" 
	css += ".title, .title a { color: #336699; font-weight:bold; text-decoration:none; }";
	css += ".title td { font-size:1.1em; }";
	css += ".titleLeftBorder { border-left: 5px solid #336699; border-right:2px solid #FFF; padding: 0 .2em; }";
	css += ".title a:hover { background-color:transparent; text-decoration:underline; }";

	// Course Body
	css += ".courseBody { text-align: center; }";
	css += ".courseBodyLec > td { text-align: center; font-weight:bold; background-color:#000000;}";
	css += ".courseTopPadding > td { padding-top:1em; }";
	css += ".courseBottomPadding > td { padding-top:1px; }";
	
	// Small label: limit, enrolled, waitlisted, avail seats, etc.
	css += ".smallLabel { font-weight:normal; color:#6e96be; text-align:center;}";
	css += ".col11, .col12, .col13, .col14 { display:inline; margin:0 auto; text-align:center; }";

	// Enrollment Data 
	css += ".enrollmentMsg { /*background-color:#d4d4d4;*/ text-align:center; }";
	css += ".col18 { margin:0 auto; display:inline; }";
	css += ".enrollData, .enrollDataLeft, .enrollDataRight { text-align:center;}";
	css += ".enrollDataLeft { border-left:1px dotted #CCC;}";
	css += ".enrollDataRight { border-right:1px dotted #CCC;}";
	css += ".enrollDataFiller { border-left:1px dotted #CCC; border-right:1px dotted #CCC; }";

	// CCN
	css += ".ccnInput { width:40px; border:0px solid #CCC; font-size:1em; font-weight:bold; font-family: arial, verdana, tahoma;}";

	// Department
	css += ".departmentTopPadding > td { padding-top:2em; }";
	css += ".department { color:#dddddd; background-color:#252c58; font-size:2em; padding-left:.2em;}"; 

	// Dotted border surrounding the rows
	css += ".rowBorder { border-bottom:1px dotted #CCC; }";

	// Note, Summer fees, etc.
	css += ".note, .summerFees, .sessionDates { color:#6e6e6e; }";
	css += ".note { max-width:400px; }";

	// Status, restrictions
	css += ".statusLastChanged, .restrictions { text-align:center; font-family:arial; font-weight:normal; }";
	css += ".statusLastChanged, .col16 { width:110px; }";
	css += ".restrictions, .col15 { width:110px;}";
	css += ".ccn { margin:auto; text-align:center; white-space:nowrap; border-right: 1px dotted #CCC;}";
	css += ".classType { width:30px; }";
	css += ".secNum { width:30px; }";
	css += ".units { width:40px; text-align:center; }";
	css += ".instructor { text-align:left; }";
	css += ".locn { text-align:left; }";
	css += ".finalExamGroup { max-width:30px; text-align:center; }";
	css += ".col10 { width:30px; text-align:center; }";
	css += ".days { min-width:115px; max-width:140px; text-align:center; white-space:nowrap;}";
	css += ".time { text-align:left; }";
	css += ".room { text-align:left; }";
	css += ".links { white-space:nowrap; text-align:left; }";
	css += ".full { background-color:#ff9b9b; color:#520e0e;}";
	css += ".open { background-color:#c5ffc8; color:#15520e;}" ;
	css += ".openButWaitlist { background-color:#ffd563; color:#473608;}";
	css += ".unsched { background-color:#dddddd; color:#333; margin-right:1px;}";

	// Days
	css += ".dayActive { background-color:#c5ffc8; color:#18571b;}";
	css += ".dayInactive { color:#999; background-color:#dddddd; }";
	css += ".dayActive, .dayInactive { font-weight:normal; float:left; margin-right:1px; width:20px; text-align:center; padding:1px;}";
	
	// Advice links (courserank, myedu, etc)
	css += ".adviceLinks { font-size:.8em; font-weight:normal;}";

	// Row Highlighting
	css += "tbody.highlight:hover, tbody.primary:hover { background-color:#dfffa4; }";
	css += "tbody.primary { background-color:#f1f1f1; }";
	css += "tbody.primary tr:first-child > td { font-weight:bold; }";
	css += "tbody.primary .rowBorder { border-bottom:1px dotted #CCC; }";


	// onclick row highlighting
	css += "tbody.highlightonclick, tbody.highlightonclick:active, tbody.highlightonclick:visited { background-color:#fff98a; }";
	css += "tbody.highlightonclick:hover { background-color:#ffd964; }";
	css += ".highlightCursor, a { cursor:pointer; }";

	// key
	css += ".key { background-color:#e8f1fa; color:#226699; font-size:.9em; font-family:Helvetica, Arial, sans-serif; text-align:left; color:#336699; padding:5px; border-radius:5px; width:600px; margin: 5px 0; }";
	css += "table.hide300 { display:none; background-color:#000; }";

	// turn of bg on ccn
	css += "table.nobg .open, table.nobg .openButWaitlist, table.nobg .full { background-color:transparent; color:#000;}";

	// sidebar
	css += "#sidebar {width:330px; float:right; text-align:center;z-index:100; position:fixed; right:10px; top:10px; color:#666;}";
	css += "#sidebar a {color:#9f911e;}";
	css += "#sidebar a:hover {color:#9f911e; text-decoration: underline; background-color:transparent;}";

	// controls
	css += "#controls { float:left; background-color:#f3f3f3; font-size:.7em; font-family: arial, tahoma, verdana; padding:5px; color:#666; margin:5px 0 0 0; border:1px solid #CCC; text-align:center; opacity: .9; border-radius:5px; }";
	css += "#controls hr { background-color:#CCC; height:1px; border:0px; float:left; width:100%;}";
	css += "#controls input { padding:0px; margin:2px 2px 0 2px; }";
	css += ".checkboxElement {float:left; width:150px; text-align:left;}";
	css += "#controls a {color:#666666;}";
	css += "#controls a:hover {color:#9f911e; text-decoration: underline; background-color:transparent;}";

	// configuration link
	css += "#configContainer { float:top left; text-align:center; background-color:#fffcb8; font-size:.7em; font-family:arial, tahoma, san-serif; padding:5px; border:1px solid #decc35; opacity:.8; border-radius:5px;  }";
	css += "#configContainer a, #configContainer { -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -o-user-select: none; user-select: none; }";

	// highlighted Courses
	css += "#highlightedCourses * {font-family: arial, tahoma, sans-serif;}";
	css += "#highlightedCourses {float:left; position:fixed; z-index:100;}";
	css += "#highlightedCourses table { background-color:#f3f3f3; border:1px solid #CCC; padding:5px; font-size:10pt; color:#666; opacity:.95; border-radius:5px; }";
	css += "#highlightedCourses tr td { padding:2px; }";
	css += "#highlightedCourses tfoot tr > td {border-top: 1px solid #CCC;}";
	css += "#highlightedCourses a {font-size:8pt;}";
	css += "#close a, #close { color:#666; font-size:8pt; }"
	css += "#highlightedCourses hr { background-color:#CCC; height:1px; border:0px; float:left; width:100%;}";

	// close panel
	css += "#close {float:right;}";

	// Set CSS
	styleElt.innerHTML = css;
	head.appendChild(styleElt);

	// Add JS
	var jsElt = document.createElement("script");

	// Add functions defined in this javascript file to the head of the OSOC page
	jsElt.appendChild(document.createTextNode(highlightRow));
	jsElt.appendChild(document.createTextNode(popupwindow));
	jsElt.appendChild(document.createTextNode(post_to_url));
	jsElt.appendChild(document.createTextNode(toggleColumn));
	jsElt.appendChild(document.createTextNode(hasClass));
	jsElt.appendChild(document.createTextNode(addClass));
	jsElt.appendChild(document.createTextNode(removeClass));

	head.appendChild(jsElt);
}());
	
UCBSE.key = (function()
{
	var table = document.createElement("table");
	table.setAttribute("id", "key");
	table.innerHTML = '<tr><td><div class="key"><b>Key</b><ul><li><span class="open">GREEN</span> indicates that the class is open and there are seats available.</li><li><span class="openButWaitlist">ORANGE</span> indicates there are seats are available, but there is a waitlist.</li><li><span class="full">RED</span> indicates that the class is full or has been cancelled.</li><li><b>Course Highlighting</b> - Courses can be highlighted in yellow by clicking on the blank space in the Course Number column.</li><li><b>[E]</b> = Enrollment</li><li><b>[B]</b> = Book</li><li><b>[K]</b> = Koofers</li><li><b>[ME]</b> = myEdu</li><li><b>[CR]</b> = CourseRank</li><li><b>[NC]</b> = Ninja Courses</li><li><b>[SB]</b> = ScheduleBuilder</li></div></tr></td>';

	document.body.insertBefore(table, document.body.firstChild.nextSibling.nextSibling);
}());

UCBSE.table = (function(courseList)
{
	var body = document.body;
	body.setAttribute("background", "");
	var table = document.createElement("table");
	table.setAttribute("id", "enhanced");

	if(GM_getValue("isMaximum") != false)
		table.setAttribute("class", "enhancedFull");
	else
		table.setAttribute("class", "enhanced");


	table.setAttribute("cellspacing", "0");
	

	var tableRows = "";
	var prevCourseNum = "";
	var prevDepartment = "";
	var prevDepartmentAbrevForCourseTitle = "";


	for(var i = 0, len = courseList.length; i < len; i++)
	{
		var crs = courseList[i];
		
		// Department Title
		if(prevDepartment !== crs.getDepartment())
		{
			// if this condition is true, that means this is the first department
			if(prevDepartment != "")
				tableRows += '<tr class="departmentTopPadding"><td colspan="18"></td></tr>';

			prevDepartment = crs.getDepartment();


			tableRows += '<tr>';
			tableRows += '<td colspan="18" class="department">' + nullToEmpty(crs.getDepartment()) + '</td>';
			tableRows += '</tr>';
			tableRows += '<tr class="topRow">';
			tableRows += '<td class="col1" align="right">Course<br>Number</td>';	
			tableRows += '<td align="center"><div class="col2">CCN</div></td>';	
			tableRows += '<td><div class="col3">Class<br>Type</div></td>';	
			tableRows += '<td><div class="col4">Section<br>Number</div></td>';	
			tableRows += '<td><div class="col5">Units</div></td>';	
			tableRows += '<td><div class="col6">Instructor</div></td>';	
			tableRows += '<td><div class="col7">Days</div></td>';	
			tableRows += '<td><div class="col8">Time</div></td>';	
			tableRows += '<td><div class="col9">Location</div></td>';	
			tableRows += '<td><div class="col10">Final<br>Exam<br>Group</div></td>';	
			tableRows += '<td colspan="8"></td>';	
			tableRows += '</tr>';
		}
		
		// Course Title
		if(prevCourseNum !== crs.getCourseNum() || prevDepartmentAbrevForCourseTitle !== crs.getDepartmentAbrev())
		{
			prevCourseNum = crs.getCourseNum();
			prevDepartmentAbrevForCourseTitle = crs.getDepartmentAbrev();

			tableRows += '<tr class="courseTopPadding"><td colspan="18"></td></tr>';
			tableRows += '<tr class="title">';
			tableRows += '<td align="right" valign="middle" class="titleLeftBorder col1">' + nullToEmpty(crs.getCourseNum()) + '</td>';
			tableRows += '<td colspan="9" valign="middle">';
			tableRows += '<div style="float:left;">';
			tableRows += '<a href="' + crs.getCatalogDescLink() + '" target="_blank">' + nullToEmpty(crs.getTitle()) + '</a>';

			if(crs.getCourseWebsite())
				tableRows += ' <a href="' + crs.getCourseWebsite() + '" target="_blank">(Course Website)</a>';

			tableRows += '</div>';
			tableRows += '<div style="float:right;" class="adviceLinks">';
		
			deptAbrev = crs.getDepartmentAbrev();

			if(deptAbrev != 'LNS')
			{
				tableRows += '<a class="col19" href="' + 'http://www.koofers.com/search?q=' + encodeURI(deptAbrev + ' ' + crs.getCourseNum()) + '" target="_blank">[K]</a> ';
				tableRows += '<a class="col20" href="' + 'http://www.myedu.com/search?q=' + encodeURI(deptAbrev + ' ' + crs.getCourseNum()) + '&doctype=course&facets=school-name:University+of+California%2C+Berkeley|dept-abbrev:' + encodeURI(deptAbrev) + '&search_school=University+of+California%2C+Berkeley&config=' + '" target="_blank">[ME]</a> ';
				tableRows += '<a class="schedulebuilder col21" target="_blank">[SB]</a> ';
				tableRows += '<a class="col22" href="' + 'http://www.ninjacourses.com/explore/1/course/' + deptAbrev + '/' + crs.getCourseNum() + '/" target="_blank">[NC]</a> ';
				tableRows += '<a class="col23" href="' + 'https://www.courserank.com/berkeley/search#query=' + encodeURI(deptAbrev + ' ' + crs.getCourseNum()) + '&filter_term_currentYear=on' + '" target="_blank">[CR]</a>';
			}
			else
			{
				tableRows += '<a class="col19" href="' + 'http://www.koofers.com/search?q=' + encodeURI(deptAbrev + ' ' + crs.getCourseNum()) + '" target="_blank">[K]</a>';
				tableRows += '<a class="col20" href="' + 'http://www.myedu.com/search?q=' + encodeURI(deptAbrev + ' ' + crs.getCourseNum()) + '&doctype=course&facets=school-name:University+of+California%2C+Berkeley|dept-abbrev:' + encodeURI(deptAbrev) + '&search_school=University+of+California%2C+Berkeley&config=' + '" target="_blank">[ME]</a> ';
				tableRows += '<a class="schedulebuilder col21" target="_blank">[SB]</a> ';
				tableRows += '<a class="col22" href="' + 'http://www.ninjacourses.com/explore/1/course/' + 'L & S' + '/' + crs.getCourseNum() + '/" target="_blank">[NC]</a> ';
				tableRows += '<a class="col23" href="' + 'https://www.courserank.com/berkeley/search#query=' + encodeURI('L ~ S' + ' ' + crs.getCourseNum()) + '&filter_term_currentYear=on' + '" target="_blank">[CR]</a>';

			}

			tableRows += '</div>';
			tableRows += '<div style="clear:both"></div>';

			tableRows += '</td>';
			tableRows += '<td align="center"><div class="smallLabel col11"><small>Limit</small></div></td>';	
			tableRows += '<td align="center"><div class="smallLabel col12"><small>Enrolled</small></div></td>';	
			tableRows += '<td align="center"><div class="smallLabel col13"><small>Waitlist</small></div></td>';	
			tableRows += '<td align="center"><div class="smallLabel col14"><small>Avail<br>Seats</small></div></td>';	
			tableRows += '<td class="col15"><div class="smallLabel"><small>Restrictions</small></div></td>';	
			tableRows += '<td class="col16"><div class="smallLabel"><small>Status</small></div></td>';	
			tableRows += '<td></td>';
			tableRows += '</td>';
			tableRows += '</tr>';
			tableRows += '<tr class="courseBottomPadding"><td colspan="13"></td></tr>';
		} 
		
		// Course Body
		
		tableRows += '<tbody ';

		tableRows += 'class="course highlight ';

		// highlight primary
		if(crs.getPS() == "P")
			tableRows += 'primary ';

		// highlight the saved highlighted courses
		if(UCBSE.searchCourses(crs, UCBSE.highlightedCourses) != null)
		{
			tableRows += 'highlightonclick';
		}

		tableRows += '"';

		tableRows += '>';

		tableRows += '<td class="col1 highlightCursor" onclick="javascript:highlightRow(this.parentNode.parentNode);"></td>'
		tableRows += crs.fancyCourseControlNumber(crs.getCCN());
		tableRows += '<td class="' + crs.needRowBorder() + '"><div class="classType col3">' + nullToEmpty(crs.getClassType()) + '</div></td>';
		tableRows += '<td class="' + crs.needRowBorder() + '"><div class="secNum col4">' + nullToEmpty(crs.getSecNum()) + '</div></td>';
		tableRows += '<td class="' + crs.needRowBorder() + '"><div class="units col5">' + nullToEmpty(crs.getUnits()) + '</div></td>';
		tableRows += '<td class="' + crs.needRowBorder() + '"><div class="instructor col6">';

		if(crs.getInstructor() && crs.getInstructor().match(/THE STAFF/))
		{
			tableRows += crs.getInstructor().match(/THE STAFF/);
		}
		else if(crs.getInstructor())
			tableRows += '<a href="http://www.ratemyprofessors.com/SelectTeacher.jsp?the_dept=All&sid=1072&orderby=TLName&letter=' + crs.getLastName() + '" target="_blank">' + crs.getInstructor() + '</a>';

		tableRows += '</div></td>';

		if(!crs.getLocn())
		{
			if(crs.isFinalExamGroup())
				numCol = 1;
			else
				numCol = 2;

			tableRows += '<td class="' + crs.needRowBorder() + '"><div class="days col7">' + crs.fancyDays(crs.getDays()) +'</div></td>';
			tableRows += '<td class="' + crs.needRowBorder() + '"><div class="time col8">' + nullToEmpty(crs.getTime()) + '</div></td>';
			tableRows += '<td colspan="' + numCol + '" class="' + crs.needRowBorder() + '"><div class="room col9">' + nullToEmpty(crs.getRoom()) + '</div></td>';
		}
		else
		{
			if(crs.isFinalExamGroup())
				numCol = 3;
			else
				numCol = 4;

			tableRows += '<td colspan="' + numCol + '" class="' + crs.needRowBorder() + '"><div class="locn col9">' + nullToEmpty(crs.getLocn()) + '</div></td>';
		}
		
		if(crs.isFinalExamGroup())
			tableRows += '<td class="' + crs.needRowBorder() + '"><div class="finalExamGroup col10">' + nullToEmpty(crs.getFinalExamGroup()) + '</div></td>';

		if(!crs.getEnrollmentMsg())
		{
			tableRows += '<td class="enrollDataLeft' + crs.needRowBorder() + '"><div class="col11">' + crs.getLimit() + '</div></td>';
			tableRows += '<td class="enrollData' + crs.needRowBorder() + '"><div class="col12">' + crs.getEnrolled() + '</div></td>';
			tableRows += '<td class="enrollData' + crs.needRowBorder() + '"><div class="col13">' + crs.getWaitlist() + '</div></td>';
			tableRows += '<td class="enrollDataRight' + crs.needRowBorder() + '"><div class="col14">' + crs.getAvailSeats() + '</td>';
		}
		else
		{
			tableRows += '<td colspan="4" class="enrollDataLeft enrollDataRight ' + crs.needRowBorder() + '"><div class="enrollmentMsg col18">' + crs.getEnrollmentMsg() + '</div></td>';
		}

		tableRows += '<td class="' + crs.needRowBorder() + ' col15"><div class="restrictions"><small>' + nullToEmpty(crs.getRestrictions()) + '</small></div></td>';
		tableRows += '<td class="' + crs.needRowBorder() + ' col16"><div class="statusLastChanged"><small>' + nullToEmpty(crs.getStatusLastChanged()) + '</small></div></td>';
		tableRows += '<td class="col17"><div class="links">';

		if(crs.getEnrollmentLink() == true)
			tableRows += '<a href="http://infobears.berkeley.edu:3400/osc/?_InField1=RESTRIC&_InField2=' + crs.getCCN() + '&_InField3=' + crs.getInField3() + '" target="_blank" alt="Enrollment">[E]</a> ';
		if(crs.getBookLink())
			tableRows += '<a href="' + crs.getBookLink() + '" target="_blank" alt="Books">[B]</a>';

		tableRows += '</div></td>';
		tableRows += '</tr>';

		// Second row (Note, Summer Session fees, etc.)

		if(crs.needSecondRow())
		{
			tableRows += '<tr class="">';

			tableRows += '<td class="highlightCursor col1" onclick="javascript:highlightRow(this.parentNode.parentNode);"></td>';

			tableRows += '<td class="ccn rowBorder"></td>';
			tableRows += '<td class="rowBorder"></td>';
			tableRows += '<td class="rowBorder"></td>';
			tableRows += '<td class="rowBorder"></td>';
			tableRows += '<td class="rowBorder" colspan="5">';

			if(crs.getSummerFees())
				tableRows += '<p class="col200 summerFees"><small><b>Summer Fees:</b> ' + crs.getSummerFees() + '</small></p>';

			if(crs.getSessionDates())
				tableRows += '<p class="col200 sessionDates"><small><b>Session Dates</b> ' + crs.getSessionDates() + '</small></p>';

			if(crs.getNote())
				tableRows += '<p class="col200 note"><small><b>Note:</b> ' + crs.getNote() + '</small></p>';

			tableRows += '</td>';
			tableRows += '<td colspan="4" class="rowBorder enrollDataLeft enrollDataRight"></td>';
			tableRows += '<td class="rowBorder col15"></td>';
			tableRows += '<td class="rowBorder col16"></td>';
			tableRows += '<td class="links col17"></td>';
			tableRows += '</tr>';
		}

		tableRows += '</tbody>';
	}
	
	// set HTML in table
	table.innerHTML = tableRows;


	// highlighted courses
	var highlightCells = table.getElementsByClassName("highlightCursor");

	var secondRowParsed = false;
	for(var courseCount = 0, highlightCount = 0, len = highlightCells.length; 
			highlightCount < len; 
			highlightCount++)
	{
		var crs = courseList[courseCount];

		highlightCells[highlightCount].addEventListener("click", 
				(function(course) {
					return function() {
						highlightListener(course);
					}
				}(crs))
			, false);


		if(!crs.needSecondRow())
			courseCount++;
		else if(secondRowParsed)
		{
			courseCount++;
			secondRowParsed = false;
		}
		else
			secondRowParsed = true;
	}

	// schedulebuilder
	var prevCourse = { courseNum: "", departmentAbrev: ""};
	var schedulebuilderLinks = table.getElementsByClassName("schedulebuilder");
	var uniqueCourseCount = 0;
	for(var courseCount = 0, len = courseList.length; courseCount < len; courseCount++)
	{
		var crs = courseList[ courseCount ];
		if(crs.getCourseNum() != prevCourse.courseNum || crs.getDepartmentAbrev() != prevCourse.departmentAbrev)
		{
			prevCourse.courseNum = crs.getCourseNum();
			prevCourse.departmentAbrev = crs.getDepartmentAbrev();

			var link = schedulebuilderLinks[ uniqueCourseCount ];
			link.addEventListener("click",
				(function(course)
				{
					return function() {
						schedulebuilderListener(course);
					}
				}(crs))
				,false);


			uniqueCourseCount++;
		}
	}

	body.insertBefore(table, body.firstChild.nextSibling.nextSibling.nextSibling);
	return table;
}(UCBSE.courseList));

UCBSE.controls = (function()
{
	// container for the controls
	var container = document.createElement("div");
	container.setAttribute("id", "controls");


	if(GM_getValue("isControls"))
		container.setAttribute("class", "col900");
	else
		container.setAttribute("class", "col900 hide900");

	// Links
	var containerLinks = document.createElement("div");
	var reportBugLink = document.createElement("a");
	reportBugLink.innerHTML = "Report Bug";
	reportBugLink.setAttribute("href", "http://goo.gl/aJgTR");
	reportBugLink.setAttribute("target", "_blank");

	var homepageLink = document.createElement("a");
	homepageLink.innerHTML = "Homepage";
	homepageLink.setAttribute("href", "http://userscripts.org/scripts/show/105611");
	homepageLink.setAttribute("target", "_blank");

	var facebookLink = document.createElement("a");
	facebookLink.innerHTML = "Facebook";
	facebookLink.setAttribute("href", "http://www.facebook.com/ucbse");
	facebookLink.setAttribute("target", "_blank");

	containerLinks.appendChild(reportBugLink);
	containerLinks.appendChild(document.createTextNode(" | "));
	containerLinks.appendChild(homepageLink);
	containerLinks.appendChild(document.createTextNode(" | "));
	containerLinks.appendChild(facebookLink);

	container.appendChild(containerLinks);

	container.appendChild(document.createElement("hr"));

	// Maximize Toggle
	var toggleMaximizeContainer = document.createElement("div");
	toggleMaximizeContainer.setAttribute("class", "checkboxElement");

	var toggleMaximizeElement = document.createElement("input");
	toggleMaximizeElement.setAttribute("type", "checkbox");

	var toggleMaximizeLabel = document.createTextNode("Maximize Table");

	toggleMaximizeElement.addEventListener("click", toggleMaximize, false);

	if(GM_getValue("isMaximum") == true)
	{
		toggleMaximizeElement.setAttribute("checked", "yes");
	}

	toggleMaximizeContainer.appendChild(toggleMaximizeElement);
	toggleMaximizeContainer.appendChild(toggleMaximizeLabel);

	container.appendChild(toggleMaximizeContainer);

	// CCN Bg Toggle
	var toggleCCNBgContainer = document.createElement("div");
	toggleCCNBgContainer.setAttribute("class", "checkboxElement");

	var toggleCCNBgElement = document.createElement("input");
	toggleCCNBgElement.setAttribute("type", "checkbox");

	var toggleCCNBgLabel = document.createTextNode("CCN Background Colors");

	if(GM_getValue("isBg") != false)
	{
		toggleCCNBgElement.setAttribute("checked", "yes");
	}
	else
	{
    	var currentClass = document.getElementById("enhanced");
		addClass(currentClass, "nobg");
	}

	toggleCCNBgElement.addEventListener("click", toggleCCNBg, false);

	toggleCCNBgContainer.appendChild(toggleCCNBgElement);
	toggleCCNBgContainer.appendChild(toggleCCNBgLabel);

	container.appendChild(toggleCCNBgContainer);

	// Key toggle
	createToggleColumnElement(container, 300, "Key", "key");


	// hr
	container.appendChild(document.createElement("hr"));

	// Column controls
	

	createToggleColumnElement(container, 1, "Course Number");
	createToggleColumnElement(container, 2, "CCN");
	createToggleColumnElement(container, 3, "Class Type");
	createToggleColumnElement(container, 4, "Section Number");
	createToggleColumnElement(container, 5, "Units");
	createToggleColumnElement(container, 6, "Instructor");
	container.appendChild(document.createElement("hr"));
	createToggleColumnElement(container, 7, "Days");
	createToggleColumnElement(container, 8, "Time");
	createToggleColumnElement(container, 9, "Location");
	createToggleColumnElement(container, 10, "Final Exam Group");
	container.appendChild(document.createElement("hr"));
	createToggleColumnElement(container, 11, "Limit");
	createToggleColumnElement(container, 12, "Enrolled");
	createToggleColumnElement(container, 13, "Waitlist");
	createToggleColumnElement(container, 14, "Avail Seats");
	container.appendChild(document.createElement("hr"));
	createToggleColumnElement(container, 15, "Restrictions");
	createToggleColumnElement(container, 16, "Status");
	createToggleColumnElement(container, 17, "Links");
	container.appendChild(document.createElement("hr"));
	createToggleColumnElement(container, 18, "Enrollment Message");
	createToggleColumnElement(container, 200, "Second Row");
	container.appendChild(document.createElement("hr"));
	createToggleColumnElement(container, 19, "Koofers Link");
	createToggleColumnElement(container, 20, "MyEdu Link");
	createToggleColumnElement(container, 21, "ScheduleBuilder Link");
	createToggleColumnElement(container, 22, "NinjaCourses Link");
	createToggleColumnElement(container, 23, "CourseRank Link");
	container.appendChild(document.createElement("hr"));

	container.appendChild(closeContainer("controls", 900, "isControls"));

	// Configuration container 
	var toggleControlsContainer = document.createElement("div");
	toggleControlsContainer.setAttribute("id", "configContainer");


	// Highlighted Courses link 

	var toggleHighlightedCourses = document.createElement("a");
	toggleHighlightedCourses.setAttribute("unselectable", "on");
	toggleHighlightedCourses.addEventListener("click", function() { toggleClassPersistent("isHigh"); }, false);
	toggleHighlightedCourses.setAttribute("onclick", "toggleColumn('highlightedCourses', 800)");

	toggleHighlightedCourses.innerHTML = "Highlighted Courses (";
	var highlightedCoursesCounter = document.createElement("span");
	highlightedCoursesCounter.setAttribute("id", "counter");
	highlightedCoursesCounter.innerHTML = UCBSE.highlightedCourses.length;
	toggleHighlightedCourses.appendChild(highlightedCoursesCounter);

	toggleHighlightedCourses.innerHTML += ")";
	toggleControlsContainer.appendChild(toggleHighlightedCourses);

	// Add space
	toggleControlsContainer.appendChild(document.createTextNode(" | "));

	// Configuration link 
	var toggleControls = document.createElement("a");
	toggleControls.setAttribute("onclick", "toggleColumn('controls', 900)");
	toggleControls.setAttribute("unselectable", "on");
	toggleControls.addEventListener("click", function() { toggleClassPersistent("isControls"); }, false);
	toggleControls.innerHTML = "Configuration";
	toggleControlsContainer.appendChild(toggleControls);


	// Sidebar container
	var sidebarContainer = document.createElement("div");
	sidebarContainer.setAttribute("id", "sidebar");

	sidebarContainer.appendChild(toggleControlsContainer);
	sidebarContainer.appendChild(container);

	// Add sidebar to page
	document.body.insertBefore(sidebarContainer, document.body.firstChild);

	// highlighted courses
	UCBSE.highlightedCoursesContainer = document.createElement("div");
	UCBSE.highlightedCoursesContainer.setAttribute("id", "highlightedCourses");
	if(GM_getValue("isHigh"))
		UCBSE.highlightedCoursesContainer.setAttribute("class", "col800");
	else
		UCBSE.highlightedCoursesContainer.setAttribute("class", "col800 hide800");

	highlightedCoursesTableCreator(UCBSE.highlightedCoursesContainer);

	// Add highlighted courses to page
	document.body.insertBefore(UCBSE.highlightedCoursesContainer, document.body.firstChild);


}());
