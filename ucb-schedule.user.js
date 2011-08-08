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
	str = "{ ";
	for(var key in arr)
	{
		str += "'" + key + "' : '" + arr[key] + "', ";
	}
	str = str.replace(/,[\s]*$/, '');
	str += "}";
	return str;
}

function toggleColumn(element, n) {
    var currentClass = document.getElementById(element).className;
    if (currentClass.indexOf("hide"+n) != -1) {
        document.getElementById(element).className = currentClass.replace("hide"+n, "");
    }
    else {
        document.getElementById(element).className += " " + "hide"+n;
    }
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
	toggleColElement.addEventListener("click", function() { if(GM_getValue("isCol" + n) == "false") GM_setValue("isCol" + n, "true"); else GM_setValue("isCol" + n, "false"); console.log(GM_getValue("isCol" + n));}, false);
	
    	var currentClass = document.getElementById(id).className;
	if(GM_getValue("isCol" + n) != "false")
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
	newwindow = window.open(url, name, "width=" + width + ",height=" + height);
	if(window.focus) { newwindow.focus() }
	return false;
}

function highlightRow(element) 
{
	if(element.className == 'highlight')
		element.className = 'highlightonclick';
	else if(element.className == 'lecture')
		element.className = 'lecture highlightonclick';
	else if(element.className == 'lecture highlightonclick')
		element.className = 'lecture';
	else
		element.className = 'highlight';
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
		GM_setValue("isMaximum", "false");
		removeClass(table, 'enhancedFull');
		addClass(table, 'enhanced');
	}
	else
	{
		removeClass(table, 'enhanced');
		addClass(table, 'enhancedFull');
		GM_setValue("isMaximum", "true");
	}

}

function toggleCCNBg()
{
    var currentClass = document.getElementById("enhanced");

	if(GM_getValue("isBg") == "false")
	{
		removeClass(currentClass, "nobg");

		GM_setValue("isBg", "true");
	}
	else
	{
		addClass(currentClass, "nobg");

		GM_setValue("isBg", "false");
	}
}

function hasClass(ele,cls) {
	if ((typeof(ele) == 'undefined') || (ele == null)) {
		console.log(arguments.callee.caller);
		return false;
	}
	return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}
