import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

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
  // get the query params
  const [searchParams] = useSearchParams();
  const { config } = useConfig();
  const isEmbedded = searchParams.get('embed') === 'true';
  const [coverage, setCoverage] = useState();
  const [zoomLocation, setZoomLocation] = useState(
    isEmbedded ? [-40, 5] : defaultZoomLocation
  );
  const [zoomLevel, setZoomLevel] = useState(isEmbedded ? 1 : defaultZoomLevel);
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
        const collectionUrl = `${config.stacApiUrl}/collections/${collectionId}`;
        const collectionMetadata = await fetchCollectionMetadata(collectionUrl);

        if (!isMounted) return;
        setCollectionMeta(collectionMetadata);
        let metadata = await fetchData(config.metadataEndpoint);
        if (!metadata || !metadata.features.length) {
          metadata = await fetchData(config.fallbackMetadataEndpoint);
        }
        const url = `${config.stacApiUrl}/collections/${collectionId}/items`;
        const stacData = await fetchAllFromSTACAPI(url);
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
  //TODO:fetch data with bounding box and dates as parameters
  useEffect(() => {
    let isMounted = true;
    const fetchCoverage = async () => {
      try {
        const now = new Date()
        const formattedDate = now.toISOString();
        const endpoint = `${config?.coverageUrl}?layer=coverage&type=geojson&maxy=83.87025634393777&maxx=213.4849548339844&miny=-74.30066604346104&minx=-176.74942016601565&crsCode=3857&zoom=2&starttime=2022-08-10T01%3A21%3A48.895Z&startProp=start_time&endProp=end_time`
        const url = `${endpoint}&endtime=${formattedDate}`
        let coverageData = await getCoverageData(url);
        if (!coverageData || !coverageData.features.length) {
          coverageData = await getCoverageData(config.fallbackCoverageEndpoint)
        }
        if (!isMounted) return;

        const indexedCoverageData = createIndexedCoverageData(coverageData);
        if (coverageData?.features?.length > 0) {
          setCoverage(indexedCoverageData);
        }
      } catch (error) {
        // console.error('Error fetching coverage data:', error);
        setCoverage([])
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
      isEmbedded={isEmbedded}
    />
  );
};
