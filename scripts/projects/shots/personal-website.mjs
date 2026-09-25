/**
 * Personal website: this site's About Me section at its skills, with the 3D room beside it.
 * Source: this repository, running locally (npm run dev, or npm run build && npm start).
 * PERSONAL_SITE_URL points at it, http://localhost:3620 by default.
 */
const SITE = (process.env.PERSONAL_SITE_URL ?? 'http://localhost:3620').replace(/\/$/, '');

/**
 * Headless Chromium draws WebGL on the CPU and the dog is meshed in a worker before it fades in,
 * so the About scene needs a long wait before it is ready.
 */
const SETTLE = 90_000;

export async function capture({ openPage }) {
  const page = await openPage({ width: 1440, height: 900, scale: 1, colorScheme: 'dark', local: true });
  await page.goto(SITE, { waitUntil: 'networkidle', timeout: 300_000 });
  // The Skills block of About Me, with the standing scene pinned beside it.
  await page.evaluate(() => {
    const heading = [...document.querySelectorAll('#about h3')].find((node) => node.textContent === 'Skills');
    if (!heading) throw new Error('No Skills heading in About Me.');
    window.scrollTo(0, heading.getBoundingClientRect().top + window.scrollY - 96);
  });
  // The development server's badge is not part of the site.
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });
  await page.mouse.move(1430, 890);
  await page.waitForTimeout(SETTLE);
  return { png: await page.screenshot({ timeout: 300_000 }) };
}