function addClass(ele,cls) {
	if (!hasClass(ele,cls)) ele.className += " "+cls;
}
function removeClass(ele,cls) {
	if (hasClass(ele,cls)) {
		var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		ele.className=ele.className.replace(reg,' ');
	}
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


/*
 * strips a string of the trailing and leading whitespace
 *
 * @return string
 */
function stripSpace(str)
{
	return str.replace(/^(\s|&nbsp;)+/, "").replace(/(\s|&nbsp)+$/, "");
}

function Course()
{

}

Course.prototype.department = "";
Course.prototype.departmentAbrev = "";
Course.prototype.ccn = "";
Course.prototype.ps = "";
Course.prototype.secNum = "";
Course.prototype.classType = "";
Course.prototype.title = "";
Course.prototype.catalogDescLink = "";
Course.prototype.locn = "";
Course.prototype.instructor = "";
Course.prototype.lastName = "";
Course.prototype.note = "";
Course.prototype.bookLink = "";
Course.prototype.units = "";
Course.prototype.finalExamGroup = "";
Course.prototype.restrictions = "";
Course.prototype.limit = null;
Course.prototype.enrolled = null;
Course.prototype.waitlist = null;
Course.prototype.availSeats = null;
Course.prototype.enrollmentLink = "";
Course.prototype.enrollmentMsg = "";
Course.prototype.statusLastChanged = "";
Course.prototype.sessionDates = "";
Course.prototype.summerFees = "";
Course.prototype.courseWebsite = "";
Course.prototype.days = "";
Course.prototype.room = "";
Course.prototype.time = "";

Course.prototype.getDeptAbrev = function(str)
{
	departments = [
		{ shortName: "AEROSPC", name: "AEROSPACE STUDIES" },
		{ shortName: "AFRICAM", name: "AFRICAN AMERICAN STUDIES" },
		{ shortName: "AGR CHM", name: "AGRICULTURAL AND ENVIRON CHEMISTRY" },
		{ shortName: "A,RESEC", name: "AGRICULTURAL AND RESOURCE ECONOMICS" },
		{ shortName: "AMERSTD", name: "AMERICAN STUDIES" },
		{ shortName: "AHMA", name: "ANCIENT HISTORY AND MED. ARCH." },
		{ shortName: "ANTHRO", name: "ANTHROPOLOGY" },
		{ shortName: "AST", name: "APPLIED SCIENCE AND TECHNOLOGY" },
		{ shortName: "ARABIC", name: "ARABIC" },
		{ shortName: "ARCH", name: "ARCHITECTURE" },
		{ shortName: "ASAMST", name: "ASIAN AMERICAN STUDIES" },
		{ shortName: "ASIANST", name: "ASIAN STUDIES" },
		{ shortName: "ASTRON", name: "ASTRONOMY" },
		{ shortName: "BANGLA", name: "BENGALI" },
		{ shortName: "BIO ENG", name: "BIOENGINEERING" },
		{ shortName: "BIOLOGY", name: "BIOLOGY" },
		{ shortName: "BIOPHY", name: "BIOPHYSICS" },
		{ shortName: "BUDDHSM", name: "BUDDHISM" },
		{ shortName: "CATALAN", name: "CATALAN" },
		{ shortName: "CELTIC", name: "CELTIC STUDIES" },
		{ shortName: "CHM ENG", name: "CHEMICAL & BIOMOLECULAR ENGINEERING" },
		{ shortName: "CHEM", name: "CHEMISTRY" },
		{ shortName: "CHICANO", name: "CHICANO STUDIES" },
		{ shortName: "CHINESE", name: "CHINESE" },
		{ shortName: "CY PLAN", name: "CITY AND REGIONAL PLANNING" },
		{ shortName: "CIV ENG", name: "CIVIL AND ENVIRONMENTAL ENGINEERING" },
		{ shortName: "CLASSIC", name: "CLASSICS" },
		{ shortName: "COG SCI", name: "COGNITIVE SCIENCE" },
		{ shortName: "COLWRIT", name: "COLLEGE WRITING PROGRAM" },
		{ shortName: "COMPBIO", name: "COMPARATIVE BIOCHEMISTRY" },
		{ shortName: "COM LIT", name: "COMPARATIVE LITERATURE" },
		{ shortName: "CGB", name: "COMPUTATIONAL AND GENOMIC BIOLOGY" },
		{ shortName: "COMPSCI", name: "COMPUTER SCIENCE" },
		{ shortName: "CRIT TH", name: "CRITICAL THEORY GRADUATE GROUP" },
		{ shortName: "CUNEIF", name: "CUNEIFORM" },
		{ shortName: "DEMOG", name: "DEMOGRAPHY" },
		{ shortName: "DEV STD", name: "DEVELOPMENT STUDIES" },
		{ shortName: "DUTCH", name: "DUTCH" },
		{ shortName: "EPS", name: "EARTH AND PLANETARY SCIENCE" },
		{ shortName: "EA LANG", name: "EAST ASIAN LANGUAGES AND CULTURES" },
		{ shortName: "EAEURST", name: "EAST EUROPEAN STUDIES" },
		{ shortName: "ECON", name: "ECONOMICS" },
		{ shortName: "EDUC", name: "EDUCATION" },
		{ shortName: "EGYPT", name: "EGYPTIAN" },
		{ shortName: "EL ENG", name: "ELECTRICAL ENGINEERING" },
		{ shortName: "ENE,RES", name: "ENERGY AND RESOURCES GROUP" },
		{ shortName: "ENGIN", name: "ENGINEERING" },
		{ shortName: "ENGLISH", name: "ENGLISH" },
		{ shortName: "ESPM", name: "ENVIRON SCI, POLICY, AND MANAGEMENT" },
		{ shortName: "ENV DES", name: "ENVIRONMENTAL DESIGN" },
		{ shortName: "ENVECON", name: "ENVIRONMENTAL ECONOMICS AND POLICY" },
		{ shortName: "ENV SCI", name: "ENVIRONMENTAL SCIENCES" },
		{ shortName: "ETH STD", name: "ETHNIC STUDIES" },
		{ shortName: "ETH GRP", name: "ETHNIC STUDIES GRADUATE GROUP" },
		{ shortName: "EURA ST", name: "EURASIAN STUDIES" },
		{ shortName: "EWMBA", name: "EVE/WKND MASTERS IN BUS. ADM." },
		{ shortName: "XMBA", name: "EXECUTIVE MASTERS IN BUS. ADM." },
		{ shortName: "FILIPN", name: "FILIPINO" },
		{ shortName: "FILM", name: "FILM AND MEDIA" },
		{ shortName: "FOLKLOR", name: "FOLKLORE" },
		{ shortName: "FRENCH", name: "FRENCH" },
		{ shortName: "GWS", name: "GENDER AND WOMEN'S STUDIES" },
		{ shortName: "GEOG", name: "GEOGRAPHY" },
		{ shortName: "GERMAN", name: "GERMAN" },
		{ shortName: "GMS", name: "GLOBAL METROPOLITAN STUDIES" },
		{ shortName: "GPP", name: "GLOBAL POVERTY AND PRACTICE" },
		{ shortName: "GSPDP", name: "GRAD STUDENT PROF DEVELOPMENT PGM" },
		{ shortName: "GREEK", name: "GREEK" },
		{ shortName: "BUDDSTD", name: "GROUP IN BUDDHIST STUDIES" },
		{ shortName: "HMEDSCI", name: "HEALTH AND MEDICAL SCIENCES" },
		{ shortName: "HEBREW", name: "HEBREW" },
		{ shortName: "HIN-URD", name: "HINDI-URDU" },
		{ shortName: "HISTORY", name: "HISTORY" },
		{ shortName: "HISTART", name: "HISTORY OF ART" },
		{ shortName: "ILA", name: "INDIGENOUS LANGUAGES OF AMERICAS" },
		{ shortName: "IND ENG", name: "INDUSTRIAL ENGIN AND OPER RESEARCH" },
		{ shortName: "INFO", name: "INFORMATION" },
		{ shortName: "INFOSYS", name: "INFORMATION SYSTEMS AND MANAGEMENT" },
		{ shortName: "INTEGBI", name: "INTEGRATIVE BIOLOGY" },
		{ shortName: "IDS", name: "INTERDEPARTMENTAL STUDIES" },
		{ shortName: "ISF", name: "INTERDISCIPLINARY STUDIES FIELD MAJ" },
		{ shortName: "IAS", name: "INTERNATIONAL AND AREA STUDIES" },
		{ shortName: "IRANIAN", name: "IRANIAN" },
		{ shortName: "ITALIAN", name: "ITALIAN STUDIES" },
		{ shortName: "JAPAN", name: "JAPANESE" },
		{ shortName: "JEWISH", name: "JEWISH STUDIES" },
		{ shortName: "JOURN", name: "JOURNALISM" },
		{ shortName: "KHMER", name: "KHMER" },
		{ shortName: "KOREAN", name: "KOREAN" },
		{ shortName: "LD ARCH", name: "LANDSCAPE ARCHITECTURE" },
		{ shortName: "LAN PRO", name: "LANGUAGE PROFICIENCY PROGRAM" },
		{ shortName: "LANGPRO", name: "LANGUAGE PROFICIENCY PROGRAM" },
		{ shortName: "LATIN", name: "LATIN" },
		{ shortName: "LATAMST", name: "LATIN AMERICAN STUDIES" },
		{ shortName: "LAW", name: "LAW" },
		{ shortName: "LEGALST", name: "LEGAL STUDIES" },
		{ shortName: "LGBT", name: "LESBIAN GAY BISEXUAL TRANSGENDER ST" },
		{ shortName: "L ~ S", name: "LETTERS AND SCIENCE" },
		{ shortName: "LINGUIS", name: "LINGUISTICS" },
		{ shortName: "MALAY/I", name: "MALAY/INDONESIAN" },
		{ shortName: "MASSCOM", name: "MASS COMMUNICATIONS" },
		{ shortName: "MBA", name: "MASTERS IN BUSINESS ADMINISTRATION" },
		{ shortName: "MFE", name: "MASTERS IN FINANCIAL ENGINEERING" },
		{ shortName: "MAT SCI", name: "MATERIALS SCIENCE AND ENGINEERING" },
		{ shortName: "MATH", name: "MATHEMATICS" },
		{ shortName: "MEC ENG", name: "MECHANICAL ENGINEERING" },
		{ shortName: "MEDIAST", name: "MEDIA STUDIES" },
		{ shortName: "MED ST", name: "MEDIEVAL STUDIES" },
		{ shortName: "M E STU", name: "MIDDLE EASTERN STUDIES" },
		{ shortName: "MIL AFF", name: "MILITARY AFFAIRS" },
		{ shortName: "MIL SCI", name: "MILITARY SCIENCE" },
		{ shortName: "MCELLBI", name: "MOLECULAR AND CELL BIOLOGY" },
		{ shortName: "MUSIC", name: "MUSIC" },
		{ shortName: "NSE", name: "NANOSCALE SCIENCE AND ENGINEERING" },
		{ shortName: "NATAMST", name: "NATIVE AMERICAN STUDIES" },
		{ shortName: "NAT RES", name: "NATURAL RESOURCES" },
		{ shortName: "NAV SCI", name: "NAVAL SCIENCE" },
		{ shortName: "NE STUD", name: "NEAR EASTERN STUDIES" },
		{ shortName: "NEUROSC", name: "NEUROSCIENCE" },
		{ shortName: "CNM", name: "NEW MEDIA" },
		{ shortName: "NWMEDIA", name: "NEW MEDIA" },
		{ shortName: "NUC ENG", name: "NUCLEAR ENGINEERING" },
		{ shortName: "NUSCTX", name: "NUTRITIONAL SCIENCES AND TOXICOLOGY" },
		{ shortName: "OC ENG", name: "OCEAN ENGINEERING" },
		{ shortName: "OPTOM", name: "OPTOMETRY" },
		{ shortName: "PACS", name: "PEACE AND CONFLICT STUDIES" },
		{ shortName: "PERSIAN", name: "PERSIAN" },
		{ shortName: "PHDBA", name: "PH.D. IN BUSINESS ADMINISTRATION" },
		{ shortName: "PHILOS", name: "PHILOSOPHY" },
		{ shortName: "PHYS ED", name: "PHYSICAL EDUCATION" },
		{ shortName: "PHYSICS", name: "PHYSICS" },
		{ shortName: "PLANTBI", name: "PLANT AND MICROBIAL BIOLOGY" },
		{ shortName: "POLECIS", name: "POLITICAL ECONOMY OF INDUSTRIAL SOC" },
		{ shortName: "POL SCI", name: "POLITICAL SCIENCE" },
		{ shortName: "PORTUG", name: "PORTUGUESE" },
		{ shortName: "ART", name: "PRACTICE OF ART" },
		{ shortName: "PSYCH", name: "PSYCHOLOGY" },
		{ shortName: "PB HLTH", name: "PUBLIC HEALTH" },
		{ shortName: "PUB POL", name: "PUBLIC POLICY" },
		{ shortName: "PUNJABI", name: "PUNJABI" },
		{ shortName: "RELIGST", name: "RELIGIOUS STUDIES" },
		{ shortName: "RHETOR", name: "RHETORIC" },
		{ shortName: "SANSKR", name: "SANSKRIT" },
		{ shortName: "SCANDIN", name: "SCANDINAVIAN" },
		{ shortName: "SCMATHE", name: "SCIENCE AND MATHEMATICS EDUCATION" },
		{ shortName: "SEMITIC", name: "SEMITICS" },
		{ shortName: "SLAVIC", name: "SLAVIC LANGUAGES AND LITERATURES" },
		{ shortName: "SOC WEL", name: "SOCIAL WELFARE" },
		{ shortName: "SOCIOL", name: "SOCIOLOGY" },
		{ shortName: "S ASIAN", name: "SOUTH ASIAN" },
		{ shortName: "S,SEASN", name: "SOUTH AND SOUTHEAST ASIAN STUDIES" },
		{ shortName: "SEASIAN", name: "SOUTHEAST ASIAN" },
		{ shortName: "SPANISH", name: "SPANISH" },
		{ shortName: "STAT", name: "STATISTICS" },
		{ shortName: "STUDIES", name: "STUDIES" },
		{ shortName: "TAGALG", name: "TAGALOG" },
		{ shortName: "TAMIL", name: "TAMIL" },
		{ shortName: "TELUGU", name: "TELUGU" },
		{ shortName: "THAI", name: "THAI" },
		{ shortName: "THEATER", name: "THEATER, DANCE, AND PERFORMANCE ST" },
		{ shortName: "TIBETAN", name: "TIBETAN" },
		{ shortName: "TURKISH", name: "TURKISH" },
		{ shortName: "UGIS", name: "UNDERGRAD INTERDISCIPLINARY STUDIES" },
		{ shortName: "UGBA", name: "UNDERGRAD. BUSINESS ADMINISTRATION" },
		{ shortName: "UNIVEXT", name: "UNIVERSITY EXTENSION" },
		{ shortName: "VIETNMS", name: "VIETNAMESE" },
		{ shortName: "VIS SCI", name: "VISION SCIENCE" },
		{ shortName: "VIS STD", name: "VISUAL STUDIES" },
		{ shortName: "YIDDISH", name: "YIDDISH" }
	];

	for(var i = 0, len = departments.length; i < len; i++)
	{
		if(str.match(departments[i].name))
			return departments[i].shortName;
	}
	return str;
}

/*
 * @return string the link inside the href property
 */

Course.prototype.extractHref = function(str)
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
}

