 function initialize(place) {
      if (GBrowserIsCompatible()) {
        var map = new GMap2(document.getElementById("map_canvas"));

       	var lat=38.8951118;
		var lng=-77.0363658;
		var zoom=11;
		file="xml/map_dc25.xml";


		switch(place)
		{
			case 'dc':
				lat=38.8951118;
				lng=-77.0363658;
				zoom=11;
				file="/xml/map_dc25.xml";
				break;
			case 'neworleans':
				lat=29.9510658;
				lng=-90.0715323;
				zoom=12;
				file="/xml/map_neworleans25.xml";
				break;
			case 'atlanta':
				lat=33.7489954;
				lng=-84.3879824;
				zoom=9;
				file="/xml/map_atlanta50.xml";
				break;
		}



        
		map.addControl(new GSmallMapControl());
        map.addControl(new GMapTypeControl());
        map.setCenter(new GLatLng(lat, lng), zoom);
        // Download the data in data.xml and load it on the map. The format we
        // expect is:
        // <markers>
        //   <marker lat="37.441" lng="-122.141"/>
        //   <marker lat="37.322" lng="-121.213"/>
        // </markers>

		var sidebar = document.getElementById('sidebar');
	       sidebar.innerHTML = '';

        GDownloadUrl(file, function(data) {
          var xml = GXml.parse(data);
          var markers = xml.documentElement.getElementsByTagName("marker");
          for (var i = 0; i < markers.length; i++) {
            var point = new GLatLng(parseFloat(markers[i].getAttribute("latitude")),
                                    parseFloat(markers[i].getAttribute("longitude")));
			var distance = parseFloat(markers[i].getAttribute('distance'));
			var name = markers[i].getAttribute('program');
			
			var sidebarEntry = createSidebarEntry(marker, name, distance);
			 
	         sidebar.appendChild(sidebarEntry);
	
	
            var marker = createMarker(point, name);
	         map.addOverlay(marker);
          }
        });
      }
    }
    
	function createMarker(point, name) {
      var marker = new GMarker(point);
      var html = '<b>' + name + '</b> <br/>';
      GEvent.addListener(marker, 'click', function() {
        marker.openInfoWindowHtml(html);
      });
      return marker;
    }

	function createSidebarEntry(marker, name, distance) {
      var div = document.createElement('div');
      var html = '<b>' + name + '</b> (' + distance.toFixed(1) + ' mi)<br/>';
      div.innerHTML = html;
      div.style.cursor = 'pointer';
      div.style.marginBottom = '5px'; 
      GEvent.addDomListener(div, 'click', function() {
        GEvent.trigger(marker, 'click');
      });
      GEvent.addDomListener(div, 'mouseover', function() {
        div.style.backgroundColor = '#eee';
      });
      GEvent.addDomListener(div, 'mouseout', function() {
        div.style.backgroundColor = '#fff';
      });
      return div;
    }

    initialize('neworleans')

    var mapLinks = document.getElementsByClassName('map-link');
    for (var i = 0; i < mapLinks.length; i++){
        var city = mapLinks[i].href;
        city.replace('#', '');
        mapLinks[i].addEventListener('click', function(event){event.preventDefault();initialize(city);}, false);
    }
