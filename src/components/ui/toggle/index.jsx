import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import './index.css';

/**
 * ToggleSwitch Component
 *
 * Renders a styled toggle switch with a label and controlled state.
 *
 * @param {Object} props
 * @param {string} props.title - The label text shown next to the toggle switch.
 * @param {Function} props.onToggle - Callback fired when the toggle state changes. Receives the new state (boolean).
 * @param {boolean} props.enabled - If `false`, disables the switch UI.
 * @param {boolean} props.initialState - Sets the initial checked state of the toggle.
 *
 * @returns {JSX.Element}
 */

export const  ToggleSwitch = ({ title, onToggle, enabled, initialState }) => {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    setIsChecked(initialState);
  }, [initialState]);

  const handleToggle = () => {
    const newState = !isChecked;
    setIsChecked(newState);
    if (onToggle) {
      onToggle(newState); // Callback with the updated state
    }
  };

  return (
    <div className='toggle-container'>
      <Typography variant='body2' gutterBottom>
        {title}
      </Typography>
      <label className='toggle-switch'>
        <input
          type='checkbox'
          className='toggle-input'
          id='showCoverage'
          checked={isChecked}
          disabled={!enabled}
          onChange={handleToggle}
        />
        <span className='slider'></span>
      </label>
    </div>
  );
};


