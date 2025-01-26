import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import type { FeatureCollection } from 'geojson';
import EdgeGraph from '../utilities/graph';

// Define the LeafletPicker component
const LeafletPicker: React.FC = () => {
  const bounds = L.latLngBounds(
    [38.8933, -77.0473],// Southwest corner
    [38.9181, -77.0030] // Northeast corner
);
  useEffect(() => {
    // initialize edge graph
    // const geojsonData = JSON.parse("../assets/2023_Traffic_Volume.geojson") as FeatureCollection;
    // const edgeGraph = new EdgeGraph(geojsonData);
    // const markedPoint: [number, number] = [-77.012173, 38.892866];


    // Initialize the map
    const map = L.map('map', {
      center: new L.LatLng(38.9052, -77.0267),
      zoom: 40,
      minZoom: 18,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
    }) // Centered on Washington, DC

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Feature group for drawn items
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Add draw controls
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
      draw: {
          marker:{}, // Enable placing markers
          polyline: false, // Disable drawing polylines
          polygon: false, // Disable drawing polygons
          circle: false, // Disable drawing circles
          rectangle: false, // Disable drawing rectangles
          circlemarker: false, // Disable drawing circle markers
      },
    });
    map.addControl(drawControl);

    // Handle draw events
    map.on(L.Draw.Event.CREATED, function (event: any) {
      const layer = event.layer;
      drawnItems.addLayer(layer);
      const geoJson = layer.toGeoJSON();
      console.log("Closure GeoJSON:", geoJson);

      if (event.layerType === "marker") {
        const coordinates = layer.getLatLng(); // Get latitude and longitude of the marker
        // const selectedEdge = edgeGraph.findEdgeContainingPoint([coordinates.lat, coordinates.lng]);
        // console.log("Selected Edge:", selectedEdge);
        console.log("Marker Coordinates:", coordinates);
      }

      // Fetch traffic data or perform any other operations
    });

    return () => {
      map.remove(); // Clean up on component unmount
    };
  }, []);

  return <div id="map" className = "relative w-full h-full"></div>;
};

export default LeafletPicker;
