import { bboxPolygon } from '@turf/bbox-polygon';
import { booleanIntersects } from '@turf/boolean-intersects';

/**
 * Generates a unique source ID string.
 *
 * @param {string} layer - Layer prefix (e.g. "raster", "polygon")
 * @param {string} idx - Unique identifier for the feature/item
 * @returns {string} Combined source ID
 */
export const getSourceId = (layer, idx) => {
  return layer + '-' + idx;
};

/**
 * Generates a unique layer ID string.
 *
 * @param {string} layer - Layer prefix (e.g. "raster", "polygon")
 * @param {string} idx - Unique identifier for the feature/item
 * @returns {string} Combined layer ID
 */
export const getLayerId = (layer, idx) => {
  return layer + '-' + idx;
};

/**
 * Adds a raster tile source and corresponding raster layer to the map.
 *
 * @param {mapboxgl.Map} map - The Mapbox map instance
 * @param {number} VMIN - Minimum value for raster color scaling
 * @param {number} VMAX - Maximum value for raster color scaling
 * @param {string} colormap - Name of the colormap to apply
 * @param {string} assets - STAC asset name to fetch tiles from
 * @param {STACItem} feature - STAC item with ID, collection, and bbox
 * @param {string} sourceId - Unique ID for the raster source
 * @param {string} layerId - Unique ID for the raster layer
 */
export const addSourceLayerToMap = (
  map,
  VMIN,
  VMAX,
  colormap,
  assets,
  feature,
  sourceId,
  layerId,
  rasterApiUrl
) => {
  if (!map || (sourceExists(map, sourceId) && layerExists(map, layerId)))
    return;

  const collection = feature.collection; // feature.collection
  let itemId = feature.id;
  const TILE_URL =
    `${rasterApiUrl}/collections/${collection}/tiles/WebMercatorQuad/{z}/{x}/{y}@1x?item=` +
    itemId +
    '&assets=' +
    assets +
    '&bidx=1' +
    '&colormap_name=' +
    colormap +
    '&rescale=' +
    VMIN +
    '%2C' +
    VMAX +
    '&nodata=-9999';
  try {
    map.addSource(sourceId, {
      type: 'raster',
      tiles: [TILE_URL],
      tileSize: 256,
      bounds: feature.bbox,
    });

    map.addLayer({
      id: layerId,
      type: 'raster',
      source: sourceId,
      layout: {
        visibility: 'none', // Set the layer to be hidden initially
      },
      paint: {},
    });
  } catch (err) {
    console.warn('Error while adding layer', err);
  }
};

/**
 * Checks if a Mapbox layer already exists.
 *
 * @param {mapboxgl.Map} map - Map instance
 * @param {string} layerId - ID of the layer
 * @returns {boolean} True if layer exists
 */
export function layerExists(map, layerId) {
  return !!map.getLayer(layerId);
}

/**
 * Checks if a Mapbox source already exists.
 *
 * @param {mapboxgl.Map} map - Map instance
 * @param {string} sourceId - ID of the source
 * @returns {boolean} True if source exists
 */
export function sourceExists(map, sourceId) {
  return !!map.getSource(sourceId);
}

/**
 * Adds a vector line source and layer to draw polygon outlines.
 *
 * @param {mapboxgl.Map} map - Mapbox instance
 * @param {Feature} feature - GeoJSON polygon feature
 * @param {string} polygonSourceId - Unique source ID
 * @param {string} polygonLayerId - Unique layer ID
 * @param {number} width - Width of the line
 */
export const addSourcePolygonToMap = (
  map,
  feature,
  polygonSourceId,
  polygonLayerId,
  width
) => {
  if (
    !map ||
    (sourceExists(map, polygonSourceId) && layerExists(map, polygonLayerId))
  )
    return;

  map.addSource(polygonSourceId, {
    type: 'geojson',
    data: feature,
  });
  map.addLayer({
    id: polygonLayerId,
    type: 'line',
    source: polygonSourceId,
    layout: {},
    paint: {
      'line-color': '#0098d7',
      'line-width': width,
    },
  });
};
/**
 * Adds a transparent fill layer over a polygon. Used for capturing interactions (hover/click).
 *
 * @param {mapboxgl.Map} map - Map instance
 * @param {Feature} feature - Polygon feature
 * @param {string} polygonFillSourceId - Source ID
 * @param {string} polygonFillLayerId - Layer ID
 */
export const addFillPolygonToMap = (
  map,
  feature,
  polygonFillSourceId,
  polygonFillLayerId
) => {
  if (
    !map ||
    (sourceExists(map, polygonFillSourceId) &&
      layerExists(map, polygonFillLayerId))
  )
    return;

  map.addSource(polygonFillSourceId, {
    type: 'geojson',
    data: feature,
  });

  map.addLayer({
    id: polygonFillLayerId,
    type: 'fill',
    source: polygonFillSourceId,
    layout: {},
    paint: {
      'fill-opacity': 0,
    },
  });
};

/**
 * Adds a coverage polygon source and fill layer.
 * If map style hasn't loaded, defers execution until ready.
 *
 * @param {mapboxgl.Map} map - Map instance
 * @param {string} polygonSourceId - Source ID
 * @param {string} polygonLayerId - Layer ID
 * @param {FeatureCollection} polygonFeature - GeoJSON coverage data
 */
export const addCoveragePolygon = (
  map,
  polygonSourceId,
  polygonLayerId,
  polygonFeature
) => {
  if (!map.isStyleLoaded()) {
    map.once('style.load', () =>
      addCoveragePolygon(map, polygonSourceId, polygonLayerId, polygonFeature)
    );
    return;
  }

  if (!map.getSource(polygonSourceId)) {
    map.addSource(polygonSourceId, {
      type: 'geojson',
      data: polygonFeature,
    });
  }

  if (!map.getLayer(polygonLayerId)) {
    map.addLayer({
      id: polygonLayerId,
      type: 'fill',
      source: polygonSourceId,
      layout: {},
      paint: {
        'fill-outline-color': '#1E90FF',
        'fill-color': 'rgba(173, 216, 230, 0.4)',
      },
    });

    // Ensure coverage layer stays below rasters
    const layers = map.getStyle().layers;
    // console.log({ layers });
    const rasterLayers = layers.filter((layer) =>
      layer.id.startsWith('raster-')
    );
    if (rasterLayers.length > 0) {
      const firstRasterLayerId = rasterLayers[0].id;
      map.moveLayer(polygonLayerId, firstRasterLayerId);
    }
  }
};

/**
 * Checks whether a given GeoJSON feature is within current map bounds.
 *
 * @param {Feature} feature - GeoJSON feature (usually a plume polygon)
 * @param {LngLatBounds} bounds - Mapbox LngLatBounds object
 * @returns {boolean} True if intersects with visible map bounds
 */

export function isFeatureWithinBounds(feature, bounds) {
  // Create a bounding box feature from the map bounds
  const boundingBox = bboxPolygon([
    bounds._sw.lng,
    bounds._sw.lat,
    bounds._ne.lng,
    bounds._ne.lat,
  ]);

  // Check if the feature intersects with the bounding box
  return booleanIntersects(feature, boundingBox);
}
