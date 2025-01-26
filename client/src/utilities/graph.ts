import type { FeatureCollection, LineString } from "geojson";
import { Edge } from "./rerouting";
import { geoData } from "../components/leaflet-picker";

class EdgeGraph {
  edges: Edge[] = [];
  private adjacencyList: Map<number, Edge[]> = new Map();

  constructor(geojsonData: FeatureCollection) {
    this.buildGraph(geojsonData);
  }

  private buildGraph(geojsonData: FeatureCollection): void {
    // First, create all edges
    this.edges = geojsonData.features.map(feature => {
      const edge = new Edge(1, 1, 1, 1, {} as LineString);
      edge.id = parseInt(feature.properties?.ROUTEID || '0');
      edge.weight = feature.properties?.AADT || 0;

      const geometry = feature.geometry;
      if (geometry.type === 'LineString' || geometry.type === 'Point' || geometry.type === 'Polygon') {
        edge.distance = this.calculateDistance(geometry.coordinates as number[][]);
        edge.geometry = geometry as LineString;
      } else if (geometry.type === 'MultiLineString') {
        // Flatten MultiLineString into one LineString (or handle differently)
        const flattenedCoordinates = geometry.coordinates.flat() as number[][];
        edge.distance = this.calculateDistance(flattenedCoordinates);
        edge.geometry = { type: 'LineString', coordinates: flattenedCoordinates } as LineString;
      } else {
        console.warn(`Unsupported geometry type: ${geometry.type}`);
        edge.distance = 0;
      }
      edge.edgeColor = this.mapTrafficToEdgeColor(edge.weight);

      return edge;
    });

    // Connect edges based on coordinate matching
    this.connectEdges();
  }
  private mapTrafficToEdgeColor(aadt: number): number {
    if (aadt < 10000) return 0;
    if (aadt < 20000) return 1;
    if (aadt < 30000) return 2;
    return 3;
  }

  private connectEdges(): void {
    // Group edges by their start and end coordinates
    const startPoints = new Map<string, Edge[]>();
    const endPoints = new Map<string, Edge[]>();

    this.edges.forEach(edge => {
      const startKey = this.getCoordinateKey(edge.geometry.coordinates[0]);
      const endKey = this.getCoordinateKey(edge.geometry.coordinates[edge.geometry.coordinates.length - 1]);

      if (!startPoints.has(startKey)) startPoints.set(startKey, []);
      if (!endPoints.has(endKey)) endPoints.set(endKey, []);

      startPoints.get(startKey)!.push(edge);
      endPoints.get(endKey)!.push(edge);
    });

    // Connect edges that share common points
    this.edges.forEach(edge => {
      const startKey = this.getCoordinateKey(edge.geometry.coordinates[0]);
      const endKey = this.getCoordinateKey(edge.geometry.coordinates[edge.geometry.coordinates.length - 1]);

      // Find incoming and outgoing edges
      const incomingEdges = endPoints.get(startKey) || [];
      const outgoingEdges = startPoints.get(endKey) || [];

      edge.prev = incomingEdges.filter(e => e !== edge);
      edge.next = outgoingEdges.filter(e => e !== edge);
    });
  }

  private getCoordinateKey(coord: number[]): string {
    // Create a key that allows for slight imprecision in coordinates
    return `${coord[0].toFixed(5)},${coord[1].toFixed(5)}`;
  }

  private calculateDistance(coordinates: number[][]): number {
    let distance = 0;
    for (let i = 1; i < coordinates.length; i++) {
      distance += this.haversineDistance(
        coordinates[i - 1][0], coordinates[i - 1][1],
        coordinates[i][0], coordinates[i][1]
      );
    }
    return distance;
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Method to find an edge containing a specific point
  // point: [latitude, longitude]
  findEdgeContainingPoint(point: [number, number]): Edge | null {
    return this.edges.find(edge =>
      this.isPointOnEdge(point, edge.geometry.coordinates)
    ) || null;
  }

  dist2 = (u: number[], v: number[]) => {
    return Math.pow(u[0] - v[0], 2) + Math.pow(u[1] - v[1], 2);
  }

  // edgeCoordinates: [[longitude, latitude], [longitude, latitude], ...]
  private isPointOnEdge(point: [number, number], edgeCoordinates: number[][]): boolean {
    const thresh = 0.0001;
    console.log('Checking point on edge:', point, edgeCoordinates[edgeCoordinates.length-1]);
    var l2 = this.dist2(edgeCoordinates[0], edgeCoordinates[edgeCoordinates.length - 1]);

    if (l2 == 0) return this.dist2(point, edgeCoordinates[0]) < 0.0001;

    var t = ((point[0] - edgeCoordinates[0][0]) * (edgeCoordinates[edgeCoordinates.length - 1][0] - edgeCoordinates[0][0]) +
      (point[1] - edgeCoordinates[0][1]) * (edgeCoordinates[edgeCoordinates.length - 1][1] - edgeCoordinates[0][1])) / l2;
    t = Math.max(0, Math.min(1, t));
    var v = edgeCoordinates[0];
    var w = edgeCoordinates[edgeCoordinates.length - 1];
    return (this.dist2(point, [v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1])]) < 0.0001);
  }

}
export default EdgeGraph;

