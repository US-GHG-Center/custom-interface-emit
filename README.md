# EMIT Interface

A React-based application for visualizing EMIT Plumes

---

## Local Setup

To get EMIT App up and running on your local machine, follow these steps:

### Prerequisites

You'll need the following tools installed:

- **nvm** (Node Version Manager): For managing Node.js versions. You can find installation instructions on the [nvm GitHub page](https://github.com/nvm-sh/nvm).
- **Yarn**: A fast, reliable, and secure dependency manager. Install it by following the instructions on the [Yarn website](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable).

### Environment Variables

Create a copy of the `.env.local-sample` file and name it `.env`. Populate it with your specific environment variables:

```
REACT_APP_STAC_API_URL='xxxxxxxxxx'
REACT_APP_BASE_STAC_API_URL='xxxxxxxxxx'
REACT_APP_RASTER_API_URL='xxxxxxxxxx'
PUBLIC_URL='xxxxxxxxxx'
REACT_APP_MAPBOX_TOKEN='xxxxxxxxxx'
REACT_APP_MAPBOX_STYLE_URL='xxxxxxxxxx'
REACT_APP_BASEMAP_STYLES_MAPBOX_ID='xxxxxxxxxx'
REACT_APP_METADATA_ENDPOINT='xxxxxxxxxx'
REACT_APP_LAT_LON_TO_COUNTRY_ENDPOINT='xxxxxxxxxx'
REACT_APP_GEOAPIFY_APIKEY='xxxxxxxxxx'
REACT_APP_COVERAGE_URL='xxxxxxxxxx'
REACT_APP_ENV='xxxxxxxxxx'
```

### Installation and Running

Once your environment variables are set, use the following commands:

1.  **Select Node.js Version**:

    ```bash
    nvm use
    ```

    This command ensures you're using the appropriate Node.js version specified for the project.

2.  **Install Dependencies**:

    ```bash
    yarn
    ```

    This will install all the necessary project dependencies.

3.  **Start Development Server**:
    ```bash
    yarn serve
    ```
    This command will launch the development server, and you can access EMIT App in your browser.

---

## Bundling as a Library

You can package `custom-interface-emit` as a reusable library for distribution via the [npm registry](https://www.npmjs.com/).

### 1. Build the Library

Use the provided build command to generate the library bundle:

This will create a production-ready build in the `dist` (or equivalent) directory.

```bash
yarn build-lib
```

### 2. Prepare for Publishing

Ensure the `name` and `version` fields in your [`package.json`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json) are correctly set.  
 These two fields together uniquely identify your package in the npm registry.

### 3. Authenticate with npm

If you haven't already, log in to your npm account.  
If you don’t have one, you can [sign up here](https://www.npmjs.com/signup).

```bash
npm login
```

### 4. Publish the Package

Once authenticated, publish your library to npm:

```bash
npm publish
```

**Note:**

> - Make sure your package name is unique if it's public.
> - Consider using [scoped packages](https://docs.npmjs.com/cli/v10/using-npm/scope) (e.g., `@your-org/emit-interface`) for organization or private packages.
> - For more details, see the [npm publishing guide](https://docs.npmjs.com/cli/v10/commands/npm-publish).

---

After publishing, your library can be installed in any project via:

## Usage as a Library

EMIT interface can also be used as a library within other React applications.

### Installation

Install the library via npm or yarn:

```bash
npm install custom-interface-emit
# or
yarn add custom-interface-emit
```

## Usage

### Import EMIT Interface:

```JavaScript
import { EmitInterface } from 'custom-interface-emit';
```

### Create a Configuration Variable:

```JavaScript

const emitConfig = {
  stacApiUrl:"xxxxxxx",
  metadataEndpoint: "xxxxxxx",
  coverageUrl:"xxxxxxx",
  baseStacApiUrl: "xxxxxxx",
  mapboxToken:"xxxxxxx",
  mapboxStyle: "xxxxxxx",
  basemapStyle: "xxxxxxx",
  geoApifyKey: "xxxxxxx",
  latlonEndpoint: "xxxxxxx",
  rasterApiUrl: "xxxxxxx",
  featuresApiUrl: "xxxxxxx",
};
```

### Add some default map configuration to start with

```Javascript
const defaultCollectionId:string = '';//collection id for emit emit-ch4plume-v1
const defaultZoomLocation:[number,number] = [-98.771556, 32.967243];
const defaultZoomLevel:number = 4;
const defaultStartDate:string = 'yyyy-mm-dd';//2022-08-22
```

### Use the CloudBrowse Component:

```JavaScript
  <EmitInterface
        config={emitConfig}
        defaultCollectionId={defaultCollectionId}
        defaultZoomLocation={defaultZoomLocation}
        defaultZoomLevel={defaultZoomLevel}
        defaultStartDate={defaultStartDate} />
```

#### Note: Configuration settings can also be provided directly in the host React application's .env file. For example:

```
REACT_APP_STAC_API_URL='xxxxxxxxxx'
REACT_APP_BASE_STAC_API_URL='xxxxxxxxxx'
REACT_APP_RASTER_API_URL='xxxxxxxxxx'
PUBLIC_URL='xxxxxxxxxx'
REACT_APP_MAPBOX_TOKEN='xxxxxxxxxx'
REACT_APP_MAPBOX_STYLE_URL='xxxxxxxxxx'
REACT_APP_BASEMAP_STYLES_MAPBOX_ID='xxxxxxxxxx'
REACT_APP_METADATA_ENDPOINT='xxxxxxxxxx'
REACT_APP_LAT_LON_TO_COUNTRY_ENDPOINT='xxxxxxxxxx'
REACT_APP_GEOAPIFY_APIKEY='xxxxxxxxxx'
REACT_APP_COVERAGE_URL='xxxxxxxxxx'
REACT_APP_ENV='xxxxxxxxxx'
```

## Peer Dependencies

This component has the following peer dependencies that you will need to install in your host application:

```JSON
"peerDependencies": {
    "react": "^18.2.0 || ^19.0.0",
    "react-dom": "^18.2.0 || ^19.0.0",
    "@mui/material": "^5.14.2 || ^6.0.0 || ^7.0.0"
}
```

Make sure these versions (or compatible ones) are installed in your project to avoid issues.
