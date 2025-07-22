import { Fragment } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';

import { EmitInterface } from './pages/emitInterface';

import './App.css';

const BASE_PATH = process.env.PUBLIC_URL;
const defaultCollectionId = 'emit-ch4plume-v1';
const defaultZoomLocation = [-98.771556, 32.967243];
const defaultZoomLevel = 4;
const defaultStartDate = '2022-08-22';
function App() {
  return (
    <Fragment>
      <BrowserRouter basename={BASE_PATH}>
        <Routes>
          <Route
            path='/'
            element={
              <EmitInterface
                defaultCollectionId={defaultCollectionId}
                defaultZoomLocation={defaultZoomLocation}
                defaultZoomLevel={defaultZoomLevel}
                defaultStartDate={defaultStartDate}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </Fragment>
  );
}

export default App;
