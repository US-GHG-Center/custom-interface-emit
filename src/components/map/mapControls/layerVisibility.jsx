import { useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Tooltip from '@mui/material/Tooltip';

/**
 * VisibilityIconComp
 *
 * A React component rendered inside a Mapbox control.
 * It toggles the visibility of all raster layers on the map.
 *
 * @param {Object} props
 * @param {mapboxgl.Map} props.map - The Mapbox map instance.
 * @param {Function} props.onClickHandler - Callback to notify external state of visibility toggle.
 *
 * @returns {JSX.Element}
 */
function VisibilityIconComp({ map, onClickHandler }) {
  const [isVisible, setIsVisible] = useState(true);
  let rasterLayersCurrentVisibility = useRef(); // key[string(layer-id)]: string(previous visibility status)

  const toggleLayers = () => {
    if (!map) return;
    if (isVisible) {
      // toggle to invisible
      // from all current raster, store their current state and make it invisible
      rasterLayersCurrentVisibility.current = {};
      const layers = map.getStyle().layers;
      layers.forEach((layer) => {
        if (layer.id.includes('raster-')) {
          if (!layer.layout) return;
          rasterLayersCurrentVisibility.current[layer.id] =
            layer.layout.visibility;
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });
    } else {
      // toggle to visible
      // restore the previous visibility stateonClickHandler && onClickHandler(true);
      Object.keys(rasterLayersCurrentVisibility.current).forEach((layerId) => {
        map.setLayoutProperty(
          layerId,
          'visibility',
          rasterLayersCurrentVisibility.current[layerId]
        );
      });
    }
    onClickHandler && onClickHandler(!isVisible);
    setIsVisible(!isVisible);
  };

  return (
    <Tooltip title='Show/Hide Layers'>
      <IconButton className='menu-open-icon' onClick={toggleLayers}>
        {isVisible ? (
          <VisibilityIcon className='map-control-icon' />
        ) : (
          <VisibilityOffIcon className='map-control-icon' />
        )}
      </IconButton>
    </Tooltip>
  );
}
/**
 * LayerVisibilityControl Class
 *
 * A custom Mapbox control that renders a visibility toggle icon
 * to show/hide all raster layers on the map.
 * Built using React and mounted using `createRoot`.
 */
export class LayerVisibilityControl {
  /**
   * @param {Function} onHideLayerClick - Callback triggered when visibility is toggled.
   */
  constructor(onHideLayerClick) {
    this._onClick = onHideLayerClick;
    this.root = null;
    this._map = null;
  }
  /**
   * Called by Mapbox GL when this control is added to the map.
   * Creates the DOM container and mounts the React component.
   *
   * @param {mapboxgl.Map} map - The map instance.
   * @returns {HTMLElement} - The control’s DOM element.
   */
  onAdd = (map) => {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    const root = ReactDOM.createRoot(this._container);
    root.render(
      <VisibilityIconComp map={this._map} onClickHandler={this._onClick} />
    );
    this.root = root;
    return this._container;
  };
  /**
   * Called when the control is removed from the map.
   * Unmounts the React root and cleans up DOM references.
   */
  onRemove = () => {
    setTimeout(() => {
      try {
        this.root.unmount();
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      } catch (err) {
        console.warn('Error during cleanup:', err);
      }
    }, 0);
  };
}
