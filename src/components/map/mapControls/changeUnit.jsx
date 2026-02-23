import React from 'react';
import IconButton from '@mui/material/IconButton';
import ReactDOM from 'react-dom/client';
import Tooltip from '@mui/material/Tooltip';

/**
 * ChangeUnitButton Component
 *
 * A simple icon button that displays the current map scale unit (e.g., 'km' or 'mi'),
 * and allows users to toggle between units when clicked.
 *
 * @param {Object} props
 * @param {Function} props.onClick - Callback triggered on button click.
 * @param {string} props.unit - Current unit to display.
 *
 * @returns {JSX.Element}
 */
function ChangeUnitButton({ onClick, unit }) {
  return (
    <Tooltip title='Change Measurement Unit'>
      <IconButton
        className='change-unit map-control-icon'
        onClick={onClick}
        style={{
          backgroundColor: '#fff',
          padding: '6px',
          color:'#2d2d2d'
        }}
      >
        {unit}
      </IconButton>
    </Tooltip>
  );
}
/**
 * ChangeUnitControl Class
 *
 * Custom Mapbox GL JS control that renders a React button allowing users
 * to toggle between "km" and "mi" for map scale units.
 *
 * This control manages its own DOM container using React
 * and integrates cleanly with Mapbox's control API via `onAdd` and `onRemove`.
 */
export class ChangeUnitControl {
  /**
   * @param {string} mapScaleUnit - Initial unit, either 'km' or 'mi'.
   * @param {Function} setMapScaleUnit - Setter function to update unit in parent state.
   */
  constructor(mapScaleUnit, setMapScaleUnit) {
    this.map = null;
    this.container = null;
    this.root = null;
    this.unit = mapScaleUnit;
    this._mounted = false;
    this._setMapScaleUnit = setMapScaleUnit;
  }
  /**
   * Handles click events to toggle between 'km' and 'mi',
   * updates the control UI and notifies parent state.
   */
  onClick = () => {
    if (!this._mounted || !this.map) return;
    this.unit = this.unit === 'km' ? 'mi' : 'km';
    this.updateUI();
    this._setMapScaleUnit(this.unit);
  };
  /**
   * Re-renders the button UI with the updated unit.
   */
  updateUI() {
    if (this._mounted && this.root) {
      try {
        this.root.render(
          <ChangeUnitButton unit={this.unit} onClick={this.onClick} />
        );
      } catch (error) {
        console.warn('Failed to update UI:', error);
      }
    }
  }
  /**
   * Called by Mapbox when the control is added to the map.
   * Initializes DOM container, mounts React root, and renders button.
   *
   * @param {mapboxgl.Map} map - Mapbox map instance.
   * @returns {HTMLElement} Control container element.
   */
  onAdd(map) {
    try {
      this.map = map;
      this.container = document.createElement('div');
      this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

      // Create root and mark as mounted
      this.root = ReactDOM.createRoot(this.container);
      this._mounted = true;

      // Initial render
      this.updateUI();

      return this.container;
    } catch (error) {
      console.error('Error adding control:', error);
      return document.createElement('div'); // Return empty div in case of error
    }
  }
  /**
   * Called by Mapbox when the control is removed from the map.
   * Cleans up React root and DOM references.
   */
  onRemove() {
    // Schedule unmount for next tick to avoid race conditions
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
