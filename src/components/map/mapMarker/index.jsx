import { useEffect, useMemo, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapbox } from '../../../context/mapContext';
import './index.css';
import { ZOOM_LEVEL_MARGIN } from '../utils/constants';

const MARKER_IMAGE_ID = 'custom-marker-icon';
const SOURCE_ID = 'plume-markers-source';
const LAYER_ID = 'plume-markers-layer';

/**
 * MarkerFeature React component for rendering interactive Mapbox markers.
 *
 * Uses Mapbox GL JS Symbol Layers (WebGL) instead of DOM elements
 * for high performance with large datasets.
 *
 * @param {Object[]} items - Array of marker data objects.
 * @param {Function} onSelectVizItem - Callback when a marker is clicked. Passes the marker ID.
 * @param {Function} getPopupContent - Callback that returns popup HTML string for a given item.
 *
 * @returns {null} This component renders directly on the map using Mapbox API.
 */
export const MarkerFeature = ({ items, onSelectVizItem, getPopupContent }) => {
  const { map } = useMapbox();
  const popupRef = useRef(null);

  // Convert items to GeoJSON FeatureCollection
  const geoJsonData = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: (items || []).map((item) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [item.coordinates.lon, item.coordinates.lat],
        },
        properties: {
          // Flatten properties for simple access
          id: item.id,
          location: item.location,
          utcTimeObserved: item.utcTimeObserved,
          plumeId: item.plumeId,
          ...item
        },
      })),
    };
  }, [items]);

  // Initialize: Load Image, Source, and Layer
  useEffect(() => {
    if (!map) return;

    const addMapElements = () => {
      // 1. Load Marker Image
      if (!map.hasImage(MARKER_IMAGE_ID)) {
        const markerColor = '#61baf1ff';
        const strokeColor = '#1d577aff';
        const svg = getMarkerSVG(markerColor, strokeColor);
        const img = new Image(30, 30);
        img.onload = () => {
          if (!map.hasImage(MARKER_IMAGE_ID)) {
            map.addImage(MARKER_IMAGE_ID, img);
          }
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      }

      // 2. Add Source (if not exists)
      if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, {
          type: 'geojson',
          data: geoJsonData,
        });
      }

      // 3. Add Layer (if not exists)
      if (!map.getLayer(LAYER_ID)) {
        map.addLayer({
          id: LAYER_ID,
          source: SOURCE_ID,
          type: 'symbol',
          layout: {
            'icon-image': MARKER_IMAGE_ID,
            'icon-allow-overlap': true,
            'icon-size': 1,
            'visibility': 'visible',
          },
        });
      }
    };

    if (map.isStyleLoaded()) {
      addMapElements();
    } 

    map.on('style.load', addMapElements);

    // Cleanup function when component unmounts
    return () => {
      map.off('style.load', addMapElements);

      if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      if (popupRef.current) popupRef.current.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Update Source Data when items change
  useEffect(() => {
    if (map && map.getSource(SOURCE_ID)) {
      map.getSource(SOURCE_ID).setData(geoJsonData);
    }
  }, [map, geoJsonData]);

  // Handle Zoom Visibility
  useEffect(() => {
    if (!map) return;

    const handleZoom = () => {
      const zoom = map.getZoom();
      const isVisible = zoom <= ZOOM_LEVEL_MARGIN;

      if (map.getLayer(LAYER_ID)) {
        const currentVisibility = map.getLayoutProperty(LAYER_ID, 'visibility');
        const targetVisibility = isVisible ? 'visible' : 'none';

        if (currentVisibility !== targetVisibility) {
          map.setLayoutProperty(LAYER_ID, 'visibility', targetVisibility);
        }
      }

      // Close popup if layer becomes hidden
      if (!isVisible && popupRef.current) {
        popupRef.current.remove();
      }
    };

    map.on('zoom', handleZoom);
    // Initial check
    handleZoom();

    return () => map.off('zoom', handleZoom);
  }, [map]);


  // Handle Interactions (Click, Hover)
  useEffect(() => {
    if (!map) return;

    // Click Handler
    const onClick = (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [LAYER_ID] });
      if (features.length > 0) {
        const feature = features[0];
        // Stop propagation conceptually (Mapbox event)
        // e.preventDefault(); 

        const id = feature.properties?.id;
        if (id && onSelectVizItem) {
          onSelectVizItem(id);
        }
      }
    };

    // Hover Enter
    const onMouseEnter = (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [LAYER_ID] });
      if (features.length > 0) {
        map.getCanvas().style.cursor = 'pointer';
        const feature = features[0];

        if (getPopupContent) {
          if (popupRef.current) popupRef.current.remove();

          // Reconstruct simple item object for popup content generator
          // Note: coordinates comes from geometry, other props from properties
          const item = {
            ...feature.properties,
            coordinates: {
              lat: feature.geometry.coordinates[1],
              lon: feature.geometry.coordinates[0]
            }
          };

          popupRef.current = new mapboxgl.Popup({
            offset: 5,
            closeButton: false,
            closeOnClick: false,
          })
            .setLngLat(feature.geometry.coordinates)
            .setHTML(getPopupContent(item))
            .addTo(map);
        }
      }
    };

    // Hover Leave
    const onMouseLeave = () => {
      map.getCanvas().style.cursor = '';
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    };

    // Register events
    map.on('click', LAYER_ID, onClick);
    map.on('mouseenter', LAYER_ID, onMouseEnter);
    map.on('mouseleave', LAYER_ID, onMouseLeave);

    return () => {
      // Unregister events
      map.off('click', LAYER_ID, onClick);
      map.off('mouseenter', LAYER_ID, onMouseEnter);
      map.off('mouseleave', LAYER_ID, onMouseLeave);
    };
  }, [map, onSelectVizItem, getPopupContent]);

  return null;
};

/**
 * Returns an SVG string representing the visual icon for the marker.
 *
 * @param {string} color - Fill color for the marker.
 * @param {string} [strokeColor='#000000'] - Optional stroke color.
 * @returns {string} SVG string to be injected into the DOM.
 */
const getMarkerSVG = (color, strokeColor = '#000000') => {
  return `
    <svg fill="${color}" width="30px" height="30px" viewBox="-51.2 -51.2 614.40 614.40" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="${strokeColor}" stroke-width="20.24">
        <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
      </g>
      <g id="SVGRepo_iconCarrier">
        <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
      </g>
    </svg>`;
};

export default MarkerFeature;
