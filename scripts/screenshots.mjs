#!/usr/bin/env node
/**
 * Captures the README screenshots into docs/screenshots.
 *
 *   npm run build && npx next start -p 3200
 *   node scripts/screenshots.mjs http://localhost:3200
 *
 * Headless Chromium renders WebGL on the CPU through SwiftShader, so each 3D shot waits a while
 * for the scene to settle. SETTLE sets the base wait in milliseconds, and some shots wait longer:
 * the About and Work scenes, until the dog has faded in, asleep in Work. On a machine with a real GPU the
 * waits can be much shorter.
 *
 *   node scripts/screenshots.mjs http://localhost:3200 projects-focus about-me   only these shots
 */
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const [base = 'http://localhost:3200', ...only] = process.argv.slice(2);
const OUT = new URL('../docs/screenshots/', import.meta.url);
const SETTLE = Number(process.env.SETTLE ?? 20000);

/**
 * The spiral opens on the featured project. `project` turns it with the right arrow key, one
 * project at a time, until the detail panel names that project.
 */
const SHOTS = [
  { name: 'projects-spiral', width: 1440, height: 900, scroll: 0 },
  { name: 'projects-focus', width: 1440, height: 900, scroll: 0, project: 'SensePlan' },
  { name: 'projects-gallery', width: 1440, height: 900, scroll: 0, project: 'Photo Craft' },
  { name: 'work-experience', width: 1440, height: 900, selector: '#experience', offset: 1350, settle: 90000 },
  { name: 'about-me', width: 1440, height: 900, selector: '#about', offset: 0, settle: 90000 },
  { name: 'skills', width: 1440, height: 900, selector: '#about', offset: 1500, settle: 90000 },
  { name: 'phone-projects', width: 390, height: 844, mobile: true, scroll: 0 },
  { name: 'phone-work', width: 390, height: 844, mobile: true, selector: '#experience', offset: 0 },
];

/** Name in the detail panel, or null between projects. */
const panelName = (page) =>
  page.evaluate(() => document.querySelector('[aria-label="Project spiral"] h3')?.textContent ?? null);

/** Presses the right arrow key and waits for each move to land, until the panel names `name`. */
async function turnSpiralTo(page, name) {
  await page.waitForTimeout(SETTLE);
  for (let press = 0; press < 24 && (await panelName(page)) !== name; press++) {
    const before = await panelName(page);
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(
      (last) => {
        const now = document.querySelector('[aria-label="Project spiral"] h3')?.textContent ?? null;
        return now !== null && now !== last;
      },
      before,
      { timeout: 30000 },
    );
  }
  if ((await panelName(page)) !== name) throw new Error(`The spiral never reached ${name}.`);
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

for (const shot of SHOTS.filter(({ name }) => only.length === 0 || only.includes(name))) {
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
    : shot.scroll;
  await page.evaluate((y) => window.scrollTo(0, y), target);
  if (shot.project) await turnSpiralTo(page, shot.project);
  await page.waitForTimeout(shot.settle ?? SETTLE);
  await page.screenshot({ path: new URL(`${shot.name}.png`, OUT).pathname });
  await page.close();
  console.log(`saved docs/screenshots/${shot.name}.png`);
}

await browser.close();
