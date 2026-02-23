import React from 'react';
import { DashboardContainer } from '../dashboardContainer';
import { ConfigProvider } from '../../context/configContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import CssBaseline from '@mui/material/CssBaseline';
import { useSearchParams } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '../../../theme.js'

export function EmitInterface({
  config = {},
  defaultCollectionId,
  defaultZoomLocation,
  defaultZoomLevel,
  defaultStartDate,
}) {
  return (
    <ConfigProvider userConfig={config}>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DashboardContainer
            collectionId={defaultCollectionId}
            defaultZoomLocation={defaultZoomLocation}
            defaultZoomLevel={defaultZoomLevel}
            defaultStartDate={defaultStartDate}
          />
        </LocalizationProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
}

export function EmitInterfaceContainer({
  defaultCollectionId,
  defaultZoomLocation,
  defaultZoomLevel,
  defaultStartDate,
}) {
  const [searchParams] = useSearchParams();
  const zoomLocation = searchParams.get('zoom-location') || defaultZoomLocation;
  const zoomLevel = searchParams.get('zoom-level') || defaultZoomLevel;
  const collectionId = searchParams.get('collection-id') || defaultCollectionId;
  const startDate = searchParams.get('start-date') || defaultStartDate;

  return (
    <EmitInterface
      defaultCollectionId={collectionId}
      defaultZoomLocation={zoomLocation}
      defaultZoomLevel={zoomLevel}
      defaultStartDate={startDate}
    />
  );
}
