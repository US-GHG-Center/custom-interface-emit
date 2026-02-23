import React, { useEffect, useState } from 'react';
import {
  VisualizationLayers,
  useMapbox,
  getLayerId,
  getSourceId,
} from '../../../components';

/**
 * Component responsible for rendering methane plume layers on the map.
 * It handles dynamic loading, highlighting, visibility toggling, and removal of layers.
 *
 * @component
 * @param {Object} props
 * @param {number} props.VMIN - Minimum visualization value for colormap scaling.
 * @param {number} props.VMAX - Maximum visualization value for colormap scaling.
 * @param {string} props.colormap - Colormap name used for raster rendering.
 * @param {string} props.assets - Name of the asset (raster band) used for visualization.
 * @param {Array<Plume>} props.vizItems - Array of plume items to render.
 * @param {string} props.highlightedLayer - ID of the plume currently hovered.
 * @param {function} props.onHoverOverLayer - Callback triggered when a plume layer is hovered.
 */

function Plumes({
  VMIN,
  VMAX,
  colormap,
  assets,
  vizItems,
  highlightedLayer,
  onHoverOverLayer,
}) {
  const { map } = useMapbox();

  const [plumeLayers, setPlumeLayers] = useState([]);

  useEffect(() => {
    setPlumeLayers(vizItems);
  }, [vizItems]);
  /**
   * Toggles visibility of the raster layer when a polygon is clicked.
   * @param {string} layerId - The ID of the layer to toggle.
   */
  const handleClickedOnLayer = (layerId) => {
    if (layerId) {
      const rasterId = getLayerId('raster', layerId);
      if (map?.getLayer(rasterId)) {
        const visibility = map.getLayoutProperty(
          rasterId,
          'visibility',
          'none'
        );
        if (visibility === 'none') {
          map.setLayoutProperty(rasterId, 'visibility', 'visible');
        } else if (visibility === 'visible') {
          map.setLayoutProperty(rasterId, 'visibility', 'none');
        }
      }
    }
  };
  /**
   * Removes raster, polygon, and fill layers and their sources from the map.
   * @param {string} vizItemId - ID of the plume item to remove.
   */
  const handleRemoveLayer = (vizItemId) => {
    const rasterSourceId = getSourceId('raster', vizItemId);
    const rasterLayerId = getLayerId('raster', vizItemId);
    const polygonSourceId = getSourceId('polygon', vizItemId);
    const polygonLayerId = getLayerId('polygon', vizItemId);
    const polygonFillSourceId = getSourceId('fill', vizItemId);
    const polygonFillLayerId = getLayerId('fill', vizItemId);

    if (map.getLayer(rasterLayerId)) map.removeLayer(rasterLayerId);
    if (map.getLayer(polygonLayerId)) map.removeLayer(polygonLayerId);
    if (map.getLayer(polygonFillLayerId)) map.removeLayer(polygonFillLayerId);

    if (map.getSource(rasterSourceId)) map.removeSource(rasterSourceId);
    if (map.getSource(polygonSourceId)) map.removeSource(polygonSourceId);
    if (map.getSource(polygonFillSourceId))
      map.removeSource(polygonFillSourceId);
  };
  /**
   * Effect to handle highlighting of a layer when hovered,
   * and reverting to normal style when hover is removed.
   */
  useEffect(() => {
    if (!map) return;

    if (highlightedLayer) {
      const polygonId = getLayerId('polygon', highlightedLayer);
      const rasterId = getLayerId('raster', highlightedLayer);

      // Highlight the polygon layer by increasing its line width
      if (map.getLayer(polygonId)) {
        map.setPaintProperty(polygonId, 'line-width', 5);
      }

      // Move the raster layer below the polygon layer for visibility
      if (map.getLayer(rasterId) && map.getLayer(polygonId)) {
        map.moveLayer(rasterId, polygonId);
      }
    } else {
      const mapLayers = map.getStyle().layers;
      const polygonLayers = mapLayers?.filter((item) =>
        item?.id?.includes('polygon-')
      );
      const highlightedLayer = polygonLayers?.filter(
        (item) => item?.paint['line-width'] === 5
      );

      // Revert the previously highlighted layer back to normal line width
      highlightedLayer &&
        highlightedLayer?.forEach((item) =>
          map.setPaintProperty(item.id, 'line-width', 2)
        );
    }
  }, [highlightedLayer]);

  return (
    <VisualizationLayers
      vizItems={plumeLayers}
      VMIN={VMIN}
      VMAX={VMAX}
      colormap={colormap}
      assets={assets}
      onHoverOverLayer={onHoverOverLayer}
      highlightedLayer={highlightedLayer}
      onClickedOnLayer={handleClickedOnLayer}
      handleRemoveLayer={handleRemoveLayer}
    />
  );
}

export default Plumes;