/*
 * splits a string up into tokens based on word boundaries
 *
 * For example. "how    are you doin." is transformed into
 * "how" "are" "you" "doin."
 *
 * @return array of strings 
 */

Course.prototype.tokenize = function(str)
{
	str = str.match(/[A-Za-z0-9.-]+/g) + "";
	return str.split(',');
}

/**
 * Selects all TT tags in the entry and sets the according 
 * properties
 */

Course.prototype.parseTT = function(table)
{
	ttArr = table.querySelectorAll('TT');
	bArr = table.querySelectorAll('TD[ALIGN="right"] FONT[size="1"] B');


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

}

Course.prototype.parseInstructor = function(str)
{
	if(str)
	{
		this.instructor = stripSpace(str);
		this.lastName = str.replace(/,[^$]*$/g, '');
	}
}

Course.prototype.parseCourseTitle = function(table)
{
	htmlCourseTitle = table.getElementsByClassName("coursetitle")[0];
	this.title = strip(htmlCourseTitle.innerHTML);
}

Course.prototype.parseLocn = function(str)
{
	var temp;
	temp = str.match(/^[\s]*[MTWFuhSA]{1,7}[\s]+[0-9\-AP]+,/);
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
}

Course.prototype.parseCourseControlNumber = function(str)
{
	var temp;

	temp = str.match(/^[0-9]+/);
	if(temp != null)
		this.ccn = temp[0];
	else
	{
		temp = str.match(/^[0-9A-Za-z ]+(?=\s*<)?/);
		this.ccn = temp[0];
	}
}

