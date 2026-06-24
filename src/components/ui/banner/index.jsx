import React from 'react';
import { Box, Typography } from '@mui/material';

export const Banner = ({ message }) => {
  if (!message) return null;

  return (
    <Box
      sx={{
        backgroundColor: 'rgb(8, 42, 100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 8px',
      }}
    >
      <Typography variant='body2' sx={{ color: '#fff' }}>
        {message}
      </Typography>
    </Box>
  );
};
