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
	ttArr = table.querySelectorAll("TT");

	this.title 						= strip(ttArr[0].innerHTML);
	this.locn 						= ttArr[1].innerHTML;
	this.instructor 				= ttArr[2].innerHTML;
	this.statusLastChanged 			= ttArr[3].innerHTML;
	this.parseCourseControlNumber(ttArr[4].innerHTML);
	this.units						= ttArr[5].innerHTML;
	this.parseFinalExamGroup(ttArr[6].innerHTML);
	this.restrictions				= ttArr[7].innerHTML;
	this.parseNote(ttArr[8].innerHTML);
	this.parseEnrollment(ttArr[9].innerHTML);

}

Course.prototype.parseCourseControlNumber = function(str)
{
	var temp;

	temp = str.match(/[0-9]+(?=\s*<)?/);
	if(temp != null)
		this.ccn = temp;
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
	var course = table.querySelector('TBODY TR TD FONT[size="2"] B');

	str = this.tokenize(course.innerHTML);

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

/**
 * Parses the note. It removes the html code for the space and
 * sets it to an empty string.
 */
Course.prototype.parseNote = function(str)
{
	if(str == "&nbsp;")
		this.note = "";
	else
		this.note = str;
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
				'\nEnrollment Link: ' + this.enrollmentLink
				);
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
	styleElt = document.createElement("style");

	css = "";
	css += "body { font-family:arial, tahoma, verdana; } ";
	css += "table, tr, td { font-size: 0.9em; } ";
	css += "#toprow { font-weight: bold; text-align: center; } ";
	css += "#coursebody { text-align: center; }";
	css += "#enrolldata { text-align: center; width:10; font-weight:normal; color:#6e96be;}";
	css += "#coursetoppadding > td { padding-top:1em; }";
	css += "#departmenttoppadding > td { padding-top:2em; }";
	css += "#department { color:#dddddd; background-color:#252c58; font-size:2em; padding-left:.2em;}"; 
	css += "#title { background-color:#e8f1fa;}" 
	css += "#title, #title a { color: #336699; font-weight:bold; text-decoration:none;}";
	css += "#title td { font-size:1.1em; }";
	css += "#titleleftborder { border-left: 5px solid #336699; border-right:2px solid #FFF; padding: 0 .2em;}";
	css += "#title a:hover { background-color:transparent; text-decoration:underline; }";
	css += "#rowborder { border-bottom:1px dotted #CCC; }";
	css += ".enrollmentMsg { background-color:#e7e7e7; }";
	css += "#note, #restrictions { color:#6e6e6e; }";

	styleElt.innerHTML = css;

	head.appendChild(styleElt);
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

			tableRows += '<tr id="departmenttoppadding"><td colspan="14"></td></tr>';
			tableRows += '<tr>';
			tableRows += '<td colspan="14" id="department">' + crs.department + '</td>';
			tableRows += '</tr>';
			tableRows += '<tr id="toprow">';
			tableRows += '<td width="50" align="right">Course Number</td>';	
			tableRows += '<td>CCN</td>';	
			tableRows += '<td width="30">Class Type</td>';	
			tableRows += '<td width="40">Section Number</td>';	
			tableRows += '<td width="40">Units</td>';	
			tableRows += '<td align="left">Instructor</td>';	
			tableRows += '<td align="left">Days, Time & Location</td>';	
			tableRows += '<td width="30">Final Exam Group</td>';	
			tableRows += '<td></td>';	
			tableRows += '<td></td>';	
			tableRows += '<td></td>';	
			tableRows += '<td></td>';	
			tableRows += '<td></td>';	
			tableRows += '</tr>';
		}
		
		// Course Title
		if(prevCourseNum !== crs.courseNum)
		{
			prevCourseNum = crs.courseNum;

			tableRows += '<tr id="coursetoppadding"><td colspan="14"></td></tr>';
			tableRows += '<tr id="title">';
			tableRows += '<td align="right" valign="middle" id="titleleftborder">' + crs.courseNum + '</td>';
			tableRows += '<td colspan="7" valign="middle"><a href="' + crs.catalogDescLink + '" target="_blank">' + crs.title + '</a></td>';
			tableRows += '<td id="enrolldata"><small>Limit</small></td>';	
			tableRows += '<td id="enrolldata"><small>Enrolled</small></td>';	
			tableRows += '<td id="enrolldata"><small>Waitlist</small></td>';	
			tableRows += '<td id="enrolldata"><small>Avail Seats</small></td>';	
			tableRows += '<td colspan="2"></td>';
			tableRows += '</td>';

			tableRows += '</tr>';
		} 
		
		// Course Body
		tableRows += '<tr id="coursebody">';
		tableRows += '<td></td>'
		tableRows += '<td><b>' + crs.ccn + '</b></td>';
		tableRows += '<td>' + crs.classType + '</td>';
		tableRows += '<td>' + crs.secNum + '</td>';
		tableRows += '<td>' + crs.units + '</td>';
		tableRows += '<td align="left">' + crs.instructor + '</td>';
		tableRows += '<td align="left">' + crs.locn + '</td>';
		tableRows += '<td>' + crs.finalExamGroup + '</td>';

		if(crs.limit && crs.enrolled && crs.waitlist && crs.availSeats )
		{
			tableRows += '<td>' + crs.limit + '</td>';
			tableRows += '<td>' + crs.enrolled + '</td>';
			tableRows += '<td>' + crs.waitlist + '</td>';
			tableRows += '<td>' + crs.availSeats + '</td>';
		}
		else
		{
			tableRows += '<td colspan="4" class="enrollmentMsg">' + crs.enrollmentMsg + '</td>';
		}

		tableRows += '<td>';
			if(crs.enrollmentLink != "")
				tableRows += '<a href="' + crs.enrollmentLink+ '" target="_blank">Enrollment</a>';
		tableRows += '</td>';

		tableRows += '<td NOWRAP>';
			if(crs.bookLink != "")
				tableRows += '<a href="' + crs.bookLink + '" target="_blank">Books</a>';
		tableRows += '</td>';
		tableRows += '</tr>';

		tableRows += '<tr>';
		tableRows += '<td colspan="4"></td>';
		// row border
		tableRows += '<td id="rowborder"><span></span></td>';

		// Course note and restrictions 
		tableRows += '<td colspan="2" id="rowborder"><span></span>';

		if(crs.note != "" || crs.restrictions != "")
		{
			if(crs.note != "")
				tableRows += '<p id="note"><small><b>Note:</b> ' + crs.note + '</small></p>';

			if(crs.restrictions != "")
				tableRows += '<p id="restrictions"><small><b>Restrictions:</b> ' + crs.restrictions + '</small></td>';
		}

		// row border
		tableRows += '<td colspan="6" id="rowborder"><span></span></td>';

		tableRows += '</tr>';
	}
	
	// render new table
	table.innerHTML = tableRows;
}(courseList));