Course.prototype.fancyCourseControlNumber = function(str)
{
	fanCCN = "";

	cssClass = "";
	if(this.isFull() == 1)
		cssClass += "full";
	else if(this.isFull() == 0)
		cssClass += "open";
	else if(this.isFull() == -1)
		cssClass += "openButWaitlist";
	else
		cssClass += "full";
	
	fanCCN += '<td class="col2 ccn ' + this.needRowBorder() + '">'
	if(str.match(/[0-9]+/) != null)
		fanCCN += '<input type="text" onclick="select()" class="ccnInput ' + cssClass + '" value="' + str + '" >';
	else
		fanCCN += '<b>' + str + '</b>';
	
	fanCCN += '</td>';
	return fanCCN;
}

Course.prototype.parseEnrollment = function(str)
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
}

/*
 * @return string "javascript:call_to_function()"
 */
Course.prototype.parseLinks = function(table)
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

			catalogDescParams['p_dept_name'] = spaceToPlus(this.department);
			catalogDescParams['p_dept_cd'] = spaceToPlus(this.departmentAbrev);
			catalogDescParams['p_title'] = "";
			catalogDescParams['p_number'] = this.courseNum;

			catalogDescLink = "javascript:post_to_url('http://osoc.berkeley.edu/catalog/gcc_sso_search_sends_request', ";
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
}

