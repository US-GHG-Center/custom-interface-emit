import {length}  from '@turf/length';
const { sourceExists, layerExists } = require('../../utils');

// GeoJSON object to hold  measurement features
export const MEASURE_POINTS = {
  type: 'FeatureCollection',
  features: [],
};
export const MEASURE_LINE = {
  type: 'FeatureCollection',
  features: [],
};
//GeoJson object to hold distance label
export const MEASURE_LABEL = {
  type: 'Feature',
  properties: {
    description: '',
  },
  geometry: {
    type: 'LineString',
    coordinates: [],
  },
};

// Used to draw a line between points
const linestring = {
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: [],
  },
};
const pointLayer = {
  id: 'measure-points',
  type: 'circle',
  source: 'measurePoints',
  paint: {
    'circle-radius': 4.5,
    'circle-color': '#00BFFF',
  },
  filter: ['in', '$type', 'Point'],
};

const lineLayer = {
  id: 'measure-line',
  type: 'line',
  source: 'measureLine',
  layout: {
    'line-cap': 'round',
    'line-join': 'round',
  },
  paint: {
    'line-color': '#00BFFF',
    'line-width': 2,
  },
  filter: ['in', '$type', 'LineString'],
};

const labelLayer = {
  id: 'measure-label',
  type: 'symbol',
  source: 'measureLabel',
  layout: {
    'text-field': ['get', 'description'],
    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
    'text-size': 13,
    'text-letter-spacing': 0.1,
    'text-justify': 'center',
    'symbol-spacing': 1000,
    'text-offset': [0, 1.5],
    'text-anchor': 'bottom',
  },
  paint: {
    'text-color': '#fff',
    'text-halo-color': '#000',
    'text-halo-width': 2,
  },
};
/**
 * Dynamically updates the map cursor when using the measurement tool.
 *
 * @param {mapboxgl.Map} map - Mapbox map instance
 * @param {GeoJSON.FeatureCollection} measurePoints - Current measurement points
 * @param {boolean} measureMode - Whether measurement mode is active
 */
export function changeCursor(map, measurePoints, measureMode) {
  const totalPoints = measurePoints?.features.filter(
    (f) => f.geometry.type === 'Point'
  );
  // Change the cursor to a pointer when hovering over a point on the map.
  // Otherwise cursor is a crosshair.
  const crosshair = totalPoints?.length < 2 && measureMode;
  map.getCanvas().style.cursor = crosshair ? 'crosshair' : 'pointer';
}

/**
 * Clears all measurement data from sources.
 *
 * @param {mapboxgl.Map} map - Mapbox instance
 */
export function cleanMeasurementControlLayers(map) {
  map.getSource('measurePoints').setData(MEASURE_POINTS);
  map.getSource('measureLine').setData(MEASURE_LINE);
  map.getSource('measureLabel').setData(MEASURE_LABEL);
}

/**
 * Handles placing or removing anchor points for measuring.
 *
 * @param {Object} e - Mapbox mouse event
 * @param {mapboxgl.Map} map - Map instance
 * @param {GeoJSON.FeatureCollection} measurePoints - Existing points
 * @returns {GeoJSON.FeatureCollection} Updated points
 */
export function findMeasurementAnchor(e, map, measurePoints) {
  const features = map.queryRenderedFeatures(e.point, {
    layers: ['measure-points'],
  });
  const totalPoints = measurePoints?.features.filter(
    (f) => f.geometry.type === 'Point'
  );
  let temp = {
    type: 'FeatureCollection',
    features: [],
  };
  // If a feature was clicked, remove it from the map.
  if (features?.length) {
    const id = features[0].properties.id;
    temp = {
      ...temp,
      features: measurePoints?.features.filter(
        (point) => point.properties.id !== id
      ),
    };
  } else if (
    !totalPoints ||
    (totalPoints?.length === 0 && features?.length === 0)
  ) {
    const point = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [e.lngLat.lng, e.lngLat.lat],
      },
      properties: {
        id: String(new Date().getTime()),
      },
    };
    temp = {
      ...temp,
      features: [point],
    };
  }
  return temp;
}
/**
 * Adds measurement sources to the map (points, line, label).
 *
 * @param {mapboxgl.Map} map - Mapbox instance
 * @param {*} measurePoints - Points GeoJSON
 * @param {*} measureLine - Line GeoJSON
 * @param {*} measureLabelAnchor - Label GeoJSON
 */
