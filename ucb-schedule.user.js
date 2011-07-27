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

/*
function addClass(element, str)
{
	className = stripSpace(element.className);
	className += ' ' + str;
	element.className = className;
}

function removeClass(element, str)
{
	className = element.className;
	className.replace(str, "");
	element.className = stripSpace(className);
}
*/

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
Course.prototype.ccn = "";
Course.prototype.ps = "";
Course.prototype.secNum = "";
Course.prototype.classType = "";
Course.prototype.title = "";
Course.prototype.catalogDescLink = "";
Course.prototype.locn = "";
Course.prototype.instructor = "";
Course.prototype.note = "";
Course.prototype.bookLink = "";
Course.prototype.units = "";
Course.prototype.finalExamGroup = "";
Course.prototype.restrictions = "";
Course.prototype.limit = "";
Course.prototype.enrolled = "";
Course.prototype.waitlist = "";
Course.prototype.availSeats = "";
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
		{ name: "AFRICAN AMERICAN STUDIES", shortName: "AFRICAM" },
		{ name: "AGRICULTURAL AND ENVIRON CHEMISTRY", shortName: "AGR CHM" },
		{ name: "ENVIRONMENTAL ECONOMICS AND POLICY", shortName: "ENVECON" },
		{ name: "AGRICULTURAL AND RESOURCE ECONOMICS", shortName: "A,RESEC" },
		{ name: "AMERICAN STUDIES", shortName: "AMERSTD" },
		{ name: "ANCIENT HISTORY AND MED. ARCH.", shortName: "AHMA" },
		{ name: "ANTHROPOLOGY", shortName: "ANTHRO" },
		{ name: "APPLIED SCIENCE AND TECHNOLOGY", shortName: "AST" },
		{ name: "ARCHITECTURE", shortName: "ARCH" },
		{ name: "VISUAL STUDIES", shortName: "VIS STD" },
		{ name: "PRACTICE OF ART", shortName: "ART" },
		{ name: "HISTORY OF ART", shortName: "HISTART" },
		{ name: "ASIAN AMERICAN STUDIES", shortName: "ASAMST" },
		{ name: "ASIAN STUDIES", shortName: "ASIANST" },
		{ name: "ASTRONOMY", shortName: "ASTRON" },
		{ name: "BIOENGINEERING", shortName: "BIO ENG" },
		{ name: "BIOLOGY", shortName: "BIOPHYSICS" },
		{ name: "BIOPHY", shortName: "GROUP IN BUDDHIST STUDIES" },
		{ name: "BUDDSTD", shortName: "UNDERGRAD. BUSINESS ADMINISTRATION" },
		{ name: "UGBA", shortName: "MASTERS IN BUSINESS ADMINISTRATION" },
		{ name: "PH.D. IN BUSINESS ADMINISTRATION", shortName: "PHDBA" },
		{ name: "CELTIC STUDIES", shortName: "CELTIC" },
		{ name: "CHEMICAL ENGINEERING", shortName: "CHM ENG" },
		{ name: "CHEMISTRY", shortName: "CHEM" },
		{ name: "CHICANO STUDIES", shortName: "CHICANO" },
		{ name: "CITY AND REGIONAL PLANNING", shortName: "CY PLAN" },
		{ name: "CIVIL AND ENVIRONMENTAL ENGINEERING", shortName: "CIV ENG" },
		{ name: "CLASSICS", shortName: "CLASSIC" },
		{ name: "GREEK", shortName: "LATIN" },
		{ name: "COGNITIVE SCIENCE", shortName: "COG SCI" },
		{ name: "COLLEGE WRITING PROGRAM", shortName: "COLWRIT" },
		{ name: "COMPARATIVE BIOCHEMISTRY", shortName: "COMPBIO" },
		{ name: "COMPARATIVE LITERATURE", shortName: "COM LIT" },
		{ name: "CRITICAL THEORY GRADUATE GROUP", shortName: "CRIT TH" },
		{ name: "DEMOGRAPHY", shortName: "DEMOG" },
		{ name: "DEVELOPMENT STUDIES", shortName: "DEV STD" },
		{ name: "EARTH AND PLANETARY SCIENCE", shortName: "EPS" },
		{ name: "EAST ASIAN LANGUAGES AND CULTURES", shortName: "EA LANG" },
		{ name: "CHINESE", shortName: "JAPANESE" },
		{ name: "JAPAN", shortName: "KOREAN" },
		{ name: "TIBETAN", shortName: "ECONOMICS" },
		{ name: "ECON", shortName: "EDUCATION" },
		{ name: "EDUC", shortName: "ELECTRICAL ENGINEERING" },
		{ name: "EL ENG", shortName: "COMPUTER SCIENCE" },
		{ name: "COMPSCI", shortName: "ENERGY AND RESOURCES GROUP" },
		{ name: "ENE,RES", shortName: "ENGINEERING" },
		{ name: "ENGIN", shortName: "ENGLISH" },
		{ name: "ENVIRONMENTAL DESIGN", shortName: "ENV DES" },
		{ name: "ENVIRON SCI, POLICY, AND MANAGEMENT", shortName: "ESPM" },
		{ name: "ENVIRONMENTAL SCIENCES", shortName: "ENV SCI" },
		{ name: "ETHNIC STUDIES", shortName: "ETH STD" },
		{ name: "ETHNIC STUDIES GRADUATE GROUP", shortName: "ETH GRP" },
		{ name: "FILM AND MEDIA", shortName: "FILM" },
		{ name: "FOLKLORE", shortName: "FOLKLOR" },
		{ name: "FRENCH", shortName: "GENDER AND WOMEN'S STUDIES" },
		{ name: "GWS", shortName: "LESBIAN GAY BISEXUAL TRANSGENDER ST" },
		{ name: "LGBT", shortName: "GEOGRAPHY" },
		{ name: "GEOG", shortName: "GERMAN" },
		{ name: "YIDDISH", shortName: "DUTCH" },
		{ name: "GLOBAL METROPOLITAN STUDIES", shortName: "GMS" },
		{ name: "GLOBAL POVERTY AND PRACTICE", shortName: "GPP" },
		{ name: "LANGUAGE PROFICIENCY PROGRAM", shortName: "LAN PRO" },
		{ name: "HEALTH AND MEDICAL SCIENCES", shortName: "HMEDSCI" },
		{ name: "HISTORY", shortName: "INDUSTRIAL ENGIN AND OPER RESEARCH" },
		{ name: "IND ENG", shortName: "INFORMATION" },
		{ name: "INFO", shortName: "INTEGRATIVE BIOLOGY" },
		{ name: "INTEGBI", shortName: "INTERDISCIPLINARY STUDIES FIELD MAJ" },
		{ name: "ISF", shortName: "INTERNATIONAL AND AREA STUDIES" },
		{ name: "IAS", shortName: "ITALIAN STUDIES" },
		{ name: "ITALIAN", shortName: "JEWISH STUDIES" },
		{ name: "JEWISH", shortName: "JOURNALISM" },
		{ name: "JOURN", shortName: "LANDSCAPE ARCHITECTURE" },
		{ name: "LD ARCH", shortName: "LATIN AMERICAN STUDIES" },
		{ name: "LATAMST", shortName: "LEGAL STUDIES" },
		{ name: "LEGALST", shortName: "LETTERS AND SCIENCE" },
		{ name: "L & S", shortName: "LINGUISTICS" },
		{ name: "LINGUIS", shortName: "MATERIALS SCIENCE AND ENGINEERING" },
		{ name: "MAT SCI", shortName: "MATHEMATICS" },
		{ name: "MATH", shortName: "MECHANICAL ENGINEERING" },
		{ name: "MEC ENG", shortName: "MEDIA STUDIES" },
		{ name: "MEDIAST", shortName: "MIDDLE EASTERN STUDIES" },
		{ name: "M E STU", shortName: "MILITARY AFFAIRS" },
		{ name: "MIL AFF", shortName: "AEROSPACE STUDIES" },
		{ name: "AEROSPC", shortName: "MILITARY SCIENCE" },
		{ name: "MIL SCI", shortName: "NAVAL SCIENCE" },
		{ name: "NAV SCI", shortName: "MOLECULAR AND CELL BIOLOGY" },
		{ name: "MCELLBI", shortName: "MUSIC" },
		{ name: "NANOSCALE SCIENCE AND ENGINEERING", shortName: "NSE" },
		{ name: "NATIVE AMERICAN STUDIES", shortName: "NATAMST" },
		{ name: "NATURAL RESOURCES", shortName: "NAT RES" },
		{ name: "NEAR EASTERN STUDIES", shortName: "NE STUD" },
		{ name: "ARABIC", shortName: "CUNEIFORM" },
		{ name: "CUNEIF", shortName: "EGYPTIAN" },
		{ name: "EGYPT", shortName: "HEBREW" },
		{ name: "PERSIAN", shortName: "TURKISH" },
		{ name: "NEUROSCIENCE", shortName: "NEUROSC" },
		{ name: "NEW MEDIA", shortName: "NWMEDIA" },
		{ name: "NUCLEAR ENGINEERING", shortName: "NUC ENG" },
		{ name: "NUTRITIONAL SCIENCES AND TOXICOLOGY", shortName: "NUSCTX" },
		{ name: "OPTOMETRY", shortName: "OPTOM" },
		{ name: "VISION SCIENCE", shortName: "VIS SCI" },
		{ name: "PEACE AND CONFLICT STUDIES", shortName: "PACS" },
		{ name: "PHILOSOPHY", shortName: "PHILOS" },
		{ name: "PHYSICAL EDUCATION", shortName: "PHYS ED" },
		{ name: "PHYSICS", shortName: "PHYSICS" },
		{ name: "PLANT AND MICROBIAL BIOLOGY", shortName: "PLANTBI" },
		{ name: "POLITICAL ECONOMY OF INDUSTRIAL SOC", shortName: "POLECIS" },
		{ name: "POLITICAL SCIENCE", shortName: "POL SCI" },
		{ name: "PSYCHOLOGY", shortName: "PSYCH" },
		{ name: "PUBLIC HEALTH", shortName: "PB HLTH" },
		{ name: "PUBLIC POLICY", shortName: "PUB POL" },
		{ name: "RELIGIOUS STUDIES", shortName: "RELIGST" },
		{ name: "RHETORIC", shortName: "RHETOR" },
		{ name: "SCANDINAVIAN", shortName: "SCANDIN" },
		{ name: "SCIENCE AND MATHEMATICS EDUCATION", shortName: "SCMATHE" },
		{ name: "SLAVIC LANGUAGES AND LITERATURES", shortName: "SLAVIC" },
		{ name: "EAST EUROPEAN STUDIES", shortName: "EAEURST" },
		{ name: "EURASIAN STUDIES", shortName: "EURA ST" },
		{ name: "SOCIAL WELFARE", shortName: "SOC WEL" },
		{ name: "SOCIOLOGY", shortName: "SOCIOL" },
		{ name: "SOUTH AND SOUTHEAST ASIAN STUDIES", shortName: "S,SEASN" },
		{ name: "SOUTH ASIAN", shortName: "S ASIAN" },
		{ name: "SOUTHEAST ASIAN", shortName: "SEASIAN" },
		{ name: "BENGALI", shortName: "BANGLA" },
		{ name: "FILIPINO", shortName: "FILIPN" },
		{ name: "HINDI-URDU", shortName: "HIN-URD" },
		{ name: "KHMER", shortName: "MALAY/INDONESIAN" },
		{ name: "MALAY/I", shortName: "PUNJABI" },
		{ name: "SANSKRIT", shortName: "SANSKR" },
		{ name: "TAGALOG", shortName: "TAMIL" },
		{ name: "TELUGU", shortName: "VIETNAMESE" },
		{ name: "VIETNMS", shortName: "SPANISH" },
		{ name: "PORTUGUESE", shortName: "PORTUG" },
		{ name: "STATISTICS", shortName: "STAT" },
		{ name: "THEATER, DANCE, AND PERFORMANCE ST", shortName: "THEATER" },
		{ name: "UNDERGRAD INTERDISCIPLINARY STUDIES", shortName: "UGIS" }
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
		if(label.match("Course Title:"))
			this.title 						= strip(ttArr[i].innerHTML);
		else if(label.match("Location:"))
			this.parseLocn(ttArr[i].innerHTML);
