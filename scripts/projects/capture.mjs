#!/usr/bin/env node
/**
 * Recreates the project photos in public/projects: one 1280 x 800 WebP per project, plus a
 * few more for a project with a gallery.
 *
 *   node scripts/projects/capture.mjs                     every photo
 *   node scripts/projects/capture.mjs betterbart trashgo  every photo of the projects named
 *   node scripts/projects/capture.mjs photo-craft-3       one gallery photo
 *
 * Each project has a recipe in scripts/projects/shots/<id>.mjs that returns a full resolution PNG
 * for <id>.webp, its cover. A project with a gallery (see GALLERIES) also has recipes
 * <id>-2.mjs, <id>-3.mjs and so on, for <id>-2.webp, <id>-3.webp and so on.
 * Recipes either drive the live product in headless Chromium (Backbond, BetterBART, Photo Craft,
 * Clue.ai), compose a layout from Edison's own published images (App Store, Chrome Web Store,
 * Devpost, GitHub READMEs, the Neurotech@Berkeley site), or draw the product's screen as HTML
 * from its repository and store listing (SensePlan, CallSense, FlameSense, TrashGo, SunBlock,
 * Text & Image Replacer, with lib/layouts/product.mjs). Every recipe lists its sources at the
 * top. lib/encode.mjs then crops to 16:10 and encodes WebP at quality 0.82, stepping down a
 * little only when a file would pass 250 KB.
 *
 * Live pages change, so a new run will not match the committed photos pixel for pixel.
 * Needs network access and Playwright's Chromium (npx playwright install chromium).
 * Behind a proxy, set HTTPS_PROXY and NODE_EXTRA_CA_CERTS (see lib/browser.mjs).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { createDownloader, launchBrowser, openPage } from './lib/browser.mjs';
import { renderHtml } from './lib/compose.mjs';
import { encodeWebp } from './lib/encode.mjs';

/** Same order as src/content/projects.ts. */
const PROJECTS = [
  'backbond',
  'autolab',
  'westpa-dashboard',
  'senseplan',
  'callsense',
  'flamesense',
  'safeeats',
  'betterbart',
  'photo-craft',
  'clue-ai',
  'trashgo',
  'chrome-extensions',
  'text-image-replacer',
  'sunblock',
];

/** Projects with more than one photo, and how many. The first is always <id>.webp. */
const GALLERIES = { 'photo-craft': 5 };

/** A project's photos, named like their recipes and files. */
const photosOf = (id) => [id, ...Array.from({ length: (GALLERIES[id] ?? 1) - 1 }, (_, i) => `${id}-${i + 2}`)];
const PHOTOS = PROJECTS.flatMap(photosOf);

const OUT_DIR = new URL('../../public/projects/', import.meta.url);

const requested = process.argv.slice(2);
const unknown = requested.filter((name) => !PHOTOS.includes(name));
if (unknown.length > 0) {
  console.error(`Unknown project or photo: ${unknown.join(', ')}. Known: ${PHOTOS.join(', ')}`);
  process.exit(1);
}
// A project's id stands for all of its photos.
const queue =
  requested.length > 0 ? requested.flatMap((name) => (PROJECTS.includes(name) ? photosOf(name) : [name])) : PHOTOS;

await mkdir(OUT_DIR, { recursive: true });
const browser = await launchBrowser();
const downloader = await createDownloader();
let failures = 0;

for (const name of new Set(queue)) {
  const started = Date.now();
  const contexts = [];
  const tools = {
    download: downloader.get,
    compose: (html) => renderHtml(browser, html),
    openPage: async (options) => {
      const { context, page } = await openPage(browser, options);
      contexts.push(context);
      return page;
    },
  };

  try {
    const { capture } = await import(`./shots/${name}.mjs`);
    const { png, crop } = await capture(tools);
    const { bytes, quality } = await encodeWebp(browser, png, crop);
    await writeFile(new URL(`${name}.webp`, OUT_DIR), bytes);
    const seconds = Math.round((Date.now() - started) / 1000);
    console.log(`${name}: ${Math.round(bytes.length / 1024)} KB at quality ${quality} in ${seconds}s`);
  } catch (error) {
    failures += 1;
    console.error(`${name}: failed. ${error.message}`);
  } finally {
    await Promise.all(contexts.map((context) => context.close()));
  }
}

await downloader.dispose();
await browser.close();
process.exit(failures > 0 ? 1 : 0);
