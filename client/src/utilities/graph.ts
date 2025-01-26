import type { FeatureCollection, LineString } from "geojson";
import {Edge} from "./rerouting";

class EdgeGraph {
  private edges: Edge[] = [];
  private adjacencyList: Map<number, Edge[]> = new Map();

  constructor(geojsonData: FeatureCollection) {
    this.buildGraph(geojsonData);
  }

  private buildGraph(geojsonData: FeatureCollection): void {
    // First, create all edges
    this.edges = geojsonData.features.map(feature => {
      const edge = new Edge(-1,-1,-1,-1, {} as LineString);
      edge.id = parseInt(feature.properties?.ROUTEID || '0');
      edge.weight = feature.properties?.AADT || 0;

      const geometry = feature.geometry;
      if (geometry.type === 'LineString' || geometry.type === 'Point' || geometry.type === 'Polygon') {
        edge.distance = this.calculateDistance(geometry.coordinates as number[][]);
        edge.geometry = geometry as LineString;
      } else {
        console.warn(`Unsupported geometry type: ${geometry.type}`);
        edge.distance = 0; // Assign default values for unsupported geometries
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
        coordinates[i-1][1], coordinates[i-1][0],
        coordinates[i][1], coordinates[i][0]
      );
    }
    return distance;
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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

  // edgeCoordinates: [[longitude, latitude], [longitude, latitude], ...]
  private isPointOnEdge(point: [number, number], edgeCoordinates: number[][]): boolean {
    // Implement point-on-line algorithm
    // This is a simplified version and might need more sophisticated geospatial logic
    for (let i = 1; i < edgeCoordinates.length; i++) {
      const [lon1, lat1] = edgeCoordinates[i-1];
      const [lon2, lat2] = edgeCoordinates[i];
      const [pointLat, pointLon] = point;

      if (this.isPointNearLine([pointLat, pointLon],[lat1, lon1],[lat2, lon2])) {
        return true;
      }
    }
    return false;
  }

  private isPointNearLine(
    point: [number, number], 
    lineStart: [number, number], 
    lineEnd: [number, number]
  ): boolean {
    const tolerance = 0.0001; // Adjust based on your precision needs


    const [px, py] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;
  
    // Helper function: squared distance between two points
    const distSq = (x1: number, y1: number, x2: number, y2: number) =>
      (x2 - x1) ** 2 + (y2 - y1) ** 2;
  
    // Calculate squared length of the line segment
    const lineLenSq = distSq(x1, y1, x2, y2);
  
    if (lineLenSq === 0) {
      // LineStart and LineEnd are the same point; check distance from the point
      return Math.sqrt(distSq(px, py, x1, y1)) <= tolerance;
    }
  
    // Projection factor t of the point onto the line segment
    const t =
      ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / lineLenSq;
  
    // Clamp t to the range [0, 1] to ensure projection lies on the line segment
    const tClamped = Math.max(0, Math.min(1, t));
  
    // Find the projected point on the line segment
    const projX = x1 + tClamped * (x2 - x1);
    const projY = y1 + tClamped * (y2 - y1);
  
    // Check if the distance from the point to the projected point is within the tolerance
    const distanceToLine = Math.sqrt(distSq(px, py, projX, projY));
  
    return distanceToLine <= tolerance;
  }

//   private isPointNearLine(
//     point: [number, number],
//     lineStart: [number, number],
//     lineEnd: [number, number]
//   ): boolean {
//     // Implement a proximity check
//     // This is a simplified version and might need more precise geospatial calculation
//     const tolerance = 0.0001; // Adjust based on your precision needs
//     // You'd implement a more sophisticated point-to-line distance calculation here
//     return false; // Placeholder
//   }
// }
}

export default EdgeGraph;

const geojsonData = JSON.parse("string GeoJSON FeatureCollection") as FeatureCollection;

const edgeGraph = new EdgeGraph(geojsonData);

const markedPoint: [number, number] = [-77.012173, 38.892866];
const selectedEdge = edgeGraph.findEdgeContainingPoint(markedPoint);