//			this.locn 						= ttArr[i].innerHTML;
		else if(label.match("Instructor:"))
			this.instructor 				= ttArr[i].innerHTML;
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

Course.prototype.parseLocn = function(str)
{
	var temp;
	temp = str.match(/^[\s]*[MTWFuh]{1,7}[\s]+[0-9\-AP]+,/);
	if(temp != null)
	{
		days = str.match(/^[\s]*[MTWFuh]{1,7}/);

		if(days != null)
		{
			this.days = days[0];
			temp = str.replace(/^[\s]*[MTWFuh]{1,7}[\s]*/, '');
			time = temp.match(/^[0-9\-AP]+/);

			if(time != null)
			{
				this.time = time[0];
				temp = temp.replace(/^[0-9\-AP]+,[\s]*/, '');
				this.room = temp;
			}
		}
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
	if(this.isFull())
		cssClass += "full";
	else
		cssClass += "open";
	
	fanCCN += '<td class="ccn ' + this.needRowBorder() + '">'
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
		this.limit = temp[0];
		this.enrolled = temp[1];
		this.waitlist = temp[2];
		this.availSeats = temp[3];
	}
}

/**
 * Selects all A tags and sets the according properties
 */
Course.prototype.parseA = function(table)
{
	link = table.querySelectorAll("A");

	for(var i = 0, len = link.length; i < len; i++)
	{
		var temp = link[i].innerHTML;
		if(temp.match(/(catalog description)/) != null)
			this.catalogDescLink = link[i].getAttribute("href");
		else if(temp.match(/Click here for current enrollment/) != null)
			this.enrollmentLink = link[i].getAttribute("href");
		else if(temp.match(/View Books/) != null)
			this.bookLink = link[i].getAttribute("href");
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

		this.department = courseName;					// Course Name
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
		dayArr.push("TH");
	else
		dayArr.push("--");

	if(days.match(/F/))
		dayArr.push("F");
	else
		dayArr.push("--");

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

Course.prototype.isFull = function()
{
	if(this.availSeats > 0)
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
		crs.parseA(entryList[i]);
		crs.parseCourse(entryList[i]);		

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
	css += "table {empty-cells:show; width:100%;}";

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

	// Enrollment Data 
	css += ".enrollmentMsg { /*background-color:#d4d4d4;*/ text-align:center; }";
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

	// Status, restrictions
	css += ".statusLastChanged, .restrictions { text-align:center; font-family:arial; font-weight:normal; }";
	css += ".statusLastChanged { width:110px; }";
	css += ".restrictions { width:110px;}";
	css += ".ccn { white-space:nowrap; border-right: 1px dotted #CCC;}";
	css += ".classType { width:30px; }";
	css += ".secNum { width:30px; }";
	css += ".units { width:40px; text-align:center; }";
	css += ".instructor { text-align:left; }";
	css += ".locn { text-align:left; }";
	css += ".finalExamGroup { width:30px; text-align:center; }";
	css += ".days { width:115px; text-align:center; white-space:nowrap;}";
	css += ".time { text-align:left; }";
	css += ".room { text-align:left; }";
	css += ".links { white-space:nowrap; text-align:left; }";
	css += ".full { background-color:#ff9b9b; color:#520e0e;}";
	css += ".open { background-color:#c5ffc8; color:#15520e;}";

	// Days
	css += ".dayActive { background-color:#c5ffc8; color:#18571b;}";
	css += ".dayInactive { color:#999; background-color:#dddddd; }";
	css += ".dayActive, .dayInactive { font-weight:normal;  float:left; margin-right:1px; width:20px; text-align:center; padding:1px;}";
	
	// Advice links (courserank, myedu, etc)
	css += ".adviceLinks { font-size:.8em; font-weight:normal;}";

	// Row Highlighting
	css += "tbody.highlight:hover, tbody.lecture:hover { background-color:#f0f0f0; }";
	css += "tbody.lecture tr:first-child{ font-weight:bold; /*background-color:#fffde0;*/ }";

	// onclick row highlighting
	css += "tbody.highlightonclick, tbody.highlightonclick:active, tbody.highlightonclick:visited { background-color:#fff98a; }";
	css += "tbody.highlightonclick:hover { background-color:#ffd964; }";
	css += ".highlightCursor { cursor:pointer; }";

	// Set CSS
	styleElt.innerHTML = css;
	head.appendChild(styleElt);

	// Add JS
	var jsElt = document.createElement("script");

	js = "";
	js += "function highlightRow(element) {";
	js += "		if(element.className == 'highlight')";
	js += "			element.className = 'highlightonclick';";
	js += "		else if(element.className == 'lecture')";
	js += "			element.className = 'lecture highlightonclick';";
	js += "		else if(element.className == 'lecture highlightonclick')";
	js += "			element.className = 'lecture';";
	js += "		else";
	js += "			element.className = 'highlight';";
	js += "}";

	jsElt.innerHTML = js;

	head.appendChild(jsElt);
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
	table.setAttribute("cellspacing", "0");
	var tableList = document.getElementsByTagName("TABLE");
	
	body.insertBefore(table, body.firstChild.nextSibling.nextSibling);

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
			tableRows += '<td width="50" align="right">Course Number</td>';	
			tableRows += '<td>CCN</td>';	
			tableRows += '<td>Class Type</td>';	
			tableRows += '<td>Section Number</td>';	
			tableRows += '<td>Units</td>';	
			tableRows += '<td align="left">Instructor</td>';	
			tableRows += '<td align="left">Days</td>';	
			tableRows += '<td align="left">Time</td>';	
			tableRows += '<td align="left">Location</td>';	
			tableRows += '<td>Final Exam Group</td>';	
			tableRows += '<td colspan="8"></td>';	
			tableRows += '</tr>';
		}
		
		// Course Title
		if(prevCourseNum !== crs.courseNum)
		{
			prevCourseNum = crs.courseNum;

			tableRows += '<tr class="courseTopPadding"><td colspan="18"></td></tr>';
			tableRows += '<tr class="title">';
			tableRows += '<td align="right" valign="middle" class="titleLeftBorder">' + crs.courseNum + '</td>';
			tableRows += '<td colspan="9" valign="middle">';
			tableRows += '<span style="float:left;">';
			tableRows += '<a href="' + crs.catalogDescLink + '" target="_blank">' + crs.title + '</a>';
			if(crs.courseWebsite != "")
				tableRows += ' <a href="' + crs.courseWebsite + '" target="_blank">(Course Website)</a>';
			tableRows += '</span>';
			tableRows += '<span style="float:right;" class="adviceLinks">';
		
			deptAbrev = crs.getDeptAbrev(crs.department);

			tableRows += '<a href="' + 'http://www.koofers.com/search?q=' + encodeURI(deptAbrev + ' ' + crs.courseNum) + '" target="blank">[K]</a> ';
			tableRows += '<a href="' + 'http://www.myedu.com/search?q=' + encodeURI(deptAbrev + ' ' + crs.courseNum) + '&doctype=course&facets=school-name:University+of+California%2C+Berkeley|dept-abbrev:' + encodeURI(deptAbrev) + '&search_school=University+of+California%2C+Berkeley&config=' + '" target="blank">[ME]</a> ';
			tableRows += '<a href="' + 'https://www.courserank.com/berkeley/search#query=' + encodeURI(deptAbrev + ' ' + crs.courseNum) + '&filter_term_currentYear=on' + '" target="blank">[CR]</a>';
			tableRows += '</span>';
			tableRows += '<div style="clear:both"></div>';

			tableRows += '</td>';
			tableRows += '<td class="smallLabel"><small>Limit</small></td>';	
			tableRows += '<td class="smallLabel"><small>Enrolled</small></td>';	
			tableRows += '<td class="smallLabel"><small>Waitlist</small></td>';	
			tableRows += '<td class="smallLabel"><small>Avail Seats</small></td>';	
			tableRows += '<td class="smallLabel"><small>Restrictions</small></td>';	
			tableRows += '<td class="smallLabel"><small>Status</small></td>';	
			tableRows += '<td></td>';
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

		tableRows += '<td class="highlightCursor" onclick="javascript:highlightRow(this.parentNode.parentNode);"></td>'
		tableRows += crs.fancyCourseControlNumber(crs.ccn);
		tableRows += '<td class="classType' + crs.needRowBorder() + '">' + crs.classType + '</td>';
		tableRows += '<td class="secNum' + crs.needRowBorder() + '">' + crs.secNum + '</td>';
		tableRows += '<td class="units' + crs.needRowBorder() + '">' + crs.units + '</td>';
		tableRows += '<td class="instructor' + crs.needRowBorder() + '">' + crs.instructor + '</td>';

		if(crs.locn == "")
		{
			tableRows += '<td class="' + crs.needRowBorder() + '"><div class="days">' + crs.fancyDays(crs.days) +'</div></td>';
			tableRows += '<td class="time ' + crs.needRowBorder() + '">' + crs.time + '</td>';
			tableRows += '<td class="room ' + crs.needRowBorder() + '">' + crs.room + '</td>';
		}
		else
			tableRows += '<td colspan="3" class="locn' + crs.needRowBorder() + '">' + crs.locn + '</td>';

		tableRows += '<td class="finalExamGroup' + crs.needRowBorder() + '">' + crs.finalExamGroup + '</td>';

		if(crs.limit && crs.enrolled && crs.waitlist && crs.availSeats )
		{
			tableRows += '<td class="enrollDataLeft' + crs.needRowBorder() + '">' + crs.limit + '</td>';
			tableRows += '<td class="enrollData' + crs.needRowBorder() + '">' + crs.enrolled + '</td>';
			tableRows += '<td class="enrollData' + crs.needRowBorder() + '">' + crs.waitlist + '</td>';
			tableRows += '<td class="enrollDataRight' + crs.needRowBorder() + '">' + crs.availSeats + '</td>';
		}
		else
		{
			tableRows += '<td colspan="4" class="enrollmentMsg' + crs.needRowBorder() + '">' + crs.enrollmentMsg + '</td>';
		}

		tableRows += '<td class="restrictions' + crs.needRowBorder() + '"><small>' + crs.restrictions + '</small></td>';
		tableRows += '<td class="statusLastChanged' + crs.needRowBorder() + '"><small>' + crs.statusLastChanged + '</small></td>';
		tableRows += '<td class="links">';
			if(crs.enrollmentLink != "")
				tableRows += '<a href="' + crs.enrollmentLink+ '" target="_blank">[E]</a> ';
			if(crs.bookLink != "")
				tableRows += '<a href="' + crs.bookLink + '" target="_blank">[B]</a>';
		tableRows += '</td>';
		tableRows += '</tr>';

		// Second row (Note, Summer Session fees, etc.)
		tableRows += '<tr>';

		if(crs.needSecondRow())
		{
			tableRows += '<td class="highlightCursor" onclick="javascript:highlightRow(this.parentNode.parentNode);"></td>';
			tableRows += '<td class="ccn rowBorder"></td>';
			tableRows += '<td colspan="2" class="rowBorder"></td>';
			tableRows += '<td class="rowBorder" colspan="1"></td>';
			tableRows += '<td class="rowBorder" colspan="5">';
				if(crs.summerFees != "")
					tableRows += '<p class="summerFees"><small><b>Summer Fees:</b> ' + crs.summerFees + '</small></p>';

				if(crs.sessionDates != "")
					tableRows += '<p class="sessionDates"><small><b>Session Dates</b> ' + crs.sessionDates + '</small></p>';

				if(crs.note != "")
					tableRows += '<p class="note"><small><b>Note:</b> ' + crs.note + '</small></p>';


			tableRows += '</td>';
			tableRows += '<td colspan="4" class="enrollDataFiller rowBorder"><span></span></td>';
			tableRows += '<td class="rowBorder" colspan="2"></td>';
			tableRows += '<td></td>';
		}

		tableRows += '</tr>'



		tableRows += '</tbody>';
	}
	
	// render new table
	table.innerHTML = tableRows;
}(courseList));
