/**
 * Builds the raster-API preview image URL shown on a plume card.
 *
 * The EMIT v2 COGs are cropped with a large nodata buffer around the plume, so
 * rendering the whole file leaves the plume as a speck in a mostly empty image.
 * The plume outline from the combined plume metadata is the valid-data extent,
 * so cropping to that polygon's bounding box gives back a plume-sized image.
 *
 * @module previewUrl
 */
import { Geometry } from '../dataModel';

const PREVIEW_QUERY =
  'bidx=1&assets=ch4-plume-emissions&rescale=1%2C1500&resampling=bilinear&colormap_name=plasma';

/**
 * Bounding box of a GeoJSON Polygon/MultiPolygon, as [minx, miny, maxx, maxy].
 * Returns undefined when the geometry is missing or has no extent, so callers
 * can fall back to the uncropped preview.
 *
 * @param {Geometry} geometry - Plume outline geometry.
 * @returns {number[] | undefined}
 */
export const getGeometryBbox = (geometry?: Geometry): number[] | undefined => {
  if (!geometry?.coordinates) return undefined;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  // Walk the coordinate nesting rather than flattening and spreading it, so a
  // single very large outline cannot overflow the stack.
  const visit = (node: unknown): void => {
    if (!Array.isArray(node)) return;
    if (typeof node[0] === 'number') {
      const [x, y] = node as number[];
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      return;
    }
    node.forEach(visit);
  };
  visit(geometry.coordinates);

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return undefined;
  // The raster API cannot crop to a zero-width or zero-height box.
  if (minX === maxX || minY === maxY) return undefined;
  return [minX, minY, maxX, maxY];
};

/**
 * Builds the preview image URL for a plume, cropped to the plume extent when
 * the plume outline is known and uncropped otherwise.
 *
 * @param {string} rasterApiUrl - Base URL of the raster (TiTiler) API.
 * @param {string} collectionId - STAC collection id.
 * @param {string} itemId - STAC item id.
 * @param {Geometry} polygonGeometry - Plume outline from the plume metadata.
 * @returns {string} - Raster API image URL.
 */
export const getPlumePreviewUrl = (
  rasterApiUrl: string,
  collectionId: string,
  itemId: string,
  polygonGeometry?: Geometry
): string => {
  const base = `${rasterApiUrl}/collections/${collectionId}/items/${itemId}`;
  const bbox = getGeometryBbox(polygonGeometry);
  if (!bbox) return `${base}/preview.png?${PREVIEW_QUERY}`;
  return `${base}/bbox/${bbox.join(',')}.png?${PREVIEW_QUERY}`;
};
