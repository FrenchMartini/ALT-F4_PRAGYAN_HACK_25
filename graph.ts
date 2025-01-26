class EdgeGraph {
    private edges: Edge[] = [];
    private adjacencyList: Map<number, Edge[]> = new Map();
  
    constructor(geojsonData: FeatureCollection) {
      this.buildGraph(geojsonData);
    }
  
    private buildGraph(geojsonData: FeatureCollection): void {
      // First, create all edges
      this.edges = geojsonData.features.map(feature => {
        const edge = new Edge();
        edge.id = parseInt(feature.properties?.ROUTEID || '0');
        edge.weight = feature.properties?.AADT || 0;
        edge.distance = this.calculateDistance(feature.geometry.coordinates);
        edge.edgeColor = this.mapTrafficToEdgeColor(edge.weight);
        edge.geometry = feature.geometry;
        
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
    findEdgeContainingPoint(point: [number, number]): Edge | null {
      return this.edges.find(edge => 
        this.isPointOnEdge(point, edge.geometry.coordinates)
      ) || null;
    }
  
    private isPointOnEdge(point: [number, number], edgeCoordinates: number[][]): boolean {
      // Implement point-on-line algorithm
      // This is a simplified version and might need more sophisticated geospatial logic
      for (let i = 1; i < edgeCoordinates.length; i++) {
        const [lon1, lat1] = edgeCoordinates[i-1];
        const [lon2, lat2] = edgeCoordinates[i];
        const [pointLon, pointLat] = point;
  
        if (this.isPointNearLine(pointLon, pointLat, lon1, lat1, lon2, lat2)) {
          return true;
        }
      }
      return false;
    }
  
    private isPointNearLine(
      pointLon: number, 
      pointLat: number, 
      lon1: number, 
      lat1: number, 
      lon2: number, 
      lat2: number
    ): boolean {
      // Implement a proximity check
      // This is a simplified version and might need more precise geospatial calculation
      const tolerance = 0.0001; // Adjust based on your precision needs
      // You'd implement a more sophisticated point-to-line distance calculation here
      return false; // Placeholder
    }
  }
  
  export default EdgeGraph;
  
  
  const edgeGraph = new EdgeGraph(geojsonData);

  const markedPoint: [number, number] = [-77.012173, 38.892866];
  const selectedEdge = edgeGraph.findEdgeContainingPoint(markedPoint);
  
  if (selectedEdge) {
  
    selectedEdge.weight = Infinity;
  }
  
  
  