/* Loads XML document at dname through an XMLHttpRequest and returns the DOM. */
function loadXMLDoc(dname) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", dname, false);
	xmlhttp.setRequestHeader('Content-Type', 'text/xml');
	xmlhttp.send("");
	return xmlhttp.responseXML;
}

/* Take the XML DOM node for a park and generates the HTML structure for its
   entry in search results. If verbose is true, the verbose information for the 
   park is generated, including hours and a mini-map. If verbose is false, a 
   compact version is generated. */
function generateCCStructure(park, verbose) {
	var output = "";
	var name = getParkAttribute(park, "Park_Name");
	var hours = getParkHours(park);
	var address = getParkAttribute(park, "Address");
	var city = getParkAttribute(park, "City");
	var zip = getParkAttribute(park, "Zip");
	var phone = getParkAttribute(park, "Phone");
	var url = getParkAttribute(park, "URL");

	output +=  "<div class='ccinfo'>"
	output +=  "<strong><a href='" + url + "'>" + name + "</a></strong>";

	output +=  "<div class='contact'>";

	/* Add hours only on verbose results entry */
	if (verbose && hours.length > 0) {
		output +=  "<strong>Hours: </strong>" + hours + "<br />";
	}

	/* Display labels only in verbose results */
	if (verbose) {
			output +=  "<strong>Location: </strong>";
	}
	output += address + "<br />" + city + ", MD " + zip + "<br />";

	if (phone.length > 0) {
		/* Display labels only in verbose results */
		if (verbose) {
				output +=  "<strong>Phone: </strong>";
		}
		output += phone + "<br />";
	}

	output +=  "</div> <!-- end Contact Info -->";

	/* Add collapsible mini-map to verbose result entry */
	if (verbose) {
			var lat = parseFloat(getParkAttribute(park, "Latitude"));
			var lng = parseFloat(getParkAttribute(park, "Longitude"));
			var width = 300;
			output += "<div><label onclick='toggle($(this).parent());'>Show in map</label><br />\n";
			output += "<img class='collapsible' width='" + width + "' height='" + width + "' src='http://maps.googleapis.com/maps/api/staticmap?center="
					+ lat + "," + lng + "&zoom=12&size=" + width + "x" + width + "&markers=color:red%7C" + lat + "," + lng + "&sensor=false' />";
			output += "</div>";
	}
	output +=  "</div>";

	return output;
}

/* Gets a single attribute from the DOM of the given park. */
function getParkAttribute(park, attr) {
	var attr_node = park.getElementsByTagName(attr)[0].childNodes[0];
	if (attr_node) {
		return attr_node.nodeValue;
	}
	else {
		return "";
	}
}

/* Retrieves and formats the hours from the DOM of the given park. */
function getParkHours(park) {
	var hours = park.getElementsByTagName("Time");
	var output = "";
	for (var i=0; i<hours.length-1; i++) {
			if (hours[i].childNodes.length > 0) {
					output += hours[i].childNodes[0].nodeValue + "<br />\n"
			}
			else {
					return "";
			}
	}
	return output + hours[hours.length-1].childNodes[0].nodeValue;
}
