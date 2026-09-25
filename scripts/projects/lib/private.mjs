/**
 * Some photos are made from Edison's own images that are not published anywhere: Backbond's
 * app screenshots (the product is private) and his AutoLab render. They are not in this
 * repository. To make those photos again, put the images in one folder and point
 * PROJECT_SOURCES at it. Without it capture.mjs skips them and keeps the committed photos.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const SOURCES = process.env.PROJECT_SOURCES;

/** Reads one of Edison's images from PROJECT_SOURCES. */
export function readSource(name) {
  if (!SOURCES) throw new Error(`${name} is one of Edison's own images. Set PROJECT_SOURCES to its folder.`);
  return readFile(join(SOURCES, name));
}
