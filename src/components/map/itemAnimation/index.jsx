import { useEffect, useRef } from 'react';
import { useMapbox } from '../../../context/mapContext';
import TimelineControl from 'mapboxgl-timeline';
import moment from 'moment';
import {
  addSourceLayerToMap as bufferSourceLayer,
  getSourceId,
  getLayerId,
  layerExists,
  sourceExists,
} from '../utils';

import 'mapboxgl-timeline/dist/style.css';
import './index.css';
/*
      Animation component for the visualization layers

      @param {STACItem} vizItems   - An array of stac items which are to be animated
      @param {number} VMIN - minimum value of the color index
      @param {number} VMAX - maximum value of the color index
      @param {string} colormap - name of the colormap
      @param {string} assets - name of the asset of the color
*/
export const VizItemAnimation = ({
  vizItems,
  VMIN,
  VMAX,
  colormap,
  assets,
}) => {
  // vizItem is the array of stac collection features
  const { map } = useMapbox();
  const timeline = useRef(null);
  const timelineComponent = useRef(null);
  useEffect(() => {
    if (!map || !vizItems.length) return;

    // hashmap so we could refer the index and do manipulations with respect to the index.
    const vizItemDateIdxMap = {};
    vizItems.forEach((vizItem, idx) => {
      const datetime = vizItem['properties']['datetime'];
      const momentFormattedDatetimeStr = moment(datetime).format();
      vizItemDateIdxMap[momentFormattedDatetimeStr] = idx;
    });

    // bufferedLayer to hold the layers and soruces that are already bufferedLayer
    const bufferedLayer = new Set();
    const bufferedSource = new Set();

    let startDatetime = vizItems[0]['properties']['datetime'];
    let secondDatetime = vizItems[1]['properties']['datetime'];
    const captureInterval = moment(secondDatetime).diff(
      startDatetime,
      'minutes'
    );
    let endDatetime = vizItems[vizItems.length - 1]['properties']['datetime'];
    timeline.current = new TimelineControl({
      start: startDatetime,
      end: endDatetime,
      initial: startDatetime,
      step: 1000 * 60 * captureInterval, // define steps based on the time interval of the consecutive elements
      onStart: (date) => {
        // executed on initial step tick.
        handleAnimation(
          map,
          VMIN,
          VMAX,
          colormap,
          assets,
          date,
          vizItemDateIdxMap,
          vizItems,
          bufferedLayer,
          bufferedSource
        );
      },
      onChange: (date) => {
        // executed on each changed step tick.
        handleAnimation(
          map,
          VMIN,
          VMAX,
          colormap,
          assets,
          date,
          vizItemDateIdxMap,
          vizItems,
          bufferedLayer,
          bufferedSource
        );
      },
      format: (date) => {
        const dateStr =
          moment(date).utc().format('MM/DD/YYYY, HH:mm:ss') + ' UTC';
        return dateStr;
      },
    });
    const timelineElement = timeline.current.onAdd(map);
    timelineComponent.current.append(timelineElement);

    return () => {
      // cleanups
      bufferedLayer.forEach((layer) => {
        if (layerExists(map, layer)) map.removeLayer(layer);
      });
      bufferedSource.forEach((source) => {
        if (sourceExists(map, source)) map.removeSource(source);
      });
      bufferedLayer.clear();
      bufferedSource.clear();
      prev = null;
      if (map && timeline) {
        map.removeControl(timeline.current);
      }
    };
  }, [vizItems, map, VMIN, VMAX, colormap, assets]);

  return (
    <div style={{ width: '100%', height: '100%' }} className='player-container'>
      <div id='plume-animation-controller' ref={timelineComponent}></div>
    </div>
  );
};

let prev = null;

const handleAnimation = (
  map,
  VMIN,
  VMAX,
  colormap,
  assets,
  date,
  vizItemDateIdxMap,
  vizItems,
  bufferedLayer,
  bufferedSource
) => {
  const momentFormattedDatetimeStr = moment(date).format();
  if (!(momentFormattedDatetimeStr in vizItemDateIdxMap)) return;

  const index = vizItemDateIdxMap[momentFormattedDatetimeStr];

  // buffer the following k elements.
  const k = 4;
  bufferSourceLayers(
    map,
    VMIN,
    VMAX,
    colormap,
    assets,
    vizItems,
    index,
    k,
    bufferedLayer,
    bufferedSource
  );

  // display the indexed vizItem.
  const prevLayerId = prev;
  const currentLayerId = getLayerId(index);
  transitionLayers(map, prevLayerId, currentLayerId);
  prev = currentLayerId;
};

const bufferSourceLayers = (
  map,
  VMIN,
  VMAX,
  colormap,
  assets,
  vizItems,
  index,
  k,
  bufferedLayer,
  bufferedSource
) => {
  let start = index;
  let limit = index + k;
  if (start >= vizItems.length - 1) {
    return;
  }
  if (limit >= vizItems.length) {
    limit = vizItems.length;
  }
  for (let i = start; i < limit; i++) {
    let sourceId = getSourceId(i);
    let layerId = getLayerId(i);
    if (!bufferedLayer.has(layerId)) {
      bufferSourceLayer(
        map,
        VMIN,
        VMAX,
        colormap,
        assets,
        vizItems[i],
        sourceId,
        layerId
      );
      bufferedLayer.add(layerId);
      if (!bufferedSource.has(sourceId)) bufferedSource.add(sourceId);
    }
  }
  // TODO: for a very long vizItem list, we would want to remove the oldest buffered source and buffered layer for memory optimization.
};

const transitionLayers = (map, prevLayerId, currentLayerId) => {
  // Fade in the current layer
  if (currentLayerId)
    map.setLayoutProperty(currentLayerId, 'visibility', 'visible');

  // Note: for a smooth transition we need to first display the new layer when there exist a old layer.
  // Else there will be flicker between transition.
  setTimeout(() => {
    // Fade out the prev layer
    if (prevLayerId) map.setLayoutProperty(prevLayerId, 'visibility', 'none');
  }, 900); // Because of timeout, there is a lag on the rewind. TODO: find a better solution.
};
