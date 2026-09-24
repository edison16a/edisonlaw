#!/usr/bin/env node
/**
 * Captures the still renders of the desk scene that phones show instead of a live canvas.
 *
 *   node scripts/capture-renders.mjs <baseUrl> [--width 1200] [--height 1200] [--scale 1]
 *        [--settle 5000] [--out public/renders] [--only work|about]
 *
 * It needs a running server with the page that renders both WorkstationStage variants, e.g.
 *
 *   npx next dev -p 3000          (in another terminal, or next build && next start)
 *   node scripts/capture-renders.mjs http://localhost:3000
 *
 * For each variant it opens <baseUrl>/?capture=<variant>. That query makes the matching stage
 * render full screen on top of the page with its live canvas (see stage/useCaptureVariant.ts).
 * The script waits until the stage reports its first frames, lets the scene settle, screenshots
 * the viewport, scales it to width x height and encodes WebP (quality 0.85) in the browser.
 * Output goes to public/renders/<variant>.webp.
 *
 * Headless Chromium renders WebGL on the CPU through SwiftShader, so expect a minute or two per
 * variant. `--scale 2` renders at twice the pixel ratio and scales down for smoother edges, which
 * is only practical on a machine where Chromium gets a real GPU.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const VARIANTS = ['work', 'about'];

const [baseUrl, ...rest] = process.argv.slice(2);
if (!baseUrl || baseUrl.startsWith('--')) {
  console.error('usage: node scripts/capture-renders.mjs <baseUrl> [--width 1200] [--height 1200] [--scale 1]');
  process.exit(1);
}

const flags = {};
for (let i = 0; i < rest.length; i += 2) flags[rest[i].replace(/^--/, '')] = rest[i + 1];

const width = Number(flags.width ?? 1200);
const height = Number(flags.height ?? 1200);
const scale = Number(flags.scale ?? 1);
const settle = Number(flags.settle ?? 5000);
const outDir = path.resolve(flags.out ?? 'public/renders');
const variants = flags.only ? [flags.only] : VARIANTS;

/** Draws the PNG screenshot into a canvas at the target size and returns WebP as base64. */
async function toWebp(page, png) {
  const dataUrl = await page.evaluate(
    async ({ source, targetWidth, targetHeight }) => {
      const image = new Image();
      image.src = `data:image/png;base64,${source}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const context = canvas.getContext('2d');
      context.imageSmoothingQuality = 'high';
      context.drawImage(image, 0, 0, targetWidth, targetHeight);
      return canvas.toDataURL('image/webp', 0.85);
    },
    { source: png.toString('base64'), targetWidth: width, targetHeight: height },
  );
  if (!dataUrl.startsWith('data:image/webp')) throw new Error('This browser cannot encode WebP.');
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

async function capture(browser, variant) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  page.on('pageerror', (error) => console.log(`[${variant}] page error: ${error.message}`));

  const url = new URL(baseUrl);
  url.searchParams.set('capture', variant);
  await page.goto(url.toString(), { waitUntil: 'load' });
  // The Next.js dev overlay would otherwise sit on top of the render.
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });

  await page.waitForSelector(`[data-stage-capture="${variant}"][data-stage-ready="true"]`, { timeout: 180_000 });
  await page.waitForTimeout(settle);

  // Each software rendered frame is slow, so give the screenshot room to catch one.
  const png = await page.screenshot({ type: 'png', timeout: 180_000 });
  const webp = await toWebp(page, png);
  const file = path.join(outDir, `${variant}.webp`);
  await writeFile(file, webp);
  await page.close();
  console.log(`saved ${path.relative(process.cwd(), file)} (${Math.round(webp.length / 1024)} KB)`);
}

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
try {
  for (const variant of variants) await capture(browser, variant);
} finally {
  await browser.close();
}
