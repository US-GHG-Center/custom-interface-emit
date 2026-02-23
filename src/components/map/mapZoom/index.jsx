import { useEffect } from 'react';

import { useMapbox } from '../../../context/mapContext';

const DEFAULT_ZOOM_LEVEL = 8.5;

/**
 * MapZoom Component
 *
 * Smoothly zooms and pans the Mapbox map when `zoomLocation` or `zoomLevel` changes.
 * Uses `map.flyTo()` for a smooth animation effect.
 *
 * @param {Object} props
 * @param {[number, number]} props.zoomLocation - Target map center as [longitude, latitude].
 * @param {number|null} props.zoomLevel - Target zoom level. If null, uses default 8.5.
 *
 * @returns {null} This component does not render any DOM.
 */
export const MapZoom = ({ zoomLocation, zoomLevel }) => {
  const { map } = useMapbox();

  useEffect(() => {
    if (!map || !zoomLocation?.length) return;

    const [lon, lat] = zoomLocation;
    map.flyTo({
      center: [lon, lat],
      zoom: zoomLevel ?? DEFAULT_ZOOM_LEVEL,
    });
  }, [map, zoomLevel, zoomLocation]);

  return null;
};
