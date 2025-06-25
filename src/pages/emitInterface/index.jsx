import React from 'react';
import { DashboardContainer } from '../dashboardContainer';
import { ConfigProvider } from '../../context/configContext';

export function EmitInterface({
  config = {},
  defaultCollectionId,
  defaultZoomLocation,
  defaultZoomLevel,
  defaultStartDate,
}) {
  return (
    <ConfigProvider userConfig={config}>
      <DashboardContainer
        collectionId={defaultCollectionId}
        defaultZoomLocation={defaultZoomLocation}
        defaultZoomLevel={defaultZoomLevel}
        defaultStartDate={defaultStartDate}
      />
    </ConfigProvider>
  );
}
