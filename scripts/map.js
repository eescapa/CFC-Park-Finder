var map;
var geocoder;
var info_windows = [];

/* Initialize the map and geocoder. */
function initialize() {
	var mapOptions = {
		zoom: 10,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	/* Inject map into div#map_div */
	map = new google.maps.Map(document.getElementById('map_div'), mapOptions);
	geocoder = new google.maps.Geocoder();

	/* Load all parks onto map. */
	initializeParkMarkers(map);
	
	if(navigator.geolocation) { /* If browser supports HTML5 Geolocation  */
		navigator.geolocation.getCurrentPosition(
				function(position) {
					setupMap(position);
				}, 
				function() {
					setupMap(false);
				});
	} 
	else { /* Browser doesn't support Geolocation */
		setupMap(false);
	}
}

/* Sets up the map at the given position, or at the default position if the
   position is `false'. */
function setupMap(position) {
	var pos;

	if(position) {
		pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

		/* Center a "You are here" markers at detected location. */
		var marker = new google.maps.Marker({
			 map: map,
		    position: pos,
		       title: "You are here.",
			icon: {
				path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
		    		strokeColor: "blue",
		    		scale: 5
			}
		});
		var infowindow = new google.maps.InfoWindow({
			content: "You are here.",
		});
		info_windows.push(infowindow);
		google.maps.event.addListener(marker, 'click', function() {
			closeAllInfoWindows();
			infowindow.open(map, marker);
		});

		/* Close everything if the user taps anywhere in the map. */
		google.maps.event.addListener(map, 'click', function() {
				closeAllInfoWindows();
		});

		map.setZoom(12); /* If current position was found, we want to 
				    focus on what's nearby. */
	}
	else {
		pos = new google.maps.LatLng(38.784921,-76.872096); /* Default position. */
		document.getElementById("map_descr").innerHTML = 
			"There are 41 community centers in Prince George's County. Below, you may browse the community centers on a county map."
	}

	map.setCenter(pos);
}

/* Close all info windows in the list info_windows. */
function closeAllInfoWindows() {
	for (var i=0; i<info_windows.length; i++) {
		info_windows[i].close();
	}
}

/* Load all parks' coordinates and display them on the map. */
function initializeParkMarkers(map) {
	var cc_xml = loadXMLDoc("data/cc.xml");
	var parks = cc_xml.getElementsByTagName("Park");
	for (var i=0; i<parks.length; i++) {
		var address = getParkAttribute(parks[i], "Address") 
			+ " " +  getParkAttribute(parks[i], "City") 
			+ ", MD " + getParkAttribute(parks[i], "Zip");
		var lat = parseFloat(getParkAttribute(parks[i], "Latitude"));
		var lng = parseFloat(getParkAttribute(parks[i], "Longitude"));
		var pos = new google.maps.LatLng(lat, lng);
		var marker = new google.maps.Marker({
			map: map,
		    position: pos,
		});
		setupInfoWindow(marker, parks[i]);
	}
}

/* Sets up an info window for the park given at the marker given. */
function setupInfoWindow(marker, park) {
	var infowindow = new google.maps.InfoWindow({
		content: generateCCStructure(park, false)
	});
	info_windows.push(infowindow);

	google.maps.event.addListener(marker, 'click', function() {
		closeAllInfoWindows();
		infowindow.open(map, marker);
	});
}

/* Load map on window load. */
google.maps.event.addDomListener(window, 'load', initialize);
