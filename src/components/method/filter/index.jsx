import { useState, useEffect } from 'react';
import { Slider, Typography, Box } from '@mui/material';
import moment from 'moment';
/**
 * FilterByDate Component
 *
 * Provides an interactive slider to  change the date range based on the position of slide
 * Displays the selected date range and provides the callback on change event
 *
 * @param {Object} props
 * @param {Function} props.onDateChange - Callback to emit selected date range (in milliseconds).
 * @param {Object} props.filterDateRange - Contains startDate & endDate for initial slider bounds.
 *
 * @returns {JSX.Element}
 */
export function FilterByDate({ onDateChange, filterDateRange }) {
  const minDate = filterDateRange?.startDate
    ? moment(filterDateRange.startDate).valueOf()
    : moment('2022-08-10')?.valueOf();
  const maxDate = filterDateRange?.endDate
    ? moment(filterDateRange?.endDate).valueOf()
    : moment?.now()?.valueOf();

  const [dateRange, setDateRange] = useState([minDate, maxDate]);

  useEffect(() => {
    setDateRange([minDate, maxDate]);
  }, [minDate, maxDate]);

  /**
   * Handles slider commit: filters data and emits range + results.
   *
   * @param {Event}
   * @param {[number, number]} dateRange - Selected timestamp range
   */
  const handleSliderChange = (_, dateRange) => {
    onDateChange(dateRange);
  };

  return (
    <Box
      sx={{
        width: '100%',
        padding: '20px 15px 20px 10px',
      }}
    >
      <Typography
        gutterBottom
        variant='body2'
        sx={{
          marginBottom: '0px',
          display: 'flex',
          justifyContent: 'center',
          fontFamily: "Public sans",
          fontSize: "14px",
          color: "#808080"
        }}
      >
        {moment(dateRange[0]).format('ddd, MMM DD YYYY')} -{' '}
        {moment(dateRange[1]).format('ddd, MMM DD YYYY')}
      </Typography>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Slider
          value={dateRange}
          onChange={(_, newValue) => {
            setDateRange(newValue);
          }}
          onChangeCommitted={(_, newValue) => handleSliderChange(_, newValue)}
          getAriaLabel={() => 'Date range'}
          min={minDate}
          max={maxDate}
          step={86400000} // One day step
          sx={{
            display: 'flex',
            height: '8px',
            '& .MuiSlider-track': {
              backgroundColor: '#eeeeee',
              height: '14px',
              borderRadius: '4px',
              border: '1px solid #cfcfcf',
            },
            '& .MuiSlider-rail': {
              backgroundColor: '#ffffff',
              height: '14px',
              borderRadius: '3px',
              border: '1px solid #808080',
            },
            '& .MuiSlider-thumb': {
              width: '22px',
              height: '26px',
              backgroundColor: '#ffffff',
              border: '1px solid #ffffff',
              borderRadius: 2,
              boxShadow: '0 0 0px rgba(0,0,0,0.2)',
              '&:hover': {
                boxShadow: '0 0 5px rgba(0,0,0,0.3)',
              },
            },
          }}
        />

        <div
          style={{
            display: 'flex',
            margin: '-4px',
            fontFamily: "Public sans",
            color: "#808080",
            fontSize: "14px",
            justifyContent: 'space-between',
          }}
        >
          <Typography
            gutterBottom
            variant='body2'
            sx={{
              marginBottom: '0px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            Start Date
          </Typography>
          <Typography
            gutterBottom
            variant='body2'
            sx={{
              marginBottom: '0px',

              display: 'flex',
              justifyContent: 'center',
            }}
          >
            End Date
          </Typography>
        </div>
      </div>
    </Box>
  );
}
