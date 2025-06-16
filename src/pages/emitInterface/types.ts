export interface EmitInterfaceConfig {
  baseStacApiUrl: string;
  metadataEndpoint: string;
  stacApiUrl: string;
  coverageUrl: string;
  mapboxToken: string;
  mapboxStyle: string;
  basemapStyle: string;
  rasterApiUrl: string;
  geoApifyKey: string;
  publicUrl: string;
  defaultCollectionId: string;
  defaultZoomLocation: [number, number];
  defaultZoomLevel: number;
  defaultStartDate: string;
  latlonEndpoint: string;
}

export interface EmitInterfaceProps {
  config?: Partial<EmitInterfaceConfig>;
}
