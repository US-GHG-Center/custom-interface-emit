import IconButton from '@mui/material/IconButton';
import ReactDOM from 'react-dom/client';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';

/**
 * HamburgerIcon Component
 *
 * A floating UI button rendered inside a Mapbox control,
 * used to toggle side drawers or panels.
 *
 * @param {Object} props
 * @param {Function} props.onClickHandler - Function to call when the icon is clicked.
 * @returns {JSX.Element} MUI IconButton wrapped in a tooltip.
 */

function HamburgerIcon({ onClickHandler }) {
  return (
    <Tooltip title='Toggle Drawer'>
      <IconButton className='menu-open-icon' onClick={onClickHandler}>
        <MenuIcon className='map-control-icon'  sx={{ color: '#2d2d2d' }}/>
      </IconButton>
    </Tooltip>
  );
}

/**
 * HamburgerControl Class
 *
 * A custom Mapbox GL JS control that renders a React-based
 * hamburger menu icon to toggle UI elements.
 *
 * Integrates with the Mapbox `onAdd` / `onRemove` lifecycle,
 * and uses React to mount/unmount the UI.
 */
export class HamburgerControl {
  /**
   * @param {Function} onHamburgerClick - Callback triggered when the icon is clicked.
   */
  constructor(onHamburgerClick) {
    this._onClick = onHamburgerClick;
    this.root = null;
    this.isMounted = true;
  }
  /**
   * Called when Mapbox adds the control to the map.
   * Creates a container DOM node and mounts the React component.
   *
   * @param {mapboxgl.Map} map - Mapbox map instance.
   * @returns {HTMLElement} Control container element to be placed on the map.
   */

  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    const root = ReactDOM.createRoot(this._container);
    root.render(<HamburgerIcon onClickHandler={this._onClick} />);
    this.root = root;
    return this._container;
  }

  /**
   * Called when Mapbox removes the control from the map.
   * Cleans up the React root and DOM references.
   */
  onRemove() {
    setTimeout(() => {
      try {
        this.isMounted = false;
        this.root.unmount();
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      } catch (err) {
        console.error('Error adding control:', err);
      }
    }, 0);
  }
}
