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

function toggleClassPersistent(gmid)
{
	if(GM_getValue(gmid) != false)
	{
		console.log("true");
		GM_setValue(gmid, false);
	}
	else
	{
		console.log("false");
		GM_setValue(gmid, true);
	}
}

function highlightedCoursesTableCreator(container)
{


	var table = document.createElement("table");
	var tableHTML = "";
	
	tableHTML += '<thead><tr>';
	tableHTML += '<th></th>';
	tableHTML += '<th>CCN</th>';
	tableHTML += '<th colspan="3" align="left">Course</th>';
	tableHTML += '<th>Class<br>Type</th>';
	tableHTML += '<th>Section<br>Number</th>';
	tableHTML += '<th>Units</th>';
	tableHTML += '<th>Instructor</th>';
	tableHTML += '<th>Days</th>';
	tableHTML += '<th>Time</th>';
	tableHTML += '<th>Location</th>';
	tableHTML += '<th></th>';
	tableHTML += '</tr></thead>';
	table.innerHTML = tableHTML;

	for(var i = 0, len = UCBSE.highlightedCourses.length; i < len; i++)
	{
		var row = document.createElement("tr");
		var crs = UCBSE.highlightedCourses[i];
		var rowHTML = "";
	
		rowHTML += '<td>[ <a name="delete">X</a> ]</td>';
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
			if(crs.enrollmentLink)
				rowHTML += '<a onclick="' + crs.enrollmentLink + '" target="_blank" alt="Enrollment">[E]</a> ';
			if(crs.bookLink)
				rowHTML += '<a onclick="' + crs.bookLink + '" target="_blank" alt="Books">[B]</a>';
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

	if(container.firstChild)
		container.replaceChild(table, container.firstChild);
	else
	{
		container.appendChild(table);
		container.appendChild(closeContainer("highlightedCourses", 800, "isHigh"));
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
	
	if (typeof(chrome) != 'undefined') {
		GM_xmlhttpRequest = function(obj) {
			var crossDomain = (obj.url.indexOf(location.hostname) == -1);
			
			if ((typeof(obj.onload) != 'undefined') && (crossDomain)) {
				obj.requestType = 'GM_xmlhttpRequest';
				if (typeof(obj.onload) != 'undefined') {
					chrome.extension.sendRequest(obj, function(response) {
						obj.onload(response);
					});
				}
			} else {
				var request=new XMLHttpRequest();
				request.onreadystatechange=function() { if(obj.onreadystatechange) { obj.onreadystatechange(request); }; if(request.readyState==4 && obj.onload) { obj.onload(request); } }
				request.onerror=function() { if(obj.onerror) { obj.onerror(request); } }
				try { request.open(obj.method,obj.url,true); } catch(e) { if(obj.onerror) { obj.onerror( {readyState:4,responseHeaders:'',responseText:'',responseXML:'',status:403,statusText:'Forbidden'} ); }; return; }
				if(obj.headers) { for(name in obj.headers) { request.setRequestHeader(name,obj.headers[name]); } }
				request.send(obj.data); return request;
			}
		}
	} else if (typeof(safari) != 'undefined')  {
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

var UCBSE = UCBSE || {};

if(GM_getValue("highlightArrayJSON"))
	UCBSE.highlightedCourses = JSON.parse(GM_getValue("highlightArrayJSON"));
else
	UCBSE.highlightedCourses = new Array();


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
		"AFRICAN AMERICAN STUDIES" : "AFRICAM",
		"AGRICULTURAL AND ENVIRON CHEMISTRY" : "AGR CHM",
		"AGRICULTURAL AND RESOURCE ECONOMICS" : "A,RESEC",
		"AMERICAN STUDIES" : "AMERSTD",
		"ANCIENT HISTORY AND MED. ARCH." : "AHMA",
		"ANTHROPOLOGY" : "ANTHRO",
		"APPLIED SCIENCE AND TECHNOLOGY" : "AST",
		"ARABIC" : "ARABIC",
		"ARCHITECTURE" : "ARCH",
		"ASIAN AMERICAN STUDIES" : "ASAMST",
		"ASIAN STUDIES" : "ASIANST",
		"ASTRONOMY" : "ASTRON",
		"BENGALI" : "BANGLA",
		"BIOENGINEERING" : "BIO ENG",
		"BIOLOGY" : "BIOLOGY",
		"BIOPHYSICS" : "BIOPHY",
		"BUDDHISM" : "BUDDHSM",
		"CATALAN" : "CATALAN",
		"CELTIC STUDIES" : "CELTIC",
		"CHEMICAL & BIOMOLECULAR ENGINEERING" : "CHM ENG",
		"CHEMISTRY" : "CHEM",
		"CHICANO STUDIES" : "CHICANO",
		"CHINESE" : "CHINESE",
		"CITY AND REGIONAL PLANNING" : "CY PLAN",
		"CIVIL AND ENVIRONMENTAL ENGINEERING" : "CIV ENG",
		"CLASSICS" : "CLASSIC",
		"COGNITIVE SCIENCE" : "COG SCI",
		"COLLEGE WRITING PROGRAM" : "COLWRIT",
		"COMPARATIVE BIOCHEMISTRY" : "COMPBIO",
		"COMPARATIVE LITERATURE" : "COM LIT",
		"COMPUTATIONAL AND GENOMIC BIOLOGY" : "CGB",
		"COMPUTER SCIENCE" : "COMPSCI",
		"CRITICAL THEORY GRADUATE GROUP" : "CRIT TH",
		"CUNEIFORM" : "CUNEIF",
		"DEMOGRAPHY" : "DEMOG",
		"DEVELOPMENT STUDIES" : "DEV STD",
		"DUTCH" : "DUTCH",
		"EARTH AND PLANETARY SCIENCE" : "EPS",
		"EAST ASIAN LANGUAGES AND CULTURES" : "EA LANG",
		"EAST EUROPEAN STUDIES" : "EAEURST",
		"ECONOMICS" : "ECON",
		"EDUCATION" : "EDUC",
		"EGYPTIAN" : "EGYPT",
		"ELECTRICAL ENGINEERING" : "EL ENG",
		"ENERGY AND RESOURCES GROUP" : "ENE,RES",
		"ENGINEERING" : "ENGIN",
		"ENGLISH" : "ENGLISH",
		"ENVIRON SCI, POLICY, AND MANAGEMENT" : "ESPM",
		"ENVIRONMENTAL DESIGN" : "ENV DES",
		"ENVIRONMENTAL ECONOMICS AND POLICY" : "ENVECON",
		"ENVIRONMENTAL SCIENCES" : "ENV SCI",
		"ETHNIC STUDIES" : "ETH STD",
		"ETHNIC STUDIES GRADUATE GROUP" : "ETH GRP",
		"EURASIAN STUDIES" : "EURA ST",
		"EVE/WKND MASTERS IN BUS. ADM." : "EWMBA",
		"EXECUTIVE MASTERS IN BUS. ADM." : "XMBA",
		"FILIPINO" : "FILIPN",
		"FILM AND MEDIA" : "FILM",
		"FOLKLORE" : "FOLKLOR",
		"FRENCH" : "FRENCH",
		"GENDER AND WOMEN'S STUDIES" : "GWS",
		"GEOGRAPHY" : "GEOG",
		"GERMAN" : "GERMAN",
		"GLOBAL METROPOLITAN STUDIES" : "GMS",
		"GLOBAL POVERTY AND PRACTICE" : "GPP",
		"GRAD STUDENT PROF DEVELOPMENT PGM" : "GSPDP",
		"GREEK" : "GREEK",
		"GROUP IN BUDDHIST STUDIES" : "BUDDSTD",
		"HEALTH AND MEDICAL SCIENCES" : "HMEDSCI",
		"HEBREW" : "HEBREW",
		"HINDI-URDU" : "HIN-URD",
		"HISTORY" : "HISTORY",
		"HISTORY OF ART" : "HISTART",
		"INDIGENOUS LANGUAGES OF AMERICAS" : "ILA",
		"INDUSTRIAL ENGIN AND OPER RESEARCH" : "IND ENG",
		"INFORMATION" : "INFO",
		"INFORMATION SYSTEMS AND MANAGEMENT" : "INFOSYS",
		"INTEGRATIVE BIOLOGY" : "INTEGBI",
		"INTERDEPARTMENTAL STUDIES" : "IDS",
		"INTERDISCIPLINARY STUDIES FIELD MAJ" : "ISF",
		"INTERNATIONAL AND AREA STUDIES" : "IAS",
		"IRANIAN" : "IRANIAN",
		"ITALIAN STUDIES" : "ITALIAN",
		"JAPANESE" : "JAPAN",
		"JEWISH STUDIES" : "JEWISH",
		"JOURNALISM" : "JOURN",
		"KHMER" : "KHMER",
		"KOREAN" : "KOREAN",
		"LANDSCAPE ARCHITECTURE" : "LD ARCH",
		"LANGUAGE PROFICIENCY PROGRAM" : "LAN PRO",
		"LANGUAGE PROFICIENCY PROGRAM" : "LANGPRO",
		"LATIN" : "LATIN",
		"LATIN AMERICAN STUDIES" : "LATAMST",
		"LAW" : "LAW",
		"LEGAL STUDIES" : "LEGALST",
		"LESBIAN GAY BISEXUAL TRANSGENDER ST" : "LGBT",
		"LETTERS AND SCIENCE" : "L ~ S",
		"LINGUISTICS" : "LINGUIS",
		"MALAY/INDONESIAN" : "MALAY/I",
		"MASS COMMUNICATIONS" : "MASSCOM",
		"MASTERS IN BUSINESS ADMINISTRATION" : "MBA",
		"MASTERS IN FINANCIAL ENGINEERING" : "MFE",
		"MATERIALS SCIENCE AND ENGINEERING" : "MAT SCI",
		"MATHEMATICS" : "MATH",
		"MECHANICAL ENGINEERING" : "MEC ENG",
		"MEDIA STUDIES" : "MEDIAST",
		"MEDIEVAL STUDIES" : "MED ST",
		"MIDDLE EASTERN STUDIES" : "M E STU",
		"MILITARY AFFAIRS" : "MIL AFF",
		"MILITARY SCIENCE" : "MIL SCI",
		"MOLECULAR AND CELL BIOLOGY" : "MCELLBI",
		"MUSIC" : "MUSIC",
		"NANOSCALE SCIENCE AND ENGINEERING" : "NSE",
		"NATIVE AMERICAN STUDIES" : "NATAMST",
		"NATURAL RESOURCES" : "NAT RES",
		"NAVAL SCIENCE" : "NAV SCI",
		"NEAR EASTERN STUDIES" : "NE STUD",
		"NEUROSCIENCE" : "NEUROSC",
		"NEW MEDIA" : "CNM",
		"NEW MEDIA" : "NWMEDIA",
		"NUCLEAR ENGINEERING" : "NUC ENG",
		"NUTRITIONAL SCIENCES AND TOXICOLOGY" : "NUSCTX",
		"OCEAN ENGINEERING" : "OC ENG",
		"OPTOMETRY" : "OPTOM",
		"PEACE AND CONFLICT STUDIES" : "PACS",
		"PERSIAN" : "PERSIAN",
		"PH.D. IN BUSINESS ADMINISTRATION" : "PHDBA",
		"PHILOSOPHY" : "PHILOS",
		"PHYSICAL EDUCATION" : "PHYS ED",
		"PHYSICS" : "PHYSICS",
		"PLANT AND MICROBIAL BIOLOGY" : "PLANTBI",
		"POLITICAL ECONOMY OF INDUSTRIAL SOC" : "POLECIS",
		"POLITICAL SCIENCE" : "POL SCI",
		"PORTUGUESE" : "PORTUG",
		"PRACTICE OF ART" : "ART",
		"PSYCHOLOGY" : "PSYCH",
		"PUBLIC HEALTH" : "PB HLTH",
		"PUBLIC POLICY" : "PUB POL",
		"PUNJABI" : "PUNJABI",
		"RELIGIOUS STUDIES" : "RELIGST",
		"RHETORIC" : "RHETOR",
		"SANSKRIT" : "SANSKR",
		"SCANDINAVIAN" : "SCANDIN",
		"SCIENCE AND MATHEMATICS EDUCATION" : "SCMATHE",
		"SEMITICS" : "SEMITIC",
		"SLAVIC LANGUAGES AND LITERATURES" : "SLAVIC",
		"SOCIAL WELFARE" : "SOC WEL",
		"SOCIOLOGY" : "SOCIOL",
		"SOUTH ASIAN" : "S ASIAN",
		"SOUTH AND SOUTHEAST ASIAN STUDIES" : "S,SEASN",
		"SOUTHEAST ASIAN" : "SEASIAN",
		"SPANISH" : "SPANISH",
		"STATISTICS" : "STAT",
		"STUDIES" : "STUDIES",
		"TAGALOG" : "TAGALG",
		"TAMIL" : "TAMIL",
		"TELUGU" : "TELUGU",
		"THAI" : "THAI",
		"THEATER, DANCE, AND PERFORMANCE ST" : "THEATER",
		"TIBETAN" : "TIBETAN",
		"TURKISH" : "TURKISH",
		"UNDERGRAD INTERDISCIPLINARY STUDIES" : "UGIS",
		"UNDERGRAD. BUSINESS ADMINISTRATION" : "UGBA",
		"UNIVERSITY EXTENSION" : "UNIVEXT",
		"VIETNAMESE" : "VIETNMS",
		"VISION SCIENCE" : "VIS SCI",
		"VISUAL STUDIES" : "VIS STD",
		"YIDDISH" : "YIDDISH"
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

	// private methods
	
	/**
	 * Gets the apartments abbreviation
	 * @param str department name
	 * @return department abbreviation 
	 */
	var _getDeptAbrev = function(str)
	{
		/*for(var i = 0, len = DEPARTMENTS.length; i < len; i++)
		{
			var re = new RegExp(DEPARTMENTS[i].name);
			if(str.match(re, str))
				return DEPARTMENTS[i].shortName;
		}
		return str;
		*/
		if(DEPARTMENTS.hasOwnProperty(str))
			return DEPARTMENTS[str];
		else
			return str;
	};
	

	return {
		// public attributes	

		// public methods
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

		/*
		 * splits a string up into tokens based on word boundaries
		 *
		 * For example. "how    are you doin." is transformed into
		 * "how" "are" "you" "doin."
		 *
		 * @return array of strings 
		 */

		tokenize: function(str)
		{
			str = str.match(/[A-Za-z0-9.-]+/g) + "";
			return str.split(',');
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

					catalogDescLink = "javascript:post_to_url('http://osoc.berkeley.edu/catalog/gcc_search_sends_request', ";
					catalogDescLink += associativeArrayToString(catalogDescParams);
					catalogDescLink += ",'post','_blank');";

					this.catalogDescLink = catalogDescLink;
				}
				else if(temp.match(/Click here for current enrollment/) != null)
				{
					var enrollmentParams = new Array();
					
					enrollmentParams['_InField1'] = getValue(input, "_InField1");
					enrollmentParams['_InField2'] = getValue(input, "_InField2");
					enrollmentParams['_InField3'] = getValue(input, "_InField3");

					enrollmentLink = "javascript:post_to_url('http://infobears.berkeley.edu:3400/osc', ";
					enrollmentLink += associativeArrayToString(enrollmentParams);
					enrollmentLink += ",'post','_blank');";

					this.enrollmentLink = enrollmentLink;
				}
				else if(temp.match(/View Books/) != null)
				{
					var bookParams = new Array();

					bookParams['bookstore_id-1'] = getValue(input, "bookstore_id-1");
					bookParams['term_id-1'] = getValue(input, "term_id-1");
					bookParams['div-1'] = getValue(input, "div-1");
					bookParams['crn-1'] = this.ccn;

					bookLink = "javascript:post_to_url('http://www.bkstr.com/webapp/wcs/stores/servlet/booklookServlet', ";
					bookLink += associativeArrayToString(bookParams);
					bookLink += ",'post','_blank');";

					this.bookLink = bookLink;
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
				str = this.tokenize(str);

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
			if(this.finalExamGroup)
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
	css += "body { font-family:arial, tahoma, verdana; } ";
	css += "table, tr, td { font-size: 0.9em; } ";
	css += "table { empty-cells:show; }";
	css += ".enhancedFull { width:100%; }";
	css += ".enhanced { width:auto; }";

	var numCol = 18;
	// col18 = enrollment message

	for(var i = 1; i <= numCol - 1; i++)
		css += "table.hide" + i + " .col" + i + ",";
	css += "table.hide" + i + " .col" + i;

	css += "{ display:none;}";

	for(var i = 1; i <= numCol - 1; i++)
		css += ".col" + i + ",";
	css += ".col" + i;

	css += "{ display: table-cell; }";

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
	css += ".smallLabel { text-align: center; font-weight:normal; color:#6e96be;}";
	css += ".col11, .col12, .col13, .col14 { width:40px; text-align:center; }";

	// Enrollment Data 
	css += ".enrollmentMsg { /*background-color:#d4d4d4;*/ text-align:center; }";
	css += ".col18 { width:160px; }";
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
	css += "tbody.highlight:hover, tbody.lecture:hover { background-color:#dfffa4; }";
	css += "tbody.lecture { background-color:#f1f1f1; }";
	css += "tbody.lecture tr:first-child > td { font-weight:bold; }";
	css += "tbody.lecture .rowBorder { border-bottom:1px dotted #CCC; }";


	// onclick row highlighting
	css += "tbody.highlightonclick, tbody.highlightonclick:active, tbody.highlightonclick:visited { background-color:#fff98a; }";
	css += "tbody.highlightonclick:hover { background-color:#ffd964; }";
	css += ".highlightCursor, a { cursor:pointer; }";

	// key
	css += ".key { font-size:.9em; font-family:Helvetica, Arial, sans-serif; text-align:right; color:#666; }";
	css += "table.hide300 { display:none; background-color:#000; }";

	// turn of bg on ccn
	css += "table.nobg .open, table.nobg .openButWaitlist, table.nobg .full { background-color:transparent; color:#000;}";

	// controls
	css += "#controls { float:left; background-color:#f3f3f3; font-size:.7em; font-family: arial, tahoma, verdana; padding:5px; color:#666; margin:5px 0 0 0; border:1px solid #CCC; text-align:center; opacity: .9; border-radius:5px; }";
	css += "#controls hr { background-color:#CCC; height:1px; border:0px; float:left; width:100%;}";
	css += "#controls input { padding:0px; margin:2px 2px 0 2px; }";
	css += ".checkboxElement {float:left; width:150px; text-align:left;}";

	// sidebar
	css += "#sidebar {width:220px; float:right; text-align:center;z-index:100; position:fixed; right:10px; top:10px; color:#666;}";
	css += "#sidebar a {color:#9f911e;}";
	css += "#sidebar a:hover {color:#9f911e; text-decoration: underline; background-color:transparent;}";

	// configuration link
	css += "#configContainer { float:top left; text-align:center; background-color:#fffcb8; font-size:.7em; font-family:arial, tahoma, san-serif; padding:5px; border:1px solid #decc35; opacity:.8; border-radius:5px;}";

	// highlighted Courses
	css += "#highlightedCourses {float:left; background-color:#f3f3f3; border:1px solid #CCC; padding:5px; font-family: arial, tahoma, sans-serif; font-size:.9em; color:#666; z-index:100; position:fixed; opacity:.95; border-radius:5px; }";
	css += "#close a, #close { color:#666; font-size:8pt; }"

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

/*
 * Create Key
 */
	
UCBSE.key = (function()
{
	var table = document.createElement("table");
	table.setAttribute("id", "key");
	table.innerHTML = '<tr><td><div class="key"><span class="open">GREEN</span> indicates that the class is open and there are seats available. <span class="openButWaitlist">ORANGE</span> indicates there are seats are available, but there is a waitlist. <span class="full">RED</span> indicates that the class is full or has been cancelled.</div></td></tr>';

	document.body.insertBefore(table, document.body.firstChild.nextSibling.nextSibling);
}());

/*
 * Create new table
 */
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
			tableRows += '<td><div class="col2">CCN</div></td>';	
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
		if(prevCourseNum !== crs.getCourseNum())
		{
			prevCourseNum = crs.getCourseNum();

			tableRows += '<tr class="courseTopPadding"><td colspan="18"></td></tr>';
			tableRows += '<tr class="title">';
			tableRows += '<td align="right" valign="middle" class="titleLeftBorder col1">' + nullToEmpty(crs.getCourseNum()) + '</td>';
			tableRows += '<td colspan="9" valign="middle">';
			tableRows += '<div style="float:left;">';
			tableRows += '<a onclick="' + crs.getCatalogDescLink() + '" target="_blank">' + nullToEmpty(crs.getTitle()) + '</a>';

			if(crs.getCourseWebsite())
				tableRows += ' <a href="' + crs.getCourseWebsite() + '" target="_blank">(Course Website)</a>';

			tableRows += '</div>';
			tableRows += '<div style="float:right;" class="adviceLinks">';
		
			deptAbrev = crs.getDepartmentAbrev();

			tableRows += '<a href="' + 'http://www.koofers.com/search?q=' + encodeURI(deptAbrev + ' ' + crs.getCourseNum()) + '" target="blank">[K]</a> ';
			tableRows += '<a href="' + 'http://www.myedu.com/search?q=' + encodeURI(deptAbrev + ' ' + crs.getCourseNum()) + '&doctype=course&facets=school-name:University+of+California%2C+Berkeley|dept-abbrev:' + encodeURI(deptAbrev) + '&search_school=University+of+California%2C+Berkeley&config=' + '" target="blank">[ME]</a> ';
			tableRows += '<a href="' + 'https://www.courserank.com/berkeley/search#query=' + encodeURI(deptAbrev + ' ' + crs.getCourseNum()) + '&filter_term_currentYear=on' + '" target="blank">[CR]</a>';
			tableRows += '</div>';
			tableRows += '<div style="clear:both"></div>';

			tableRows += '</td>';
			tableRows += '<td><div class="smallLabel col11"><small>Limit</small></div></td>';	
			tableRows += '<td><div class="smallLabel col12"><small>Enrolled</small></div></td>';	
			tableRows += '<td><div class="smallLabel col13"><small>Waitlist</small></div></td>';	
			tableRows += '<td><div class="smallLabel col14"><small>Avail Seats</small></div></td>';	
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

		// highlight lecture
		if(crs.getClassType() == "LEC")
			tableRows += 'lecture ';

		// highlight the saved highlighted courses
		if(UCBSE.searchCourses(crs, UCBSE.highlightedCourses) != null)
		{

			tableRows += 'highlightonclick';
			console.log("true");
		}
		else
		{
			console.log("false");
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

		tableRows += '<td class="' + crs.needRowBorder() + ' col15"><div class="restrictions"><small>' + crs.getRestrictions() + '</small></div></td>';
		tableRows += '<td class="' + crs.needRowBorder() + ' col16"><div class="statusLastChanged"><small>' + crs.getStatusLastChanged() + '</small></div></td>';
		tableRows += '<td class="col17"><div class="links">';

		if(crs.getEnrollmentLink())
			tableRows += '<a onclick="' + crs.getEnrollmentLink()+ '" target="_blank" alt="Enrollment">[E]</a> ';
		if(crs.getBookLink())
			tableRows += '<a onclick="' + crs.getBookLink() + '" target="_blank" alt="Books">[B]</a>';

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
	highlightCells = table.getElementsByClassName("highlightCursor");

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

	var controlLabelContainer = document.createElement("div");
	controlLabelContainer.setAttribute("class", "checkboxElement");

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

	container.appendChild(closeContainer("controls", 900, "isControls"));

	// Configuration container 
	var toggleControlsContainer = document.createElement("div");
	toggleControlsContainer.setAttribute("id", "configContainer");

	// Highlighted Courses link 

	var toggleHighlightedCourses = document.createElement("a");
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
