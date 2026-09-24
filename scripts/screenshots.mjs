#!/usr/bin/env node
/**
 * Captures the README screenshots into docs/screenshots.
 *
 *   npm run build && npx next start -p 3200
 *   node scripts/screenshots.mjs http://localhost:3200
 *
 * Headless Chromium renders WebGL on the CPU through SwiftShader, so each 3D shot waits a while
 * for the scene to settle. On a machine with a real GPU the waits can be much shorter.
 */
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:3200';
const OUT = new URL('../docs/screenshots/', import.meta.url);
const SETTLE = Number(process.env.SETTLE ?? 20000);

/** Scroll position that settles project `index` in the spiral (see src/features/projects/spiral/track.ts). */
const cardScroll = (index, viewportHeight) => (index + 0.5) * 0.55 * viewportHeight;

const SHOTS = [
  { name: 'projects-spiral', width: 1440, height: 900, scroll: () => 0 },
  { name: 'projects-focus', width: 1440, height: 900, scroll: (h) => cardScroll(7, h) },
  { name: 'work-experience', width: 1440, height: 900, selector: '#experience', offset: 1350 },
  { name: 'about-me', width: 1440, height: 900, selector: '#about', offset: 0 },
  { name: 'skills', width: 1440, height: 900, selector: '#about', offset: 1500 },
  { name: 'phone-projects', width: 390, height: 844, mobile: true, scroll: () => 0 },
  { name: 'phone-work', width: 390, height: 844, mobile: true, selector: '#experience', offset: 0 },
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

for (const shot of SHOTS) {
  const page = await browser.newPage({
    viewport: { width: shot.width, height: shot.height },
    deviceScaleFactor: shot.mobile ? 2 : 1,
    isMobile: Boolean(shot.mobile),
    hasTouch: Boolean(shot.mobile),
  });
  await page.goto(base, { waitUntil: 'networkidle' });
  const target = shot.selector
    ? await page.evaluate(
        ({ selector, offset }) => document.querySelector(selector).getBoundingClientRect().top + window.scrollY + offset,
        shot,
      )
    : shot.scroll(shot.height);
  await page.evaluate((y) => window.scrollTo(0, y), target);
  await page.waitForTimeout(SETTLE);
  await page.screenshot({ path: new URL(`${shot.name}.png`, OUT).pathname });
  await page.close();
  console.log(`saved docs/screenshots/${shot.name}.png`);
}

await browser.close();
