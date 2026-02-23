import { useEffect, useState } from 'react';
import { useMapbox } from '../../../context/mapContext';
import { isFeatureWithinBounds } from '../utils/index';
import { ZOOM_LEVEL_MARGIN } from '../utils/constants';

/**
 * MapViewPortComponent
 *
 * Automatically filters and sets visualization layers (e.g., plumes)
 * that are within the visible viewport of the map. Also listens for zoom
 * and drag changes to dynamically update visible layers.
 *
 * @param {Object} props
 * @param {Object<string, any>} props.filteredVizItems - Dictionary of filtered visualization items.
 * @param {Function} props.setVisualizationLayers - Function to update visualization layers in view.
 * @param {Function} props.handleZoomOutEvent - Callback for when zoom level drops below threshold.
 * @param {boolean} props.fromSearch - Flag to disable viewport filtering after a search action.
 *
 * @returns {null} This is a non-visual, behavior-only component.
 */
export function MapViewPortComponent({
  filteredVizItems,
  setVisualizationLayers,
  handleZoomOutEvent,
  fromSearch,
}) {
  const { map } = useMapbox();
  const [initialValues, setInitialValues] = useState(filteredVizItems);
  // Update internal list of filtered features when props change
  useEffect(() => {
    if (filteredVizItems) {
      const values = Object.values(filteredVizItems);
      setInitialValues(values);
    } else {
      setInitialValues([]);
    }
  }, [filteredVizItems]);

  /**
   * Filters features that fall within the current map bounds.
   *
   * @param {mapboxgl.Map} map - Mapbox instance
   * @param {Array} features - Array of features with polygonGeometry
   */
  const findAllLayersInsideViewport = (map, initialValues) => {
    const bounds = map.getBounds();
    const itemsInsideZoomedRegion = initialValues?.filter((value) =>
      isFeatureWithinBounds(value?.polygonGeometry, bounds)
    );
    setVisualizationLayers(itemsInsideZoomedRegion);
  };

  useEffect(() => {
    //if uncommented this will fail to update the filtered items
    // (while viewing coverage and plumes and the same time )
    // if (!map.isStyleLoaded()) return;
    if (!map) return;
    const handleViewportChange = () => {
      const zoom = map.getZoom();
      if (zoom >= ZOOM_LEVEL_MARGIN && !fromSearch) {
        findAllLayersInsideViewport(map, initialValues);
      } else {
        handleZoomOutEvent(zoom);
      }
    };
    if (initialValues?.length) {
      handleViewportChange();
    }
  }, [initialValues, fromSearch]);

  useEffect(() => {
    if (!map) return;
    const handleViewportChange = () => {
      const zoom = map.getZoom();
      if (zoom >= ZOOM_LEVEL_MARGIN) {
        if (!fromSearch) {
          findAllLayersInsideViewport(map, initialValues);
        }
      } else {
        handleZoomOutEvent(zoom);
      }
    };

    map.on('zoomend', handleViewportChange);
    map.on('dragend', handleViewportChange);
    // map.on('moveend', handleViewportChange);

    return () => {
      map.off('zoomend', handleViewportChange);
      map.off('dragend', handleViewportChange);
      // map.on('moveend', handleViewportChange);
    };
  }, [map, initialValues, fromSearch]);

  return null;
}
