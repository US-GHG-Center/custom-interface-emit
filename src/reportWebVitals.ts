// src/reportWebVitals.ts
import { MetricType } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: (metric: MetricType) => void): void => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals')
      .then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        onCLS(onPerfEntry);
        onINP(onPerfEntry);
        onFCP(onPerfEntry);
        onLCP(onPerfEntry);
        onTTFB(onPerfEntry);
      })
      .catch((err) => {
        console.error('Failed to load web-vitals module:', err);
      });
  }
};

export default reportWebVitals;