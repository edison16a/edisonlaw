/**
 * Photo Craft, gallery photo 2: starting a project. A name, then any size from 16 to 10000 px
 * or one of the templates for social posts, video, screens, print and logos.
 * Source: https://photo-craft.vercel.app/new
 */
import { SITE, VIEW } from '../lib/photo-craft.mjs';

export async function capture({ openPage }) {
  const page = await openPage(VIEW);
  await page.goto(`${SITE}/new`, { waitUntil: 'networkidle', timeout: 90_000 });
  await page.getByLabel('Project name').fill('Hello summer');
  await page.getByText('Instagram post').first().click();
  // Park the pointer on empty space so no card shows its hover state.
  await page.mouse.move(300, 700);
  await page.waitForTimeout(1_000);
  return { png: await page.screenshot() };
}
