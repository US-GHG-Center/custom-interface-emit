import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
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

export const ToggleSwitch = ({ title, onToggle, enabled, initialState }) => {
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
      <div className='toggle-title-wrapper'>
        <Typography sx={{ fontSize: "14px", color: "grey", margin: 0 }} variant='body2'>
          {title}
        </Typography>
        {!enabled && (
          <CircularProgress
            size={14}
            thickness={4}
            sx={{
              color: 'grey',
              marginLeft: '8px'
            }}
          />
        )}
      </div>
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


