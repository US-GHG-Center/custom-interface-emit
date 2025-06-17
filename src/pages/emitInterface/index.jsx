import React from 'react';
import { DashboardContainer } from '../dashboardContainer';
import { ConfigProvider } from '../../context/configContext';

const defaultCollectionId = 'emit-ch4plume-v1';
const defaultZoomLocation = [-98.771556, 32.967243];
const defaultZoomLevel = 4;
const defaultStartDate = '2022-08-22';
export function EmitInterface({ config = {} }) {
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
