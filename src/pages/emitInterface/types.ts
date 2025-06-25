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
  latlonEndpoint: string;
}

export interface EmitInterfaceProps {
  config?: Partial<EmitInterfaceConfig>;
  defaultCollectionId: string;
  defaultZoomLocation: string;
  defaultZoomLevel: string;
  defaultStartDate: string;
}
