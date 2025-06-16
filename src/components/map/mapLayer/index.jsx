import { useEffect, useState, useRef } from 'react';
import { useMapbox } from '../../../context/mapContext';
import {
  addSourcePolygonToMap,
  addFillPolygonToMap,
  addSourceLayerToMap,
  getSourceId,
  getLayerId,
} from '../utils/index';
import { useConfig } from '../../../context/configContext';

/**
 * VisualizationLayer
 *
 * A single visualization unit that adds raster and polygon layers to the Mapbox map
 * based on a `vizItem`.VizItem is a single STAC Item. Also attaches interaction handlers for click and hover events.
 *
 * @param {Object} props
 * @param {number} props.VMIN - Minimum visualization value for color scale.
 * @param {number} props.VMAX - Maximum visualization value for color scale.
 * @param {string} props.colormap - Colormap name used for raster styling.
 * @param {string} props.assets - STAC asset key for the raster layer.
 * @param {Object} props.vizItem - A single plume visualization item (with geometry + metadata)(STAC Item+ metadata).
 * @param {Function} props.onClickedOnLayer - Callback when the polygon is clicked.
 * @param {Function} props.onHoverOverLayer - Callback when hovered (or hover is cleared).
 * @param {Function} props.registerEventHandler - Function to register event handlers for cleanup.
 *
 * @returns {null}
 */
export const VisualizationLayer = ({
  VMIN,
  VMAX,
  colormap,
  assets,
  vizItem,
  onClickedOnLayer,
  onHoverOverLayer,
  registerEventHandler,
}) => {
  const { map } = useMapbox();
  const { config } = useConfig();
  const [vizItemId, setVizItemId] = useState('');

  // Extract the visualization ID once the item is received
  useEffect(() => {
    const id = vizItem?.id || vizItem[0]?.id;
    setVizItemId(id);
  }, [vizItem]);

  useEffect(() => {
    if (!map || !vizItemId) return;

    const feature = vizItem || vizItem[0];
    const polygonFeature = {
      geometry: vizItem?.polygonGeometry,
      properties: vizItem?.plumeProperties,
      type: 'Feature',
    };
    // Unique IDs for all source/layer types
    const rasterSourceId = getSourceId('raster', vizItemId);
    const rasterLayerId = getLayerId('raster', vizItemId);
    const polygonSourceId = getSourceId('polygon', vizItemId);
    const polygonLayerId = getLayerId('polygon', vizItemId);
    const polygonFillSourceId = getSourceId('fill', vizItemId);
    const polygonFillLayerId = getLayerId('fill', vizItemId);
    const rasterApiUrl = config.rasterApiUrl;

    // Add layers to map
    addSourceLayerToMap(
      map,
      VMIN,
      VMAX,
      colormap,
      assets,
      feature,
      rasterSourceId,
      rasterLayerId,
      rasterApiUrl
    );

    addSourcePolygonToMap(
      map,
      polygonFeature,
      polygonSourceId,
      polygonLayerId,
      2
    );

    addFillPolygonToMap(map, vizItem, polygonFillSourceId, polygonFillLayerId);
    map.setLayoutProperty(rasterLayerId, 'visibility', 'visible');

    // Define event handlers
    const clickHandler = (e) => {
      onClickedOnLayer && onClickedOnLayer(vizItemId);
    };

    const hoverHandler = (e) => {
      const polygonLayerId = getLayerId('polygon', vizItemId);
      map.setPaintProperty(polygonLayerId, 'line-width', 5);
      onHoverOverLayer && onHoverOverLayer(vizItemId);
    };

    const hoverClearHandler = (e) => {
      const polygonLayerId = getLayerId('polygon', vizItemId);
      map.setPaintProperty(polygonLayerId, 'line-width', 2);
      onHoverOverLayer && onHoverOverLayer(null);
    };

    // Attach event handlers to the map
    map.on('click', polygonFillLayerId, clickHandler);
    map.on('mouseenter', polygonFillLayerId, hoverHandler);
    map.on('mouseleave', polygonFillLayerId, hoverClearHandler);

    registerEventHandler(polygonFillLayerId, 'click', clickHandler);
    registerEventHandler(polygonFillLayerId, 'mouseenter', hoverHandler);
    registerEventHandler(polygonFillLayerId, 'mouseleave', hoverClearHandler);
  }, [map, vizItem, vizItemId]);

  return null;
};