export function addMeasurementSource(
  map,
  measurePoints,
  measureLine,
  measureLabelAnchor
) {
  if (
    !map ||
    sourceExists(map, 'measurePoints') ||
    sourceExists(map, 'measureLine') ||
    sourceExists(map, 'measureLabel')
  )
    return;

  map.addSource('measurePoints', {
    type: 'geojson',
    data: measurePoints,
  });

  map.addSource('measureLine', {
    type: 'geojson',
    data: measureLine,
  });
  map.addSource('measureLabel', {
    type: 'geojson',
    data: measureLabelAnchor,
  });
}
/**
 * Adds Mapbox layers for measuring points, lines, and labels.
 *
 * @param {mapboxgl.Map} map - Mapbox instance
 */
export function addMeasurementLayer(map) {
  if (
    !map ||
    layerExists(map, 'measure-points') ||
    layerExists(map, 'measure-line') ||
    layerExists(map, 'measure-label')
  )
    return;

  map.addLayer(pointLayer);
  map.addLayer(labelLayer);
  map.addLayer(lineLayer);
}

/**
 * Removes measurement layers from the map (if they exist).
 *
 * @param {mapboxgl.Map} map - Mapbox instance
 */
export function removeMeasurementLayer(map) {
  if (map) {
    if (layerExists(map, `measure-points`)) map.removeLayer('measure-points');
    if (layerExists(map, `measure-line`)) map.removeLayer('measure-line');
    if (layerExists(map, `measure-label`)) map.removeLayer('measure-label');
  }
}
/**
 * Resets measurement sources to empty state.
 *
 * @param {mapboxgl.Map} map - Mapbox instance
 */
export function removeMeasurementSource(map) {
  if (map) {
    map.getSource('measureLabel')?.setData(MEASURE_LABEL);
    map.getSource('measurePoints')?.setData(MEASURE_POINTS);
    map.getSource('measureLine')?.setData(MEASURE_LINE);
  }
}
/**
 * Creates a measuring line and a label feature using Turf.
 *
 * @param {Object} e - Mapbox event with `lngLat`
 * @param {GeoJSON.FeatureCollection} measurePoints - Point features
 * @param {string} mapScaleUnit - Unit: 'km' or 'mi'
 * @returns {{line: GeoJSON.Feature, label: GeoJSON.Feature}} Line and label features
 */
export function createMeasuringLine(e, measurePoints, mapScaleUnit) {
  const anchorPoint = measurePoints?.features[0];
  const startCoordinates = anchorPoint?.geometry.coordinates;
  const endCoordinates = [e.lngLat.lng, e.lngLat.lat];
  linestring.geometry.coordinates = [startCoordinates, endCoordinates];
  const turfUnits = mapScaleUnit === 'mi' ? 'miles' : 'kilometers';
  const distance = length(linestring, {
    units: turfUnits,
  });
  const labelUnit = mapScaleUnit === 'mi' ? ' miles' : ' km';
  const distanceWithUnit = `${distance.toFixed(2)} ${labelUnit}`;
  const line = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [startCoordinates, endCoordinates],
    },
  };

  const label = {
    type: 'Feature',
    properties: {
      icon: distanceWithUnit,
      description: distanceWithUnit,
    },
    geometry: {
      type: 'LineString',
      coordinates: [endCoordinates, startCoordinates],
    },
  };
  return { line, label };
}
