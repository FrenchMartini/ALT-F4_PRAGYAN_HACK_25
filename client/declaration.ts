declare module "*.geojson" {
  export interface Geometry {
    type: string,
    coordinates: any
  }
}