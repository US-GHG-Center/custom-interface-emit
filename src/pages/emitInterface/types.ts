export interface EmitInterfaceConfig {
  metadataEndpoint: string;
  stacApiUrl: string;
  coverageUrl: string;
  mapboxToken: string;
  mapboxStyle: string;
  basemapStyle: string;
  rasterApiUrl: string;
  geoApifyKey: string;
  latlonEndpoint: string;
  fallbackMetadataEndpoint: string;
  fallbackCoverageEndpoint: string;
}

export interface EmitInterfaceProps {
  config?: Partial<EmitInterfaceConfig>;
  defaultCollectionId: string;
  defaultZoomLocation: string;
  defaultZoomLevel: string;
  defaultStartDate: string;
}
