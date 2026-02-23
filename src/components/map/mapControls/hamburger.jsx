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
 * @param {boolean} props.isActive - Whether the drawer is currently active/open.
 * @returns {JSX.Element} MUI IconButton wrapped in a tooltip.
 */

function HamburgerIcon({ onClickHandler, isActive }) {
  return (
    <Tooltip title={isActive ? 'Toggle Drawer' : 'Drawer unavailable'}>
      <span>
        <IconButton
          className='menu-open-icon'
          onClick={onClickHandler}
          disabled={!isActive}
        >
          <MenuIcon className='map-control-icon' sx={{ color: isActive ? '#2d2d2d' : '#888' }}/>
        </IconButton>
      </span>
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
   * @param {boolean} drawerActive - Whether the drawer is currently active/open.
   */
  constructor(onHamburgerClick, drawerActive) {
    this._onClick = onHamburgerClick;
    this._drawerActive = drawerActive;
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
    root.render(<HamburgerIcon onClickHandler={this._onClick} isActive={this._drawerActive} />);
    this.root = root;
    return this._container;
  }

  /**
   * Update the control with new drawer active state.
   * Re-renders the React component with updated props.
   *
   * @param {boolean} drawerActive - New drawer active state.
   */
  update(drawerActive) {
    this._drawerActive = drawerActive;
    if (this.root && this.isMounted) {
      this.root.render(<HamburgerIcon onClickHandler={this._onClick} isActive={this._drawerActive} />);
    }
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
