import React, { useEffect, useState } from 'react';
import {
  VisualizationLayers,
  useMapbox,
  getLayerId,
  getSourceId,
} from '../../../components';

/**
 * Component responsible for rendering methane plume layers on the map.
 * It handles dynamic loading, highlighting, and removal of layers.
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
 * @param {function} props.onHoverOutOfLayer - Callback triggered when the hover leaves a plume layer.
 */

function Plumes({
  VMIN,
  VMAX,
  colormap,
  assets,
  vizItems,
  highlightedLayer,
  onHoverOverLayer,
  onHoverOutOfLayer,
}) {
  const { map } = useMapbox();

  const [plumeLayers, setPlumeLayers] = useState([]);

  useEffect(() => {
    setPlumeLayers(vizItems);
  }, [vizItems]);
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

    if (!highlightedLayer) {
      // Safety net: revert anything left highlighted by an earlier interaction.
      const mapLayers = map.getStyle()?.layers;
      const polygonLayers = mapLayers?.filter((item) =>
        item?.id?.includes('polygon-')
      );
      polygonLayers
        ?.filter((item) => item?.paint['line-width'] === 5)
        ?.forEach((item) => map.setPaintProperty(item.id, 'line-width', 2));
      return;
    }

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

    // Runs before the next highlight is applied, so a plume is un-highlighted
    // even when the hover moves straight from one plume to another (scrolling
    // the card list batches the leave/enter into a single update).
    return () => {
      if (map.getLayer(polygonId)) {
        map.setPaintProperty(polygonId, 'line-width', 2);
      }
    };
  }, [map, highlightedLayer]);

  return (
    <VisualizationLayers
      vizItems={plumeLayers}
      VMIN={VMIN}
      VMAX={VMAX}
      colormap={colormap}
      assets={assets}
      onHoverOverLayer={onHoverOverLayer}
      onHoverOutOfLayer={onHoverOutOfLayer}
      highlightedLayer={highlightedLayer}
      handleRemoveLayer={handleRemoveLayer}
    />
  );
}

export default Plumes;
