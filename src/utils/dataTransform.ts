/**
 * Helper functions for transforming metadata and coverage data for visualization.
 * Includes:
 *  - reverse geocoding plume coordinates
 *  - mapping metadata features to STAC items
 *  - processing coverage polygons with rounded coordinates
 *  - indexing coverage data by time
 *
 * @module dataTransform
 */
import {
  Features,
  Metadata,
  STACItem,
  Plume,
  PointGeometry,
  Geometry,
  Properties,
  CoverageData,
  CoverageFeature,
  CoverageGeoJsonData,
} from '../dataModel';
import { EmitInterfaceConfig } from '../pages/emitInterface/types';

import {
  getAllLocation,
  getResultArray,
  UNKNOWN,
  fetchLocationFromEndpoint,
} from '../services/api';

/**
 * Performs reverse geocoding for a given feature based on its plume ID.
 * Falls back to coordinate lookup if location is not in the provided map.
 *
 * @async
 * @param {Record<string, string>} allLocation - A lookup map of plume ID to location.
 * @param {Features} feature - Metadata feature to geocode.
 * @returns {Promise<string>} - The resolved location string.
 */
const reverseGeocoding = async (
  allLocation: Record<string, string>,
  feature: Features,
  config: EmitInterfaceConfig
): Promise<string> => {
  const id = feature?.properties['Plume ID'];
  if (!allLocation) return '';
  const locationFromLookup = allLocation[id];
  if (locationFromLookup !== undefined && locationFromLookup !== UNKNOWN) {
    return locationFromLookup;
  } else {
    const lat = feature.properties['Latitude of max concentration'];
    const lon = feature.properties['Longitude of max concentration'];
    const apikey = config?.geoApifyKey
      ? config.geoApifyKey
      : process.env.REACT_APP_GEOAPIFY_APIKEY;
    if (!apikey) {
      console.warn('No api key found for location endpoint');
      return '';
    }
    const baseEndpoint = config?.latlonEndpoint
      ? config.latlonEndpoint
      : process.env.REACT_APP_LAT_LON_TO_COUNTRY_ENDPOINT;
    const endpoint = `${baseEndpoint}?lat=${lat}&lon=${lon}&&apiKey=${apikey}`;
    const location = await fetchLocationFromEndpoint(lat, lon, endpoint);
    return location;
  }
};

/**
 * Transforms metadata and STAC item information into plume objects,
 * performing location resolution and geometry extraction.
 *
 * @async
 * @param {Metadata} metadata - Metadata for all the items.
 * @param {STACItem[]} stacData - Array of STAC items .
 * @returns {Promise<{ data: Record<string, Plume> }>} - A plume map keyed by STAC item ID.
 */
