function initialize() {
  var markers = [];
  var map = new google.maps.Map(document.getElementById('map'), {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: new google.maps.LatLng(44.495, -73.21),
    zoom: 12,
    maxZoom: 17,
    disableDefaultUI: true,
    scrollwheel: false,
    draggable: true,
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL
    }
  });
  // Create the search box and link it to the UI element.
  var input = /** @type {HTMLInputElement} */
  (
  document.getElementById('pac-input'));
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(
  document.getElementById('legend'));
  var searchBox = new google.maps.places.SearchBox( /** @type {HTMLInputElement} */ (input));
  // [START region_getplaces]
  // Listen for the event fired when the user selects an item from the
  // pick list. Retrieve the matching places for that item.
  google.maps.event.addListener(searchBox, 'places_changed', function(layer) {
    var places = searchBox.getPlaces();
    for (var i = 0, marker; marker = markers[i]; i++) {
      marker.setMap(null);
    }
    // For each place, get the icon, place name, and location.
    markers = [];
    var bounds = new google.maps.LatLngBounds();
    var voterLat, voterLng;
    for (var i = 0, place; place = places[i]; i++) {
      // Create a marker for each place.
      var marker = new google.maps.Marker({
        map: map,
        title: place.name,
        position: place.geometry.location
      });
      voterLat = marker.position.d;
      voterLng = marker.position.e;
      console.log(voterLng);
      markers.push(marker);
      bounds.extend(place.geometry.location);
    }
    map.fitBounds(bounds);
    var listener = google.maps.event.addListener(map, "idle", function() {
      if (map.getZoom() > 13) map.setZoom(13);
      google.maps.event.removeListener(listener);
    });
    cartodb.createLayer(map, {
      user_name: 'geosprocket',
      type: 'cartodb',
      sublayers: [{
        sql: "SELECT * FROM btv_redistricting WHERE ST_Intersects(the_geom, ST_GeometryFromText('POINT(" + voterLng + " " + voterLat + ")', 4326))",
        cartocss: "Map{buffer-size:512;}#layer {::old[year=1990]{polygon-opacity:0;line-opacity:0.7;line-width:2.8;line-color: #444;line-dasharray:6,6;}::new[year=2010]{polygon-opacity:0.5;line-opacity:0.6;line-width:1.2;line-color: #0000ff;polygon-fill:#4a336a;}::labels[year=2010]{text-name:'Proposed Ward ' + [ward];text-placement: point;text-face-name: 'DejaVu Sans Book';text-size: 14;text-fill: #000;text-halo-fill: #FFF;text-halo-radius: 2;text-halo-rasterizer:fast;text-dy: -10;text-allow-overlap: true;text-placement-type: dummy;text-label-position-tolerance: 0;}}"
      }]
    }).addTo(map);
    $.getJSON("http://geosprocket.cartodb.com/api/v2/sql?q=SELECT cartodb_id, ward, district, pollingplace, year FROM btv_redistricting WHERE ST_Intersects(the_geom, ST_GeometryFromText('POINT(" + voterLng + " " + voterLat + ")', 4326)) ORDER BY year", function(data) {
      //console.log(data.rows[0].ward);
      var ward1990 = data.rows[0].ward;
      var ward2010 = data.rows[1].ward;
      if (ward1990 == ward2010) {
        $('#wardchange').text("No. You will remain in ward " + ward2010 + " under the proposed plan.");
      } else {
        $('#wardchange').text("Yes. You are currently in ward " + ward1990 + ", but you would be in ward " + ward2010 + " under the proposed plan.");
      }
      $('#distchange').html("The " + data.rows[1].district + " District   <a class='btn btn-info' href='http://cdb.io/1c5KR2D' target='_blank'>map</a>");
      $('#pollchange').html(data.rows[1].pollingplace + "   <a class='btn btn-info' target='_blank' href='http://maps.google.com/maps?q=" + data.rows[1].pollingplace + " Burlington VT'>map</a>");
    });
  });
  // [END region_getplaces]
  // Bias the SearchBox results towards places that are within the bounds of the
  // current map's viewport.
  google.maps.event.addListener(map, 'bounds_changed', function() {
    var bounds = map.getBounds();
    searchBox.setBounds(bounds);
  });
}
google.maps.event.addDomListener(window, 'load', initialize);