/**
 * VisualizationLayers
 *
 * Handles rendering and syncing of all visualization layers with the current
 * map viewport and dataset (`vizItems`). Dynamically adds or removes layers as needed.
 *
 * @param {Object} props
 * @param {number} props.VMIN - Min value for color scaling.
 * @param {number} props.VMAX - Max value for color scaling.
 * @param {string} props.colormap - Colormap name.
 * @param {string} props.assets - Raster asset type for the collection.
 * @param {Array} props.vizItems - List of visualization items currently in view. Array of (STAC + their metadata)
 * @param {string|null} props.highlightedLayer - ID of currently highlighted plume.
 * @param {Function} props.onHoverOverLayer - Hover callback.
 * @param {Function} props.onClickedOnLayer - Click callback.
 * @param {Function} props.handleRemoveLayer - Called when a layer is removed. Define
 *                  action for layers that goes out of viewport.
 *
 * @returns {JSX.Element} Rendered `VisualizationLayer` components.
 */

export const VisualizationLayers = ({
  VMIN,
  VMAX,
  colormap,
  assets,
  vizItems,
  highlightedLayer,
  onHoverOverLayer,
  onClickedOnLayer,
  handleRemoveLayer,
}) => {
  const { map } = useMapbox();

  const [layersToAdd, setLayersToAdd] = useState([]);

  const eventHandlerRegistryRef = useRef({});
  // Utility to track and retrieve event handlers
  const registerEventHandler = (layerId, eventType, handler) => {
    if (!eventHandlerRegistryRef.current[layerId]) {
      eventHandlerRegistryRef.current[layerId] = {};
    }
    eventHandlerRegistryRef.current[layerId][eventType] = handler;
  };

  const getEventHandler = (layerId, eventType) => {
    return eventHandlerRegistryRef.current[layerId]?.[eventType];
  };

  const clearEventHandlers = (layerId) => {
    delete eventHandlerRegistryRef.current[layerId];
  };

  const removeEventListeners = (vizItemId) => {
    const polygonFillLayerId = getLayerId('fill', vizItemId);

    const clickHandler = getEventHandler(polygonFillLayerId, 'click');
    const hoverHandler = getEventHandler(polygonFillLayerId, 'mouseenter');
    const hoverClearHandler = getEventHandler(polygonFillLayerId, 'mouseleave');

    if (map.getLayer(polygonFillLayerId)) {
      if (clickHandler) map.off('click', polygonFillLayerId, clickHandler);
      if (hoverHandler) map.off('mouseenter', polygonFillLayerId, hoverHandler);
      if (hoverClearHandler)
        map.off('mouseleave', polygonFillLayerId, hoverClearHandler);
    }

    clearEventHandlers(polygonFillLayerId);
  };

  const removeLayers = (layersToRemove) => {
    layersToRemove.forEach((vizItemId) => {
      handleRemoveLayer(vizItemId);
      removeEventListeners(vizItemId);
    });
  };
  // Watch for changes in vizItems and sync map layers accordingly
  useEffect(() => {
    const processLayers = () => {
      try {
        const currentLayersOnMap = map.getStyle()?.layers || [];
        const currentRasterLayersOnMap = currentLayersOnMap.filter((item) =>
          item?.id?.includes('raster-')
        );

        const currentLayersInMapIds = new Set(
          currentRasterLayersOnMap.map((obj) => obj.id?.split('-')[1])
        );
        const itemsInViewPortId = new Set(vizItems.map((item) => item?.id));

        const newLayersToAdd = vizItems.filter(
          (item) => !currentLayersInMapIds.has(item.id)
        );

        if (newLayersToAdd.length) {
          setLayersToAdd(newLayersToAdd);
        } else {
          setLayersToAdd([]);
        }

        const layersToRemove = [...currentLayersInMapIds].filter(
          (id) => !itemsInViewPortId.has(id)
        );

        if (layersToRemove.length) {
          removeLayers(layersToRemove);
        }
        // This is for console logging purpose only
        // const layers = map.getStyle().layers;
        // const val = layers.filter((item) => item?.id?.includes('raster-'));
        // console.log({ finalLayers: val });

        // const listeners = map._listeners;
        // console.log({
        //   all: listeners,
        //   registry: eventHandlerRegistryRef.current,
        // });
      } catch (error) {
        console.warn('Error processing map layers:', error);
      }
    };

    if (!map) return;
    processLayers();
  }, [map, vizItems]);

  return (
    <>
      {layersToAdd.map((vizItem) => (
        <VisualizationLayer
          key={vizItem.id}
          vizItem={vizItem}
          highlightedLayer={highlightedLayer}
          onClickedOnLayer={onClickedOnLayer}
          onHoverOverLayer={onHoverOverLayer}
          VMIN={VMIN}
          VMAX={VMAX}
          colormap={colormap}
          assets={assets}
          registerEventHandler={registerEventHandler}
        />
      ))}
    </>
  );
};
