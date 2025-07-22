import React from 'react';
import { DashboardContainer } from '../dashboardContainer';
import { ConfigProvider } from '../../context/configContext';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import CssBaseline from '@mui/material/CssBaseline';
import { useSearchParams } from 'react-router-dom';

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
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <DashboardContainer
          collectionId={defaultCollectionId}
          defaultZoomLocation={defaultZoomLocation}
          defaultZoomLevel={defaultZoomLevel}
          defaultStartDate={defaultStartDate}
        />
      </LocalizationProvider>
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
