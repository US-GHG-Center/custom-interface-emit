import { MapboxProvider } from '../../../context/mapContext';

/**
 * MainMap Component
 *
 * Wraps child components with the MapboxProvider context.
 * This ensures that any descendant component can access the Mapbox `map` instance
 * via the `useMapbox` hook.
 *
 * Typically used to wrap the main map container and all map-related controls/layers.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - React children that require access to the Mapbox context.
 *
 * @returns {JSX.Element} Wrapped components within the Mapbox context provider.
 */
export const MainMap = ({ children }) => {
  return (
    <MapboxProvider>
      {/* Other components that need access to the map */}
      {children}
    </MapboxProvider>
  );
};
