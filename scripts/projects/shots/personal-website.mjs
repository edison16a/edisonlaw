/**
 * Personal website: this site's Projects spiral, the hero of the home page, settled on a
 * project with its photo facing the camera and its details beside it.
 * Source: this repository, running locally (npm run dev, or npm run build && npm start).
 * PERSONAL_SITE_URL points at it, http://localhost:3620 by default.
 */
const SITE = (process.env.PERSONAL_SITE_URL ?? 'http://localhost:3620').replace(/\/$/, '');

/** The project the spiral settles on, found by pressing the right arrow key. */
const PROJECT = 'Photo Craft';

/**
 * Headless Chromium draws WebGL on the CPU, so each move of the spiral takes a while to land
 * (see scripts/screenshots.mjs, which this follows).
 */
const SETTLE = 20_000;

const panelName = (page) =>
  page.evaluate(() => document.querySelector('[aria-label="Project spiral"] h3')?.textContent ?? null);

export async function capture({ openPage }) {
  const page = await openPage({ width: 1440, height: 900, scale: 1, colorScheme: 'dark', local: true });
  await page.goto(SITE, { waitUntil: 'networkidle', timeout: 300_000 });
  await page.waitForTimeout(SETTLE);
  for (let press = 0; press < 24 && (await panelName(page)) !== PROJECT; press++) {
    const before = await panelName(page);
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(
      (last) => {
        const now = document.querySelector('[aria-label="Project spiral"] h3')?.textContent ?? null;
        return now !== null && now !== last;
      },
      before,
      { timeout: 120_000 },
    );
  }
  if ((await panelName(page)) !== PROJECT) throw new Error(`The spiral never reached ${PROJECT}.`);
  // The development server's badge is not part of the site.
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });
  await page.mouse.move(1430, 890);
  await page.waitForTimeout(SETTLE);
  return { png: await page.screenshot({ timeout: 300_000 }) };
}