export const transformMetadata = async (
  metaData: Metadata,
  stacData: STACItem[],
  config: EmitInterfaceConfig
) => {
  const metaFeatures = getResultArray(metaData);
  const allLocation: Record<string, string> =  getAllLocation();

  const polygonLookup = new Map<string, Features>();
  let pointLookup = new Map<string, Features>();

  for (const feature of metaFeatures) {
    const id = feature.properties['Data Download']
      .split('/')
      .pop()
      .split('.')[0];

    if (feature.geometry.type === 'Polygon') {
      polygonLookup.set(id, feature);
    } else if (feature.geometry.type === 'Point') {
      pointLookup.set(id, feature);
    }
  }
  const sortedData = stacData.sort((prev: STACItem, next: STACItem): number => {
    const prev_date = new Date(prev.properties.datetime).getTime();
    const next_date = new Date(next.properties.datetime).getTime();
    return prev_date - next_date;
  });
  let latestPlume = sortedData[sortedData.length - 1];
  // Transform stac data to markers with associated data
  const plumes: Record<string, Plume> = {};
  sortedData.forEach(async (item: STACItem) => {
    const id = item.id;
    const pointInfo: Features = pointLookup.get(id) as Features;
    const polygonInfo: Features = polygonLookup.get(id) as Features;
    const location =
      (await reverseGeocoding(allLocation, pointInfo as Features, config)) ??
      '';
    const properties: Properties = {
      longitudeOfMaxConcentration:
        pointInfo?.properties['Longitude of max concentration'],
      latitudeOfMaxConcentration:
        pointInfo?.properties['Latitude of max concentration'],
      plumeId: pointInfo?.properties['Plume ID'],
      concentrationUncertanity:
        pointInfo?.properties['Concentration Uncertainty (ppm m)'],
      maxConcentration:
        pointInfo?.properties['Max Plume Concentration (ppm m)'],
      orbit: Number(pointInfo?.properties['Orbit']),
      utcTimeObserved: pointInfo?.properties['UTC Time Observed'],
      pointStyle: pointInfo?.properties['style'],
      polygonStyle: polygonInfo?.properties['style'],
      plumeCountNumber: pointInfo?.properties?.plume_complex_count,
      assetLink: pointInfo?.properties['Data Download'],
      dcid: pointInfo?.properties?.DCID,
      daacSceneNumber: pointInfo?.properties['DAAC Scene Numbers'],
      sceneFID: pointInfo?.properties['Scene FIDs'],
      mapEndTime: pointInfo?.properties?.map_endtime,
      location: location,
    };
    const lon =
      pointInfo?.geometry?.type === 'Point'
        ? (pointInfo.geometry.coordinates as number[])[0]
        : undefined;
    const lat =
      pointInfo?.geometry?.type === 'Point'
        ? (pointInfo.geometry.coordinates as number[])[1]
        : undefined;
    plumes[id] = {
      id: item.id,
      bbox: item.bbox,
      type: item.type,
      lat: lat,
      lon: lon,
      links: item.links,
      assets: item.assets,
      geometry: item.geometry,
      collection: item.collection,
      properties: item.properties,
      plumeProperties: properties,
      pointGeometry: pointInfo?.geometry as PointGeometry,
      polygonGeometry: polygonInfo?.geometry as Geometry,
      stac_version: item.stac_version,
      stac_extensions: item.stac_extensions,
    };
  });
  return {
    data: plumes,
    latestPlume: latestPlume,
  };
};

const roundCoordinates = (geometry: Geometry) => {
  if (geometry && geometry.coordinates) {
    geometry.coordinates = geometry.coordinates.map((polygon) =>
      polygon.map(
        (coord) => coord.map((value) => Math.round(value * 100) / 100) // Round to 2 decimal places
      )
    );
  }
  return geometry;
};

/**
 * Creates a date-sorted, indexed coverage GeoJSON dataset.
 * Useful for efficient time-based filtering.
 *
 * @param {CoverageData} coverageData - Full coverage dataset.
 * @returns {CoverageGeoJsonData} - FeatureCollection sorted by `start_time`.
 */
export function createIndexedCoverageData(coverageData: CoverageData) {
  const coverageFeatures: CoverageFeature[] = coverageData.features;
  const processedCoverages = coverageFeatures.map((feature) => {
    const processedFeature: CoverageFeature = {
      properties: {
        start_time: feature.properties['start_time'],
        end_time: feature.properties['end_time'],
      },
      geometry: roundCoordinates(feature.geometry),
    } as CoverageFeature;
    return processedFeature;
  });

  // Create sorted array of features by date for binary search
  const sortedFeatures: CoverageFeature[] = [...processedCoverages].sort(
    (a, b) => {
      const dateA = new Date(
        a.properties.start_time || a.properties.start_time || 0
      );
      const dateB = new Date(
        b.properties.start_time || b.properties.start_time || 0
      );
      return dateA.getTime() - dateB.getTime();
    }
  );
  const result: CoverageGeoJsonData = {
    type: 'FeatureCollection',
    features: sortedFeatures,
  };

  return result;
}
