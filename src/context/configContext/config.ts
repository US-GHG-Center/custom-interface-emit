import { EmitInterfaceConfig } from '../../pages/emitInterface/types';

/**
 * Default configuration for the EMIT Interface
 * These values will be used if no user configuration is provided
 */
const defaultConfig: EmitInterfaceConfig = {
  mapboxToken: process.env.REACT_APP_MAPBOX_TOKEN || '',
  mapboxStyle: process.env.REACT_APP_MAPBOX_STYLE_URL || '',
  basemapStyle: process.env.REACT_APP_BASEMAP_STYLES_MAPBOX_ID || '',
  stacApiUrl: process.env.REACT_APP_STAC_API_URL || '',
  metadataEndpoint: process.env.REACT_APP_METADATA_ENDPOINT || '',
  coverageUrl: process.env.REACT_APP_COVERAGE_URL || '',
  baseStacApiUrl: process.env.REACT_APP_BASE_STAC_API_URL || '',
  geoApifyKey: process.env.REACT_APP_GEOAPIFY_APIKEY || '',
  latlonEndpoint: process.env.REACT_APP_LAT_LON_TO_COUNTRY_ENDPOINT || '',
  rasterApiUrl: process.env.REACT_APP_RASTER_API_URL || '',
};

/**
 * Merges user configuration with default configuration
 * @param {Partial<EmitInterfaceConfig>} userConfig - User provided configuration
 * @returns {EmitInterfaceConfig} Merged configuration
 */
export const getConfig = (
  userConfig: Partial<EmitInterfaceConfig> = {}
): EmitInterfaceConfig => {
  return {
    ...defaultConfig,
    ...userConfig,
  };
};

interface ValidationResult {
  result: boolean;
  missingFields: string[];
}

/**
 * Validates the configuration
 * @param {EmitInterfaceConfig} config - Configuration to validate
 * @returns {ValidationResult} Validation result with missing fields if any
 */
export const validateConfig = (
  config: EmitInterfaceConfig
): ValidationResult => {
  const requiredFields: (keyof EmitInterfaceConfig)[] = [
    'stacApiUrl',
    'metadataEndpoint',
    'coverageUrl',
    'baseStacApiUrl',
    'mapboxToken',
    'mapboxStyle',
    'geoApifyKey',
  ];

  const missingFields = requiredFields.filter(
    (field) =>
      config[field] === undefined ||
      config[field] === null ||
      config[field] === ''
  );
  if (missingFields.length > 0) {
    return { result: false, missingFields };
  }
  return { result: true, missingFields: [] };
};
