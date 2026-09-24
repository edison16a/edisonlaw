#!/usr/bin/env node
/**
 * Recreates the project card photos in public/projects: one 1280 x 800 WebP per project.
 *
 *   node scripts/projects/capture.mjs                  every project
 *   node scripts/projects/capture.mjs betterbart trashgo   only the ones named
 *
 * Each project has a recipe in scripts/projects/shots/<id>.mjs that returns a full resolution PNG.
 * Recipes either drive the live product in headless Chromium (Backbond, BetterBART, Photo Craft,
 * Clue.ai, FlameSense) or compose a layout from Edison's own published images (App Store,
 * Chrome Web Store, Devpost, GitHub READMEs, the Neurotech@Berkeley site). Every recipe lists
 * its sources at the top. lib/encode.mjs then crops to 16:10 and encodes WebP at quality 0.82,
 * stepping down a little only when a file would pass 250 KB.
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
];

const OUT_DIR = new URL('../../public/projects/', import.meta.url);

const requested = process.argv.slice(2);
const unknown = requested.filter((id) => !PROJECTS.includes(id));
if (unknown.length > 0) {
  console.error(`Unknown project: ${unknown.join(', ')}. Known: ${PROJECTS.join(', ')}`);
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });
const browser = await launchBrowser();
const downloader = await createDownloader();
let failures = 0;

for (const id of requested.length > 0 ? requested : PROJECTS) {
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
    const { capture } = await import(`./shots/${id}.mjs`);
    const { png, crop } = await capture(tools);
    const { bytes, quality } = await encodeWebp(browser, png, crop);
    await writeFile(new URL(`${id}.webp`, OUT_DIR), bytes);
    const seconds = Math.round((Date.now() - started) / 1000);
    console.log(`${id}: ${Math.round(bytes.length / 1024)} KB at quality ${quality} in ${seconds}s`);
  } catch (error) {
    failures += 1;
    console.error(`${id}: failed. ${error.message}`);
  } finally {
    await Promise.all(contexts.map((context) => context.close()));
  }
}

await downloader.dispose();
await browser.close();
process.exit(failures > 0 ? 1 : 0);
