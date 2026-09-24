#!/usr/bin/env node
/**
 * Screenshots a page in headless Chromium with WebGL (SwiftShader), for checking scenes.
 *
 *   node scripts/shot.mjs <url> <out.png> [--width 1440] [--height 900] [--wait 4000]
 *        [--scroll <px>] [--selector <css>] [--offset <px>] [--mobile] [--full]
 *
 * --selector scrolls the element into view (plus --offset px) before the shot.
 * --scroll scrolls the window to an absolute position.
 */
import { chromium } from 'playwright';

const [url, out, ...rest] = process.argv.slice(2);
if (!url || !out) {
  console.error('usage: node scripts/shot.mjs <url> <out.png> [options]');
  process.exit(1);
}

const flags = {};
for (let i = 0; i < rest.length; i++) {
  const key = rest[i].replace(/^--/, '');
  const next = rest[i + 1];
  if (next === undefined || next.startsWith('--')) flags[key] = true;
  else flags[key] = next, i++;
}

const mobile = Boolean(flags.mobile);
const width = Number(flags.width ?? (mobile ? 390 : 1440));
const height = Number(flags.height ?? (mobile ? 844 : 900));
const wait = Number(flags.wait ?? 4000);

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: 1,
  isMobile: mobile,
  hasTouch: mobile,
});
page.on('console', (message) => {
  if (['error', 'warning'].includes(message.type())) console.log(`[${message.type()}] ${message.text()}`);
});
page.on('pageerror', (error) => console.log(`[pageerror] ${error.message}`));

await page.goto(url, { waitUntil: 'networkidle' });
if (flags.selector) {
  await page.evaluate(
    ({ selector, offset }) => {
      const node = document.querySelector(selector);
      if (node) window.scrollTo(0, node.getBoundingClientRect().top + window.scrollY + offset);
    },
    { selector: flags.selector, offset: Number(flags.offset ?? 0) },
  );
}
if (flags.scroll) await page.evaluate((y) => window.scrollTo(0, y), Number(flags.scroll));
await page.waitForTimeout(wait);
await page.screenshot({ path: out, fullPage: Boolean(flags.full) });
await browser.close();
console.log(`saved ${out}`);
