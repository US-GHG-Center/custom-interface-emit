import React, { useEffect, useState, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import {
  MainMap,
  MarkerFeature,
  ColorBar,
  LoadingSpinner,
  PersistentDrawerRight,
  Title,
  MapControls,
  MapZoom,
  Search,
  FilterByDate,
  CoverageLayers,
  MapViewPortComponent,
  RASTER_ZOOM_LEVEL,
  ToggleSwitch,
} from '../../components';

import styled from 'styled-components';

import './index.css';
import { filterByDateRange, getPopupContent } from './helper';
import Plumes from './helper/PlumeLayer';
import moment from 'moment';
import { useConfig } from '../../context/configContext';

const TITLE = 'EMIT Methane Plume Viewer';
const DESCRIPTION =
  'Using a special technique, the EMIT hyperspectral data\
   is used to visualize large methane plumes whenever the instrument \
   observes the surface. Due variations of the International Space Station orbit,\
   EMIT does not have a regular observation repeat cycle.';
const HorizontalLayout = styled.div`
  width: 90%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 12px;
`;

/**
 * Dashboard Component
 *
 * This is the main container for the EMIT Methane Plume Viewer.
 * It integrates map rendering, plume data visualization, filtering, and UI controls.
 *
 * @component
 * @param {Object} props
 * @param {Record<string, Plume>} props.plumes - All available plume items (ID-indexed and sorted).
 * @param {Object} props.collectionMeta - STAC collection metadata, used for colormap and rescale config.
 * @param {CoverageGeoJsonData} props.coverage - GeoJSON coverage data.
 * @param {Array<number>} props.zoomLocation - [lon, lat] to zoom to.
 * @param {Function} props.setZoomLocation - Setter to update zoom location.
 * @param {number|null} props.zoomLevel - Optional zoom level to apply.
 * @param {Function} props.setZoomLevel - Setter to update zoom level.
 * @param {string} props.collectionId - Collection ID from STAC.
 * @param {boolean} props.loadingData - Whether the dashboard is still loading its data.
 */
export function Dashboard({
  plumes,
  collectionMeta,
  coverage,
  zoomLocation,
  filterDateRange,
  setZoomLocation,
  zoomLevel,
  setZoomLevel,
  collectionId,
  loadingData,
}) {
  // states for data
  const [vizItems, setVizItems] = useState([]); // store all available visualization items
  const [clickedOnLayer, setClickedOnLayer] = useState([]); // all visualization items for the selected region (marker)
  const [hoveredVizLayerId, setHoveredVizLayerId] = useState(''); // vizItem_id of the visualization item which was hovered over
  const [filteredVizItems, setFilteredVizItems] = useState([]); // visualization items for the selected region with the filter applied
  const [coverageFeatures, setCoverageFeatures] = useState([]);
  const [visualizationLayers, setVisualizationLayers] = useState([]);

  const [showCoverage, setShowCoverages] = useState(false);
  const [enableToggle, setEnableToggle] = useState(false);
  const [fromSearch, setFromSearch] = useState(false);

  // states for components/controls
  const [openDrawer, setOpenDrawer] = useState(false);

  const { config } = useConfig();

  //colormap states
  const [VMAX, setVMAX] = useState(100);
  const [VMIN, setVMIN] = useState(-92);
  const [colormap, setColormap] = useState('plasma');
  const [assets, setAssets] = useState('ch4-plume-emissions');

  // handler functions
  const handleSelectedVizItem = (vizItemId) => {
    if (!vizItemId) return;
    setFromSearch(false);
    const vizItem = filteredVizItems[vizItemId];
    const lat = vizItem?.lat;
    const lon = vizItem?.lon;
    setVisualizationLayers([vizItem]);
    setZoomLocation([lon, lat]);
    setZoomLevel(RASTER_ZOOM_LEVEL); // take the default zoom level
    setOpenDrawer(true);
  };

  const handleClickedVizLayer = (vizLayerId) => {
    if (!vizItems || !vizLayerId) return;
    setClickedOnLayer([vizLayerId]);
  };

  const handleZoomOutEvent = (zoom) => {
    if (!fromSearch) {
      setVisualizationLayers([]);
    }
    setZoomLevel(zoom);
    setZoomLocation('');
  };

  const handleSelectedVizItemSearch = (vizItemId) => {
    if (!vizItems || !vizItemId) return;
    setFromSearch(true);
    const vizItem = filteredVizItems[vizItemId];
    const location = vizItem?.geometry?.coordinates[0][0];
    setVisualizationLayers([vizItem]);
    setZoomLocation(location);
    setZoomLevel(RASTER_ZOOM_LEVEL);
    setOpenDrawer(true);
  };
  const filterVizItems = (dateRange, vizItems) => {
    const allVizItems = Object.keys(vizItems)?.map((key) => vizItems[key]);
    const filteredVizItems = allVizItems.filter((vizItem) => {
      const vizItemDate = moment(vizItem?.properties?.datetime).valueOf();
      const item = vizItemDate >= dateRange[0] && vizItemDate <= dateRange[1];
      return item;
    });
    const newItems = {};
    filteredVizItems.forEach((item) => {
      newItems[item?.id] = item;
    });
    return newItems;
  };

  const handleResetHome = () => {
    setFromSearch(false);
    setVisualizationLayers([]);
    setOpenDrawer(false);
    setZoomLevel(4);
    setZoomLocation([-98.771556, 32.967243]);
  };

  const handleHoveredVizLayer = useCallback((vizItemId) => {
    setHoveredVizLayerId(vizItemId);
  }, []);

  // Component Effects
  useEffect(() => {
    if (!plumes) return;
    setVizItems(plumes);
    setFilteredVizItems(plumes);
  }, [plumes]);

  useEffect(() => {
    if (!coverage?.features?.length) return;
    setEnableToggle(true);
    setCoverageFeatures(coverage);
  }, [coverage]);

  useEffect(() => {
    const colormap = collectionMeta?.renders?.dashboard?.colormap_name;
    const rescaleValues = collectionMeta?.renders?.dashboard?.rescale;
    const VMIN = rescaleValues && rescaleValues[0][0];
    const VMAX = rescaleValues && rescaleValues[0][1];
    setVMIN(VMIN);
    setVMAX(VMAX);
    setColormap(colormap);
  }, [collectionMeta]);

  useEffect(() => {
    if (visualizationLayers?.length) {
      setOpenDrawer(true);
    } else {
      setOpenDrawer(false);
    }
  }, [JSON.stringify(visualizationLayers)]);

  const handleDateRangeChange = (dateRange) => {
    if (!coverage) return;
    const filteredCoverages = filterByDateRange(coverage, dateRange);
    const newItems = filterVizItems(dateRange, vizItems);
    setFilteredVizItems(newItems);
    setCoverageFeatures(filteredCoverages);
  };

  const handleCoverageToggle = (switchState) => {
    setShowCoverages(switchState);
  };

  const handleHideLayers = (val) => {
    if (!val) {
      setShowCoverages(val);
    }
  };
  return (
    <div className='fullSize'>
      <div id='dashboard-map-container'>
        <MainMap>
          <Paper className='title-container'>
            <Title title={TITLE} description={DESCRIPTION} />
            <div className='title-content'>
              <HorizontalLayout>
                <Search
                  setFromSearch={setFromSearch}
                  vizItems={Object.keys(filteredVizItems).map(
                    (key) => filteredVizItems[key]
                  )}
                  onSelectedVizItemSearch={handleSelectedVizItemSearch}
                ></Search>
              </HorizontalLayout>
              <HorizontalLayout>
                <FilterByDate
                  filterDateRange={filterDateRange}
                  onDateChange={handleDateRangeChange}
                />
              </HorizontalLayout>
              <HorizontalLayout>
                <ToggleSwitch
                  title={'Show EMIT Coverage'}
                  onToggle={handleCoverageToggle}
                  initialState={showCoverage}
                  enabled={enableToggle}
                />
              </HorizontalLayout>
            </div>
          </Paper>
          <MapZoom zoomLocation={zoomLocation} zoomLevel={zoomLevel} />
          <MapControls
            openDrawer={openDrawer}
            setOpenDrawer={setOpenDrawer}
            handleResetHome={handleResetHome}
            handleHideLayers={handleHideLayers}
          />
          <MapViewPortComponent
            fromSearch={fromSearch}
            handleZoomOutEvent={handleZoomOutEvent}
            filteredVizItems={filteredVizItems}
            setVisualizationLayers={setVisualizationLayers}
          ></MapViewPortComponent>
          <MarkerFeature
            getPopupContent={getPopupContent}
            items={Object.keys(filteredVizItems).map((item) => {
              const v = filteredVizItems[item];
              const plumeProperties = v?.plumeProperties;
              return {
                coordinates: {
                  lat: v?.lat,
                  lon: v?.lon,
                },
                location: plumeProperties?.location,
                utcTimeObserved: plumeProperties?.utcTimeObserved,
                id: item,
                plumeId: plumeProperties?.plumeId,
              };
            })}
            onSelectVizItem={handleSelectedVizItem}
          ></MarkerFeature>
          {showCoverage && <CoverageLayers coverage={coverageFeatures} />}
          (
          <Plumes
            vizItems={visualizationLayers}
            VMIN={VMIN}
            VMAX={VMAX}
            colormap={colormap}
            assets={assets}
            onHoverOverLayer={handleHoveredVizLayer}
            highlightedLayer={hoveredVizLayerId}
          />
          )
        </MainMap>
        (
        <PersistentDrawerRight
          open={openDrawer}
          setOpen={setOpenDrawer}
          selectedVizItems={visualizationLayers}
          hoveredVizLayerId={hoveredVizLayerId}
          collectionId={collectionId}
          onSelectVizLayer={handleClickedVizLayer}
          onHoverOnVizLayer={handleHoveredVizLayer}
        />
        )
      </div>
      {VMAX && (
        <ColorBar
          label={'Methane Column Enhancement (ppm m)'}
          VMAX={VMAX}
          VMIN={VMIN}
          colormap={colormap}
          STEPS={5}
        />
      )}
      {loadingData && <LoadingSpinner />}
    </div>
  );
}
