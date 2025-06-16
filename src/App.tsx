import React from "react";
import { EmitInterface } from "test01-emit";
import { BrowserRouter } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

const emitConfig = {
  // API Endpoints
  stacApiUrl:
    "https://earth.gov/ghgcenter/api/stac/collections/emit-ch4plume-v1/items",
  metadataEndpoint:
    "https://earth.jpl.nasa.gov/emit-mmgis-lb/Missions/EMIT/Layers/coverage/combined_plume_metadata.json",
  coverageUrl:
    "https://earth.jpl.nasa.gov/emit-mmgis/Missions/EMIT/Layers/coverage/coverage_pub.json",
  baseStacApiUrl: "https://earth.gov/ghgcenter/api/stac/",
  mapboxToken:
    "pk.eyJ1IjoiY292aWQtbmFzYSIsImEiOiJjbGNxaWdqdXEwNjJnM3VuNDFjM243emlsIn0.NLbvgae00NUD5K64CD6ZyA",
  mapboxStyle: "mapbox://styles/covid-nasa",
  basemapStyle: "cldu1cb8f00ds01p6gi583w1m",
  geoApifyKey: "58347c078a5645d6b6367ae88984be7c",
  latlonEndpoint: "https://api.geoapify.com/v1/geocode/reverse",
  rasterApiUrl: "https://earth.gov/ghgcenter/api/raster",
  publicUrl: "",

  // Map Configuration
  defaultZoomLocation: [-98.771556, 32.967243],
  defaultZoomLevel: 4,
  defaultCollectionId: "emit-ch4plume-v1",

  // Date Range
  defaultStartDate: "2022-08-22",
};

// You can then use this object in your application, for example:
// console.log(configInstance.stacApiUrl);
// console.log(configInstance.defaultZoomLevel);

function App() {
  return (
    <BrowserRouter>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <div className="fullSize">
          <EmitInterface config={emitConfig} />
        </div>
      </LocalizationProvider>
    </BrowserRouter>
  );
}

export default App;
