import React from 'react';
import { DashboardContainer } from '../dashboardContainer';
import { ConfigProvider } from '../../context/configContext';

export function EmitInterface({ config = {} }) {
  return (
    <ConfigProvider userConfig={config}>
      <DashboardContainer />
    </ConfigProvider>
  );
}
