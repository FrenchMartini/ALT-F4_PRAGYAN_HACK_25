const map = L.map('map', { crs: L.CRS.EPSG4326 })
  .setView([38.9072, -77.0369], 13) // Centered on Washington, DC
  .setMaxBounds([
    [38.7916, -77.1198], // Southwest corner
    [39.0006, -76.9094], // Northeast corner
  ]);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawnItems,
    remove: true,
  },
  draw: {
    polyline: true,
    polygon: true,
    rectangle: true,
    marker: true,
    circle: false,
    circlemarker: false,
  },
});
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, function (event) {
  const layer = event.layer;
  drawnItems.addLayer(layer);
  const geoJson = layer.toGeoJSON();
  console.log('Closure GeoJSON:', geoJson);
  if (event.layerType === "marker") {
    const coordinates = layer.getLatLng(); // Get latitude and longitude of the marker
    console.log("Marker Coordinates:", coordinates);
  }
  // Fetch traffic data for drawn location

});




function haversineDistance(coord1, coord2) {
    const toRad = (value) => (value * Math.PI) / 180;
  
    const R = 6371e3; // Radius of Earth in meters
    const lat1 = toRad(coord1[1]);
    const lat2 = toRad(coord2[1]);
    const deltaLat = toRad(coord2[1] - coord1[1]);
    const deltaLon = toRad(coord2[0] - coord1[0]);
  
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c; // Distance in meters
  }

  function findClosestRoad(marker, geojson) {
    let closestRoad = null;
    let shortestDistance = Infinity;
    let startCoordinate = null;
    let endCoordinate = null;
  
    geojson.features.forEach((feature) => {
      const roadCoordinates = feature.geometry.coordinates[0]; // Assuming MultiLineString has one line
      roadCoordinates.forEach((point, index) => {
        const distance = haversineDistance(marker, point);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          closestRoad = feature.properties.ROUTENAME || "Unknown Road"; // Get road name
          startCoordinate = roadCoordinates[0]; // Start coordinate of the road
          endCoordinate = roadCoordinates[roadCoordinates.length - 1]; // End coordinate of the road
        }
      });
    });
  
    return { closestRoad, startCoordinate, endCoordinate, shortestDistance };
  }
  const result = findClosestRoad(marker, geojson);