/**
 * Parses the course under the "Course" label
 */
Course.prototype.parseCourse = function(table)
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

		this.department = courseName;					// Department
		this.departmentAbrev = this.getDeptAbrev(courseName); // Department Abrev
		this.courseNum = str[beginCourseIndex];			// Course Number
		this.ps = str[beginCourseIndex + 1];			// P/S (not sure what P or S means)
		this.secNum = str[beginCourseIndex + 2];		// Section Number
		this.classType = str[beginCourseIndex + 3];		// Class type (LEC, SEM, LAB, etc.)

	}
}

/**
 * Parses the note. It removes the html code for the space and
 * sets it to an empty string.
 */
Course.prototype.parseNote = function(str)
{
	this.note = stripSpace(str);
}


/**
 * Parses status. removes the html code for the space and sets 
 * to an empty trying if there is only a space there.
 */
Course.prototype.parseStatus = function(str)
{
	this.statusLastChanged = stripSpace(str);
}

/**
 * Removes the date from the Final Exam Group leaving only
 * the number
 */
Course.prototype.parseFinalExamGroup = function(str)
{
	var temp = str.match("^[0-9][0-9]*(?=:)");
	if(temp != null)
		this.finalExamGroup = temp[0];
	else
		this.finalExamGroup = str;
}

/**
 * used for debugging
 *
 * @return dump of course object in log
 */
Course.prototype.log = function()
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
}
/*
 * Determines if the second row is required
 *
 * @return true, false
 */
Course.prototype.needSecondRow = function()
{
	if(this.note != "" || this.summerFees != "" || this.sessionDates != "")
		return true;
	else
		return false;
}

/*
 * Appends row border where specified depending if a 
 * second row is required
 *
 * @return string
 */
Course.prototype.needRowBorder = function()
{
	if(!this.needSecondRow())
		return " rowBorder";
	else
		return "";
}

/*
 * Produces the days in a fancy format
 *
 * @return string
 */
Course.prototype.fancyDays = function(days)
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
}

/*
 * @return 1 if full or canceled, 0 if open, -1 if open but theres a waitlist
 */
Course.prototype.isFull = function()
{
	if((this.days).match(/CANCELLED/))
		return 1;
	if(this.limit == this.enrolled)
		return 1;
	if(this.enrolled < this.limit && this.waitlist > 0)
		return -1;
	if(this.enrolled < this.limit)
		return 0;
}

Course.prototype.isFinalExamGroup = function()
{
	if(this.finalExamGroup == "")
		return false;
	else 
		return true;
}

/*
 * Parse all the information into an array of courses
 */
