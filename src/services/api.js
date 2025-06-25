export const UNKNOWN = 'unknown';
import lookupLocation from '../../static/locationLookup.json';
export const fetchData = async (endpoint) => {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error('Error in Network');
    }
    return await response.json();
  } catch (err) {
    console.warn('Error while getting data', err);
    return null;
  }
};

export const fetchCollectionMetadata = async (collectionUrl) => {
  try {
    const metaData = await fetchData(collectionUrl);
    return metaData;
  } catch (err) {
    console.error('Error fetching data: ', err);
  }
};

export const getCoverageData = async (url) => {
  const coverageData = await fetchData(url);
  return coverageData;
};

export async function getLocationForFeature(feature) {
  const { properties } = feature;
  const id  = properties['Plume ID'];
  const lat = properties['Latitude of max concentration'];
  const lon = properties['Longitude of max concentration'];

  const locationFromLookup = lookupLocation[id];
  if (typeof locationFromLookup === 'string' && locationFromLookup !== UNKNOWN) {
    return locationFromLookup;
  }

  const apiKey = config.geoApifyKey ?? process.env.REACT_APP_GEOAPIFY_APIKEY;
  if (!apiKey) {
    console.warn('No Geoapify API key for location lookup. Returning empty string.');
    return '';
  }

  const baseEndpoint =
    config.latlonEndpoint ??
    process.env.REACT_APP_LAT_LON_TO_COUNTRY_ENDPOINT;
  const endpoint = `${baseEndpoint}?lat=${lat}&lon=${lon}&apiKey=${apiKey}`;

  try {
    const result = await fetchLocationFromEndpoint(lat, lon, endpoint);
    return result;
  } catch (err) {
    console.error('❌ Error fetching location from endpoint:', err);
    return '';
  }
}


export function getAllLocation() {
  return lookupLocation;
}

export const fetchLocationFromEndpoint = async (lat, lon, endpoint) => {
  let location = '';
  try {
    const location_data = await fetchData(endpoint);
    let location_properties = location_data.features[0].properties;
    let sub_location =
      location_properties['city'] || location_properties['county'] || UNKNOWN;
    let state = location_properties['state']
      ? `${location_properties['state']}, `
      : '';
    let country = location_properties['country']
      ? location_properties['country']
      : '';
    location = `${sub_location}, ${state} ${country}`;
  } catch (error) {
    console.warn(`Error fetching location for ${lat}, ${lon}:`, error);

    location = UNKNOWN;
  }
  return location;
};

export const fetchAllFromSTACAPI = async (STACApiUrl) => {
  // it will fetch all collection items from all stac api.
  // do not provide offset and limits in the url
  try {
    let requiredResult = [];
    // fetch in the collection from the stac api
    const jsonResult = await fetchData(STACApiUrl);
    if (!jsonResult) return [];

    // need to pull in remaining data based on the pagination information
    const { matched, returned } = jsonResult.context;
    // if there are more data remaining fetch all
    // API doesnot support offset so need to fetch all the data by setting the limit
    if (matched > returned) {
      let allData = await fetchAllDataSTAC(STACApiUrl, matched);
      return allData;
    }
    return requiredResult;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const fetchAllDataSTAC = async (STACApiUrl, numberMatched) => {
  // NOTE: STAC API doesnot accept offset as a query params. So, need to pull all the items using limit.
  try {
    const url = addOffsetsToURL(STACApiUrl, numberMatched);
    const jsonResult = await fetchData(url);
    if (!jsonResult) return [];
    return getResultArray(jsonResult);
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

// helpers
const addOffsetsToURL = (url, limit) => {
  if (url.includes('?')) {
    return `${url}&limit=${limit}`;
  } else {
    return `${url}?limit=${limit}`;
  }
};

export const getResultArray = (result) => {
  if ('features' in result) {
    // the result is for collection item
    return result.features;
  }
  if ('collections' in result) {
    // the result is for collection
    return result.collections;
  }
  return [];
};
