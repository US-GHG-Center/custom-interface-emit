import ReactDOM from 'react-dom/client';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import Tooltip from '@mui/material/Tooltip';

/**
 * Home Component
 *
 * A reusable icon button with a tooltip, used inside a Mapbox control
 * to trigger a "reset to home" action (e.g. resetting the viewport).
 *
 * @param {Object} props
 * @param {Function} props.onClickHandler - Function to execute on button click.
 * @returns {JSX.Element}
 */

const Home = ({ onClickHandler }) => {
  return (
    <Tooltip title='Reset'>
      <IconButton className='menu-open-icon' onClick={onClickHandler}>
        <HomeIcon className='map-control-icon' />
      </IconButton>
    </Tooltip>
  );
};

/**
 * HomeControl Class
 *
 * A custom Mapbox GL JS control that renders a React-based home icon button.
 * When clicked, it triggers a provided callback to reset the map view.
 */
export class HomeControl {
  /**
   * @param {Function} handleResetHome - Callback to reset the map state (e.g. zoom/location).
   */
  constructor(handleResetHome) {
    this.root = null;
    this._map = null;
    this._onClick = handleResetHome;
  }
  /**
   * Called by Mapbox when the control is added to the map.
   * Sets up the container and mounts the React component.
   *
   * @param {mapboxgl.Map} map - The Mapbox GL JS map instance.
   * @returns {HTMLElement} The DOM element to be added as the control.
   */
  onAdd = (map) => {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    const root = ReactDOM.createRoot(this._container);
    root.render(<Home onClickHandler={this._onClick} />);
    this.root = root;
    return this._container;
  };
  /**
   * Called by Mapbox when the control is removed from the map.
   * Cleans up the React root and DOM references.
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
