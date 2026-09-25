/**
 * Standoff: the home screen, a console menu. The row of game tiles sits on top with Magic Kart
 * chosen, its clip of a real race playing behind, and its name, players and Host Game below.
 * Source: Standoff running from github.com/edison16a/standoff (see lib/standoff.mjs), live at
 * https://standoff-five.vercel.app
 */
import { SITE, VIEW } from '../lib/standoff.mjs';

export async function capture({ openPage }) {
  // No WebGL on this page, so it can be taken at twice the size for crisp type.
  const page = await openPage({ ...VIEW, scale: 2 });
  await page.goto(SITE, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.getByRole('button', { name: /Host Game/i }).waitFor({ timeout: 120_000 });
  // Let the backdrop clip play into the race, with the karts close.
  await page.locator('video').first().evaluate((video) => video.play?.()).catch(() => {});
  await page.waitForFunction(() => (document.querySelector('video')?.currentTime ?? 0) > 3, null, { timeout: 180_000 });
  await page.mouse.move(1400, 880);
  return { png: await page.screenshot({ timeout: 300_000 }) };
}