var courseList = (function()
{
	var entryList = document.querySelectorAll("TABLE");
	var imgList = document.querySelectorAll('IMG[src="http://schedule.berkeley.edu/graphs/hr2.gif"]');
	var courseList = Array();

	for(var i = 1, len = entryList.length; i < len - 1; i++)
	{
		var crs = new Course();

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
var newStylesheet = (function()
{
	var head = document.querySelector("HEAD");
	var styleElt = document.createElement("style");

	css = "";
	css += "body { font-family:arial, tahoma, verdana; } ";
	css += "table, tr, td { font-size: 0.9em; } ";
	css += "table { empty-cells:show; }";
	css += ".enhancedFull { width:100%; }";
	css += ".enhanced { width:auto; }";

	css += "table.hide1 .col1,";

	var numCol = 18;
	// col18 = enrollment message

	for(var i = 1; i <= numCol - 1; i++)
		css += "table.hide" + i + " .col" + i + ",";
	css += "table.hide" + i + " .col" + i;

	css += "{ /*display: none; position:absolute; left:-9999px;*/ display:none;}";

	for(var i = 1; i <= numCol - 1; i++)
		css += ".col" + i + ",";
	css += ".col" + i;

	css += "{ display: table-cell; }";

	// for showing and hiding second row
	css += "table.hide200 .col200 { display:none; }";

	// for showing and hiding controls
	css += "div.hide900 { display:none; background-color:#000; }";

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
	css += ".enrollDataFiller, .enrollmentMsg { border-left:1px dotted #CCC; border-right:1px dotted #CCC; }";

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
	css += ".ccn { white-space:nowrap; border-right: 1px dotted #CCC;}";
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
	css += "#controls { float:left; background-color:#f3f3f3; font-size:.7em; font-family: arial, tahoma, verdana; padding:5px; margin:5px; color:#666; width:150px; border:1px solid #CCC; text-align:center; opacity: .9;}";
	css += "#controls hr { background-color:#CCC; height:1px; border:0px; float:left; width:100%;}";
	css += "#controls input { padding:0px; margin:2px 2px 0 2px; }";
	css += ".checkboxElement {float:left; width:150px; text-align:left;}";

	// sidebar
	css += "#sidebar {width:165px; float:right; text-align:right;z-index:100; position:absolute; right:10px; top:10px; }";

	// configuration link
	css += "#configLink { float:top left; text-align:right;}";



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

	head.appendChild(jsElt);
}());

/*
 * Create Key
 */
	
var newKey = (function()
{
	var table = document.createElement("table");
	table.setAttribute("id", "key");
	table.innerHTML = '<tr><td><div class="key"><span class="open">GREEN</span> indicates that the class is open and there are seats available. <span class="openButWaitlist">ORANGE</span> indicates there are seats are available, but there is a waitlist. <span class="full">RED</span> indicates that the class is full or has been cancelled.</div></td></tr>';

	document.body.insertBefore(table, document.body.firstChild.nextSibling.nextSibling);
}());

/*
 * Create new table
 */
var newTable = (function(courseList)
{
	var body = document.body;
	body.setAttribute("background", "");
	var table = document.createElement("table");
	table.setAttribute("id", "enhanced");

	if(GM_getValue("isMaximum") != "false")
		table.setAttribute("class", "enhancedFull");
	else
		table.setAttribute("class", "enhanced");


	table.setAttribute("cellspacing", "0");
	var tableList = document.getElementsByTagName("TABLE");
	
	body.insertBefore(table, body.firstChild.nextSibling.nextSibling.nextSibling);

	var tableRows = "";
	var prevCourseNum = "";
	var prevDepartment = "";


	for(var i = 0, len = courseList.length; i < len; i++)
	{
		var crs = courseList[i];
		
		// Department Title
		if(prevDepartment !== crs.department)
		{
			prevDepartment = crs.department;
			tableRows += '<tr class="departmentTopPadding"><td colspan="13"></td></tr>';
			tableRows += '<tr>';
			tableRows += '<td colspan="18" class="department">' + crs.department + '</td>';
			tableRows += '</tr>';
			tableRows += '<tr class="topRow">';
			tableRows += '<td class="col1" width="50" align="right">Course Number</td>';	
			tableRows += '<td class="col2">CCN</td>';	
			tableRows += '<td class="col3" width="30">Class<br>Type</td>';	
			tableRows += '<td class="col4" width="30">Section<br>Number</td>';	
			tableRows += '<td class="col5" width="40">Units</td>';	
			tableRows += '<td align="left"><div class="col6">Instructor</div></td>';	
			tableRows += '<td align="left"><div class="col7">Days</div></td>';	
			tableRows += '<td align="left"><div class="col8">Time</div></td>';	
			tableRows += '<td align="left"><div class="col9">Location</div></td>';	
			tableRows += '<td><div class="col10">Final<br>Exam<br>Group</div></td>';	
			tableRows += '<td colspan="8"></td>';	
			tableRows += '</tr>';
		}
		
		// Course Title
		if(prevCourseNum !== crs.courseNum)
		{
			prevCourseNum = crs.courseNum;

			tableRows += '<tr class="courseTopPadding"><td colspan="18"></td></tr>';
			tableRows += '<tr class="title">';
			tableRows += '<td align="right" valign="middle" class="titleLeftBorder col1">' + crs.courseNum + '</td>';
			tableRows += '<td colspan="9" valign="middle">';
			tableRows += '<span style="float:left;">';
			tableRows += '<a onclick="' + crs.catalogDescLink + '" target="_blank">' + crs.title + '</a>';
			if(crs.courseWebsite != "")
				tableRows += ' <a href="' + crs.courseWebsite + '" target="_blank">(Course Website)</a>';
			tableRows += '</span>';
			tableRows += '<span style="float:right;" class="adviceLinks">';
		
			deptAbrev = crs.departmentAbrev;

			tableRows += '<a href="' + 'http://www.koofers.com/search?q=' + encodeURI(deptAbrev + ' ' + crs.courseNum) + '" target="blank">[K]</a> ';
			tableRows += '<a href="' + 'http://www.myedu.com/search?q=' + encodeURI(deptAbrev + ' ' + crs.courseNum) + '&doctype=course&facets=school-name:University+of+California%2C+Berkeley|dept-abbrev:' + encodeURI(deptAbrev) + '&search_school=University+of+California%2C+Berkeley&config=' + '" target="blank">[ME]</a> ';
			tableRows += '<a href="' + 'https://www.courserank.com/berkeley/search#query=' + encodeURI(deptAbrev + ' ' + crs.courseNum) + '&filter_term_currentYear=on' + '" target="blank">[CR]</a>';
			tableRows += '</span>';
			tableRows += '<div style="clear:both"></div>';

			tableRows += '</td>';
			tableRows += '<td class="smallLabel"><div class="col11"><small>Limit</small></div></td>';	
			tableRows += '<td class="smallLabel"><div class="col12"><small>Enrolled</small></div></td>';	
			tableRows += '<td class="smallLabel"><div class="col13"><small>Waitlist</small></div></td>';	
			tableRows += '<td class="smallLabel"><div class="col14"><small>Avail Seats</small></div></td>';	
			tableRows += '<td class="smallLabel"><div class="col15"><small>Restrictions</small></div></td>';	
			tableRows += '<td class="smallLabel"><div class="col16"><small>Status</small></div></td>';	
			tableRows += '<td class="col17"></td>';
			tableRows += '</td>';
			tableRows += '</tr>';
			tableRows += '<tr class="courseBottomPadding"><td colspan="13"></td></tr>';
		} 
		
		// Course Body
		
		tableRows += '<tbody ';

		if(crs.classType == "LEC")
			tableRows += 'class="lecture"';
		else
			tableRows += 'class="highlight"';

		tableRows += '>';

		tableRows += '<td class="col1 highlightCursor" onclick="javascript:highlightRow(this.parentNode.parentNode);"></td>'
		tableRows += crs.fancyCourseControlNumber(crs.ccn);
		tableRows += '<td class="col3 classType' + crs.needRowBorder() + '">' + crs.classType + '</td>';
		tableRows += '<td class="col4 secNum' + crs.needRowBorder() + '">' + crs.secNum + '</td>';
		tableRows += '<td class="col5 units' + crs.needRowBorder() + '">' + crs.units + '</td>';
		tableRows += '<td class="instructor' + crs.needRowBorder() + '"><div class="col6">';

		if(crs.instructor.match(/THE STAFF/))
			tableRows += crs.instructor;
		else if(crs.instructor != "")
			tableRows += '<a href="http://www.ratemyprofessors.com/SelectTeacher.jsp?the_dept=All&sid=1072&orderby=TLName&letter=' + crs.lastName + '" target="_blank">' + crs.instructor + '</a>';

		tableRows += '</div></td>';

		if(crs.locn == "")
		{
			if(crs.isFinalExamGroup())
				numCol = 1;
			else
				numCol = 2;

			tableRows += '<td class="' + crs.needRowBorder() + '"><div class="days col7">' + crs.fancyDays(crs.days) +'</div></td>';
			tableRows += '<td class="time ' + crs.needRowBorder() + '"><div class="col8">' + crs.time + '</div></td>';
			tableRows += '<td colspan="' + numCol + '" class="room ' + crs.needRowBorder() + '"><div class="col9">' + crs.room + '</div></td>';
		}
		else
		{
			if(crs.isFinalExamGroup())
				numCol = 3;
			else
				numCol = 4;

			tableRows += '<td colspan="' + numCol + '" class="locn' + crs.needRowBorder() + '"><div class="col9">' + crs.locn + '</div></td>';
		}
		
		if(crs.isFinalExamGroup())
			tableRows += '<td class="finalExamGroup' + crs.needRowBorder() + '"><div class="col10">' + crs.finalExamGroup + '</div></td>';

		if(!crs.enrollmentMsg)
		{
			tableRows += '<td class="enrollDataLeft' + crs.needRowBorder() + '"><div class="col11">' + crs.limit + '</td>';
			tableRows += '<td class="enrollData' + crs.needRowBorder() + '"><div class="col12">' + crs.enrolled + '</td>';
			tableRows += '<td class="enrollData' + crs.needRowBorder() + '"><div class="col13">' + crs.waitlist + '</td>';
			tableRows += '<td class="enrollDataRight' + crs.needRowBorder() + '"><div class="col14">' + crs.availSeats + '</td>';
		}
		else
		{
			tableRows += '<td colspan="4" class="enrollmentMsg' + crs.needRowBorder() + '"><div class="col18">' + crs.enrollmentMsg + '</div></td>';
		}

		tableRows += '<td class="restrictions col15' + crs.needRowBorder() + '"><small>' + crs.restrictions + '</small></td>';
		tableRows += '<td class="statusLastChanged col16' + crs.needRowBorder() + '"><small>' + crs.statusLastChanged + '</small></td>';
		tableRows += '<td class="links col17">';
			if(crs.enrollmentLink != "")
				tableRows += '<a onclick="' + crs.enrollmentLink+ '" target="_blank">[E]</a> ';
			if(crs.bookLink != "")
				tableRows += '<a onclick="' + crs.bookLink + '" target="_blank">[B]</a>';
		tableRows += '</td>';
		tableRows += '</tr>';

		// Second row (Note, Summer Session fees, etc.)
		tableRows += '<tr class="">';

		if(crs.needSecondRow())
		{
			tableRows += '<td class="highlightCursor col1" onclick="javascript:highlightRow(this.parentNode.parentNode);"></td>';
			tableRows += '<td class="col2 ccn rowBorder"></td>';
			tableRows += '<td class="col3 rowBorder"></td>';
			tableRows += '<td class="col4 rowBorder"></td>';
			tableRows += '<td class="col5 rowBorder"></td>';
			tableRows += '<td class="rowBorder" colspan="5">';
				if(crs.summerFees != "")
					tableRows += '<p class="col200 summerFees"><small><b>Summer Fees:</b> ' + crs.summerFees + '</small></p>';

				if(crs.sessionDates != "")
					tableRows += '<p class="col200 sessionDates"><small><b>Session Dates</b> ' + crs.sessionDates + '</small></p>';

				if(crs.note != "")
					tableRows += '<p class="col200 note"><small><b>Note:</b> ' + crs.note + '</small></p>';


			tableRows += '</td>';
			tableRows += '<td colspan="4" class="enrollDataFiller rowBorder"><span></span></td>';
			tableRows += '<td class="rowBorder" colspan="2"></td>';
			tableRows += '<td class="links"></td>';
		}

		tableRows += '</tr>';



		tableRows += '</tbody>';
	}
	
	// render new table
	table.innerHTML = tableRows;
}(courseList));

var controls = (function()
{
	// container for the controls
	var container = document.createElement("div");
	container.setAttribute("id", "controls");
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

	if(GM_getValue("isMaximum") == "true")
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

	if(GM_getValue("isBg") != "false")
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
	createToggleColumnElement(container, 7, "Days");
	createToggleColumnElement(container, 8, "Time");
	createToggleColumnElement(container, 9, "Location");
	createToggleColumnElement(container, 10, "Final Exam Group");
	createToggleColumnElement(container, 11, "Limit");
	createToggleColumnElement(container, 12, "Enrolled");
	createToggleColumnElement(container, 13, "Waitlist");
	createToggleColumnElement(container, 14, "Avail Seats");
	createToggleColumnElement(container, 15, "Restrictions");
	createToggleColumnElement(container, 16, "Status");
	createToggleColumnElement(container, 17, "Link");
	createToggleColumnElement(container, 18, "Enrollment Message");
	createToggleColumnElement(container, 200, "Second Row");

	// Configuration link
	var toggleControlsContainer = document.createElement("div");
	toggleControlsContainer.setAttribute("id", "configLink");
	var toggleControls = document.createElement("a");
	toggleControls.setAttribute("onclick", "toggleColumn('controls', 900)");
	toggleControls.innerHTML = "Configuration";
	toggleControlsContainer.appendChild(toggleControls);

	// Sidebar container
	var sidebarContainer = document.createElement("div");
	sidebarContainer.setAttribute("id", "sidebar");

	sidebarContainer.appendChild(toggleControlsContainer);
	sidebarContainer.appendChild(container);

	// Render Controls
	document.body.insertBefore(sidebarContainer, document.body.firstChild);
}());
