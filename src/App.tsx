import { Fragment } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { EmitInterface } from './pages/emitInterface';

import './App.css';

const BASE_PATH = process.env.PUBLIC_URL;

function App() {
  return (
    <Fragment>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <BrowserRouter basename={'/'}>
          <Routes>
            <Route path='/' element={<EmitInterface />} />
          </Routes>
        </BrowserRouter>
      </LocalizationProvider>
    </Fragment>
  );
}

export default App;
