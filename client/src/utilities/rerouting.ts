import { LineString } from "geojson";

export class Edge {
  /*  static resetVisited(rootEdge: Edge) {
    throw new Error("Method not implemented.");
  }*/
  id: number;
  weight: number;
  distance: number;
  noOfLanes: number;
  next: Edge[] | null;
  prev: Edge[] | null;
  edgeColor: number;
  net_weight: number;
  geometry: LineString;

  constructor(
    id1: number,
    weight1: number,
    distance1: number,
    noOfLane1: number,
    geometry: LineString
  ) {
    this.id = id1;
    this.weight = weight1;
    this.distance = distance1;
    this.noOfLanes = noOfLane1;
    this.next = [];
    this.prev = [];
    this.edgeColor = 0; //default black
    this.net_weight = 0;
    this.geometry = geometry;
  }

  calculateEdgeColor(input: number): void {
    const densityRatio =
      this.noOfLanes > 0 ? input / (this.weight * this.noOfLanes) : 0;

    let congestionFactor: number;
    if (densityRatio <= 1) {
      congestionFactor = 1 + Math.pow(densityRatio, 2);
    } else {
      congestionFactor = 1 + Math.pow(densityRatio, 3);
    }

    this.edgeColor += this.noOfLanes > 0 ? congestionFactor : 0;
    this.net_weight +=
      this.noOfLanes > 0 ? this.distance * congestionFactor : Infinity;
  }

  removeLane(): void {
    if (this.noOfLanes > 0) {
      this.noOfLanes -= 1;
    }
  }
}

class TrafficSimulation {
  distributeTrafficRecursively(
    edge: Edge,
    inputTraffic: number,
    visitedArray: number[]
  ): void {
    // Handle root edge case
    if (!edge.prev || edge.prev.length === 0) {
      if (edge.noOfLanes > 0) {
        edge.calculateEdgeColor(inputTraffic);
        console.log(
          `Root Edge (weight: ${edge.weight}): Traffic = ${inputTraffic.toFixed(
            2
          )}`
        );
        console.log(
          `Edge Color/Congestion Factor per lane: ${edge.edgeColor.toFixed(2)}`
        );
      } else {
        console.log(`Root Edge (weight: ${edge.weight}): Traffic = 0`);
        console.log(`Edge Color/Congestion Factor per lane: 0`);
        return;
      }
    }

    // If no connected edges or no lanes, stop distribution
    if (!edge.next || edge.next.length === 0) {
      edge.calculateEdgeColor(inputTraffic);
      console.log(
        `Terminal Edge (weight: ${
          edge.weight
        }): Traffic = ${inputTraffic.toFixed(2)}`
      );
      return;
    }

    // Filter edges with at least one lane and calculate total weight
    const lanesEdges = edge.next.filter((nextEdge) => nextEdge.noOfLanes > 0);
    const totalWeight = lanesEdges.reduce(
      (sum, nextEdge) => sum + nextEdge.weight,
      0
    );

    // Distribute traffic to edges with lanes
    lanesEdges.forEach((nextEdge) => {
      if (visitedArray.includes(nextEdge.id)) {
        return;
      }
      visitedArray.push(nextEdge.id);

      const trafficShare = (nextEdge.weight / totalWeight) * inputTraffic;

      nextEdge.calculateEdgeColor(trafficShare);

      console.log(
        `Edge (weight: ${nextEdge.weight}, lanes: ${
          nextEdge.noOfLanes
        }): Traffic distributed = ${trafficShare.toFixed(2)}`
      );
      console.log(
        `Edge Color/Congestion Factor per lane: ${nextEdge.edgeColor.toFixed(
          2
        )}`
      );

      // Recursively distribute traffic to next edges
      this.distributeTrafficRecursively(nextEdge, trafficShare, visitedArray);
      visitedArray.pop();
    });
  }
}

function findShortestPath(rootEdge: Edge, targetEdge: Edge): number[] {
  const visitedEdges = new Set<Edge>();
  let shortestPath: number[] | null = null;
  let minTotalWeight = Infinity;

  function dfs(
    currentEdge: Edge,
    currentPath: number[],
    currentWeight: number
  ) {
    // Skip edges with no lanes
    if (currentEdge.noOfLanes <= 0) return;

    // Avoid cycles
    if (visitedEdges.has(currentEdge)) return;

    // Add current edge ID to path
    currentPath.push(currentEdge.id);

    // Reached target
    if (currentEdge === targetEdge) {
      if (currentWeight < minTotalWeight) {
        shortestPath = [...currentPath];
        minTotalWeight = currentWeight;
      }

      // Backtrack
      currentPath.pop();
      return;
    }

    // Mark as visited
    visitedEdges.add(currentEdge);

    // Explore next edges
    if (currentEdge.next) {
      for (const nextEdge of currentEdge.next) {
        dfs(nextEdge, currentPath, currentWeight + nextEdge.net_weight);
      }
    }

    // Backtrack
    visitedEdges.delete(currentEdge);
    currentPath.pop();
  }

  // Start DFS from root
  dfs(rootEdge, [], 0);

  return shortestPath || [];
}

// Demonstration
const rootEdge = new Edge(0, 50, 1, 1, {} as LineString);
const edge1 = new Edge(1, 20, 1, 1, {} as LineString);
const edge2 = new Edge(5, 30, 1, 1, {} as LineString);
const edge3 = new Edge(2, 45, 1, 1 , {} as LineString);
const edge4 = new Edge(6, 35, 1, 1, {} as LineString);
const edge1_1 = new Edge(3, 26, 1, 1, {} as LineString);
const edge3_1 = new Edge(4, 47, 1, 1, {} as LineString);

// Connect edges
rootEdge.next = [edge1, edge2, edge3];
edge1.next = [edge1_1];
edge3.next = [edge3_1];
edge2.next = [edge4];
edge1_1.next = [edge4, edge2];
edge3_1.next = [edge4, edge2];

edge1.prev = [rootEdge];
edge2.prev = [rootEdge];
edge3.prev = [rootEdge];
edge1_1.prev = [edge1];
edge3_1.prev = [edge3];
edge4.prev = [edge1_1, edge3_1, edge2];

edge1.removeLane();

const trafficSimulation = new TrafficSimulation();
trafficSimulation.distributeTrafficRecursively(rootEdge, 60, []);

const allPaths = findShortestPath(rootEdge, edge4);
console.log(allPaths); // Prints all shortest paths to edge4
