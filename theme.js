// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Public Sans, sans',
    h1: {
      fontFamily: 'DM Sans, sans',
      fontSize: '48px', 
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'DM Sans, sans',
      fontSize: '40px', 
      fontWeight: 600,
    },
    h3: {
      fontFamily: 'DM Sans, sans',
      fontSize: '26px', 
      fontWeight: 600,
    },
    h4: {
      fontFamily: 'DM Sans, sans',
      fontSize: '22px', 
      fontWeight: 500,
    },
    h5: {
      fontFamily: 'DM Sans, sans',
      fontSize: '20px', // 20px
      fontWeight: 500,
    },
    h6: {
      fontFamily: 'DM Sans, sans',
      fontSize: '1.125rem', // (optional)
      fontWeight: 500,
    },
    body: {
      fontSize: '18px',
    },
    caption: {
      fontSize: '14px', 
    },
  },
});

export default theme;
