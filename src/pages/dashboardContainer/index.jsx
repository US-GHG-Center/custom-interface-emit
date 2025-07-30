import React, { useEffect, useState, useMemo } from 'react';
import { Dashboard } from '../dashboard/index.jsx';
import {
  fetchCollectionMetadata,
  fetchAllFromSTACAPI,
  fetchData,
  getCoverageData,
} from '../../services/api.js';
import {
  transformMetadata,
  createIndexedCoverageData,
} from '../../utils/dataTransform.ts';

import { useConfig } from '../../context/configContext/index.jsx';

/**
 * DashboardContainer Component
 *
 * A reusable component that provides the EMIT Methane Plume Viewer interface.
 * This component handles data fetching, state management, and rendering of the dashboard.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.collectionId] - The STAC collection ID to fetch data from
 * @param {Array<number>} [props.zoomLocation] - Initial zoom location [lon, lat]
 * @param {number} [props.zoomLevel] - Initial zoom level
 * @returns {JSX.Element} The rendered EMIT interface
 */
export const DashboardContainer = ({
  collectionId,
  defaultZoomLocation,
  defaultZoomLevel,
  defaultStartDate,
}) => {
  const { config } = useConfig();
  const [coverage, setCoverage] = useState();
  const [zoomLocation, setZoomLocation] = useState(defaultZoomLocation);
  const [zoomLevel, setZoomLevel] = useState(defaultZoomLevel);
  const [collectionMeta, setCollectionMeta] = useState({});
  const [plumes, setPlumes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filterDateRange, setFilterDateRange] = useState({});

  // Fetch collection metadata and plumes data
  useEffect(() => {
    let isMounted = true;
    setLoadingData(true);

    const init = async () => {
      try {
        const collectionUrl = `${config.baseStacApiUrl}/collections/${collectionId}`;
        const collectionMetadata = await fetchCollectionMetadata(collectionUrl);

        if (!isMounted) return;
        setCollectionMeta(collectionMetadata);
        const metadata = await fetchData(config.metadataEndpoint);
        const stacData = await fetchAllFromSTACAPI(config.stacApiUrl);
        if (!isMounted) return;
        const { data, latestPlume } = await transformMetadata(
          metadata,
          stacData,
          config
        );
        setPlumes(data);
        setFilterDateRange({
          startDate: defaultStartDate,
          endDate: latestPlume?.properties?.datetime,
        });
        setLoadingData(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (isMounted) {
          setLoadingData(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [collectionId, defaultZoomLocation, defaultZoomLevel, defaultStartDate]);

  // Fetch coverage data
  useEffect(() => {
    let isMounted = true;
    const fetchCoverage = async () => {
      try {
        const url = 'https://earth.jpl.nasa.gov/emit-mmgis-lb/API/geodatasets/get?layer=coverage&type=geojson&maxy=57.326521225217064&maxx=86.66015625000001&miny=-57.32652122521708&minx=-86.66015625000001&crsCode=3857&zoom=3&starttime=2024-08-01T00%3A00%3A00.000Z&startProp=start_time&endtime=2025-08-29T20%3A29%3A37.931Z&endProp=end_time'
        const coverageData = await getCoverageData(url);
        if (!isMounted) return;

        const indexedCoverageData = createIndexedCoverageData(coverageData);
        if (coverageData?.features?.length > 0) {
          setCoverage(indexedCoverageData);
        }
      } catch (error) {
        console.error('Error fetching coverage data:', error);
      }
    };

    fetchCoverage();
    return () => {
      isMounted = false;
    };
  }, [config.coverageUrl]);

  return (
    <Dashboard
      plumes={plumes}
      coverage={coverage}
      zoomLocation={zoomLocation}
      zoomLevel={zoomLevel}
      setZoomLocation={setZoomLocation}
      setZoomLevel={setZoomLevel}
      collectionMeta={collectionMeta}
      filterDateRange={filterDateRange}
      collectionId={collectionId}
      loadingData={loadingData}
    />
  );
};
