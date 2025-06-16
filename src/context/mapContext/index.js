import React, { createContext, useContext, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';
import { useConfig } from '../configContext';

const MapboxContext = createContext();

/**
 * MapboxProvider
 *
 * React Context Provider that initializes a Mapbox GL map instance
 * and makes it available to child components via `useMapbox` hook.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - React children that will have access to the map context.
 *
 * @returns {JSX.Element}
 */
export const MapboxProvider = ({ children }) => {
  const { config } = useConfig();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const accessToken = config?.mapboxToken;
  const mapboxStyleBaseUrl = config?.mapboxStyle;
  const BASEMAP_STYLES_MAPBOX_ID = config?.basemapStyle;

  useEffect(() => {
    if (map.current) return;

    // Validate required environment variables
    if (!accessToken) {
      console.error(
        'Mapbox access token is not set. Please set REACT_APP_MAPBOX_TOKEN in your environment variables.'
      );
      return;
    }

    let mapboxStyleUrl = 'mapbox://styles/mapbox/streets-v12';
    if (mapboxStyleBaseUrl) {
      mapboxStyleUrl = `${mapboxStyleBaseUrl}/${BASEMAP_STYLES_MAPBOX_ID}`;
    }

    try {
      // Set Mapbox access token
      mapboxgl.accessToken = accessToken;
      // Initialize map instance
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapboxStyleUrl,
        center: [-98.771556, 32.967243], // Centered on the US
        zoom: 4,
        projection: 'equirectangular',
        options: {
          trackResize: true,
        },
      });

      // Disable rotation interactions after style is loaded
      map.current.on('style.load', () => {
        map.current.dragRotate.disable();
        map.current.touchZoomRotate.disableRotation();
      });

      // Handle style loading errors
      map.current.on('error', (e) => {
        console.warn('Mapbox error:', e);
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup map instance on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <MapboxContext.Provider value={{ map: map.current }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {children}
    </MapboxContext.Provider>
  );
};

export const useMapbox = () => useContext(MapboxContext);
