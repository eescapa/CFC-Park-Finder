/* Catch the search form submission and process it through Javascript instead
   of posting it. */
function processForm(e) {
	/* Prevent default behaviour of posting search form entries. */
	if (e.preventDefault) e.preventDefault();

	var cc_xml = loadXMLDoc("data/cc.xml");

	var form_input = document.getElementById("search_form").elements;
	var amenity_hash = generateAmenityHash(form_input);

	search(cc_xml, amenity_hash, document.main.address.value, document.main.geolocation.checked);

	return false;
}

/* Disables the `Address' text field when geolocation is selected, and 
   vice-versa. */
function toggleGeolocation() {
        document.main.address.disabled = document.main.geolocation.checked;
}

/* Generates a hash which maps each amenity string to a boolean value 
   corresponding to whether the option was selected in the search form. 
   Returns false when no options were selected. */
function generateAmenityHash(input_elements) {
	var hash = {};
	var flag = false;
	for (var i=0; i<input_elements.length; i++) {
		if (input_elements[i].className != "loc_entry") {
			var values = input_elements[i].value.split("; ");
			for (var j=0; j<values.length; j++) {
				hash[values[j]] = input_elements[i].checked;
				if(input_elements[i].checked) {
					flag = true;
				}
			}
		}
	}
	return flag ? hash : false;
}

/* Processes the search defined by the given options, and  generates and 
   displays the results. */
function search(xml_doc, amenity_hash, address, geoLoc) {
	var parks;
	document.getElementById("error_msgs").innerHTML = "";
	document.getElementById("results").innerHTML = "Searching...";

	if (amenity_hash) {
		parks = searchParksByAmenities(xml_doc, amenity_hash);
	}
	else if (!geoLoc && address.length == 0) {
		/* No search terms were entered. */
		document.getElementById("error_msgs").innerHTML = "<p>No search terms were entered. </p>";
		document.getElementById("results").innerHTML = "";
		$.scrollTo("#results_h1", "medium");
		return;
	}
	else {
		/* Searching by location only. */
		parks = Array.prototype.slice.call(xml_doc.getElementsByTagName("Park"), 0);
	}

	if (parks.length == 0) {
		/* No search results were found. */
		document.getElementById("error_msgs").innerHTML = "<p>No parks were found for the given search terms. Please try again with different terms.</p>";
		document.getElementById("results").innerHTML = "";
		$.scrollTo("#results_h1", "medium");
		return;
	}

	if (geoLoc) {
		if(navigator.geolocation) { /* If browser supports HTML5 Geolocation */
			document.getElementById("results").innerHTML = "Waiting for location...";
			navigator.geolocation.getCurrentPosition(
				function(position) {
					/* Sort parks by proximity to current location. */
					parks = parks.sort(function(a, b) {
						return compareDistances(a, b, 
							position.coords.latitude, 
							position.coords.longitude);
					});
					document.getElementById("error_msgs").innerHTML = "";
					document.getElementById("results").innerHTML = generateResults(parks, "[Sorted by nearest to current location.]");
					prepareMaps();
					$.scrollTo("#results_h1", "medium");
				}, 
				function() { 
					/* Geolocation failed. */
					document.getElementById("error_msgs").innerHTML = "<p>Failed to determine current location. Displaying results in default order.</p>";
					document.getElementById("results").innerHTML = generateResults(parks);
					prepareMaps();
					$.scrollTo("#results_h1", "medium");
				});
		}
		else { /* Browser doesn't support Geolocation */
			document.getElementById("error_msgs").innerHTML = "<p>Your device cannot determine the current location. Displaying results in default order.</p>";
			document.getElementById("results").innerHTML = generateResults(parks);
			prepareMaps();
			$.scrollTo("#results_h1", "medium");
		}
	} 
	else {
		var geocoder = new google.maps.Geocoder();
		if(address.length > 0) {
			document.getElementById("results").innerHTML = "Waiting for location...";
			geocoder.geocode( { 'address': address + "MD USA" }, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					parks = parks.sort(function(a, b) {
						return compareDistances(a, b, 
							results[0].geometry.location.lat(), 
							results[0].geometry.location.lng());
					});
					document.getElementById("error_msgs").innerHTML = "";
					document.getElementById("results").innerHTML = generateResults(parks,  "[Sorted by nearest to entered address.]");
					prepareMaps();
					$.scrollTo("#results_h1", "medium");
				} 
				else {
					document.getElementById("error_msgs").innerHTML = "<p>Failed to determine location \"" +  address + "\". Displaying results in default order.</p>";
					document.getElementById("results").innerHTML = generateResults(parks);
					prepareMaps();
					$.scrollTo("#results_h1", "medium");
				}
			});
		}
		else {
			document.getElementById("error_msgs").innerHTML = "";
			document.getElementById("results").innerHTML = generateResults(parks);
			prepareMaps();
			$.scrollTo("#results_h1", "medium");
		}
	}
}

/* Returns all parks which have an amenity that is marked in the given hash. */
function searchParksByAmenities(xml_doc, amenity_hash) {
	var parks = xml_doc.getElementsByTagName("Park");
	var output = new Array();
	for (var i=0; i<parks.length; i++) {
		var park = parks[i];
		var amenities = park.getElementsByTagName("Amenity");
		for (var j=0; j<amenities.length; j++) {
			if (amenity_hash[amenities[j].childNodes[0].nodeValue]) {
				output.push(park);
			}
		}
	}
	return output;
}

/* Provides the distance in coordinates between two points, (lat1, lng1) and
   (lag2, lng2). Assumes that the coordinate grid is square, which is a 
   negligible inaccuracy. */
function distance(lat1, lng1, lat2, lng2) {
	return Math.sqrt((lat2-lat1)*(lat2-lat1)+(lng2-lng1)*(lng2-lng1));
}

/* Uses the generateCCStructure function in general.js to generate long-from 
   search results. */ 
function generateResults(parks_list, message) {
	var output = "";
	if (message) {
		output += "<div>" + message + "</div><br />";
	}
	for (var i=0; i<parks_list.length; i++) {
		output += generateCCStructure(parks_list[i], true) 
	}
	return output;
}

/* Compares two parks by their distance to the point (lat, lng). */
function compareDistances(one, two, lat, lng) { 
	var lat1 = parseFloat(getParkAttribute(one, "Latitude"));
	var lng1 = parseFloat(getParkAttribute(one, "Longitude"));
	var lat2 = parseFloat(getParkAttribute(two, "Latitude"));
	var lng2 = parseFloat(getParkAttribute(two, "Longitude"));
	var diff = distance(lat2, lng2, lat, lng) - distance(lat1, lng1, lat, lng);
	return (diff ? (diff < 0 ? 1 : -1) : 0); /* This is the sign of diff. */
}
