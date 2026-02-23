import React, { createContext, useContext, useMemo } from 'react';
import { getConfig, validateConfig } from './config';
const ConfigContext = createContext();
export const ConfigProvider = ({ children, userConfig }) => {
  const config = useMemo(() => {
    const mergedConfig = getConfig(userConfig);
    const isValidConfig = validateConfig(mergedConfig);
    if (isValidConfig.result) {
      return mergedConfig;
    } else {
      throw new Error(
        `Missing required configuration fields ${isValidConfig.missingFields} `
      );
    }
  }, [userConfig]);
  return (
    <ConfigContext.Provider value={{ config: config }}>
      {children}
    </ConfigContext.Provider>
  );
};
export const useConfig = () => useContext(ConfigContext);
