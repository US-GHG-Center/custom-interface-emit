import IconButton from '@mui/material/IconButton';
import StraightenIcon from '@mui/icons-material/Straighten';
import ReactDOM from 'react-dom/client';
import Tooltip from '@mui/material/Tooltip';

/**
 * MeasureButton Component
 *
 * A React button rendered inside a Mapbox control. It visually toggles
 * to indicate active measurement mode and triggers a callback on click.
 *
 * @param {Object} props
 * @param {boolean} props.icon - Whether the button is in "active" (clicked) state.
 * @param {Function} props.onClick - Function to call when the button is clicked.
 * @returns {JSX.Element}
 */
function MeasureButton({ icon: iconClicked, onClick }) {
  return (
    <Tooltip title='Measure Tool'>
      <IconButton
        className='measure-icon map-control-icon'
        style={{
          backgroundColor: !iconClicked ? '' : '#808080',
          color: !iconClicked ? '#808080' : 'white',
        }}
        onClick={onClick}
      >
        <StraightenIcon style={{ transform: 'rotate(90deg)' }} />
      </IconButton>
    </Tooltip>
  );
}
/**
 * MeasureDistanceControl Class
 *
 * A custom Mapbox GL JS control that adds a distance measurement toggle.
 * Internally uses a React component (`MeasureButton`) rendered into the control container.
 * Tracks toggle state and updates UI when clicked.
 */
export class MeasureDistanceControl {
  /**
   * @param {boolean} measureMode - Initial state of measurement tool (on/off).
   * @param {Function} onClick - Callback to toggle measurement mode in parent.
   */
  constructor(measureMode, onClick) {
    this._mounted = false;
    this.container = null;
    this.map = null;
    this.root = null;
    this.icon = measureMode;
    this._onClick = onClick;
  }

  /**
   * Internal click handler that toggles icon state and re-renders UI.
   */
  handleClick = () => {
    if (!this._mounted || !this.map) return;
    this._onClick();
    this.icon = !this.icon;
    this.updateUI();
  };
  /**
   * Renders the current UI (icon with correct active/inactive styling).
   */
  updateUI() {
    if (this._mounted && this.root) {
      try {
        this.root.render(
          <MeasureButton icon={this.icon} onClick={this.handleClick} />
        );
      } catch (error) {
        console.warn('Failed to update UI:', error);
      }
    }
  }

  /**
   * Called when Mapbox adds the control to the map.
   * Sets up DOM container and mounts React root.
   *
   * @param {mapboxgl.Map} map - The map instance from Mapbox GL JS.
   * @returns {HTMLElement} DOM container element for the control.
   */
  onAdd(map) {
    try {
      this.map = map;
      this.container = document.createElement('div');
      this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
      this.container.addEventListener('contextmenu', (e) => e.preventDefault());
      // Create root and mark as mounted
      this.root = ReactDOM.createRoot(this.container);
      this._mounted = true;
      // Initial render
      this.updateUI();
      return this.container;
    } catch (error) {
      console.error('Error adding control:', error);
      return document.createElement('div');
    }
  }
  /**
   * Called when Mapbox removes the control from the map.
   * Unmounts React root and clears DOM references.
   */
  onRemove() {
    setTimeout(() => {
      try {
        this._mounted = false;
        if (this.root) {
          this.root.unmount();
          this.root = null;
        }
        if (this.container && this.container.parentNode) {
          this.container.parentNode.removeChild(this.container);
        }
        this.map = null;
        this.container = null;
      } catch (error) {
        console.warn('Error during cleanup:', error);
      }
    }, 0);
  }
}
