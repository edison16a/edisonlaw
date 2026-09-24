/**
 * Photo Craft, gallery photo 4: the Background Remover after one click. The slider splits the
 * demo photo the site ships with from its cutout, made for real by the in-browser model, next
 * to the touch up brushes and the PNG or WebP download at any size.
 * Source: https://photo-craft.vercel.app/remove-bg
 */
import { SITE, VIEW } from '../lib/photo-craft.mjs';

/** Where the slider rests, as a share of the photo's width: just left of the tiger's face. */
const SPLIT = 0.25;

export async function capture({ openPage, download }) {
  const photo = await download(`${SITE}/demo/before.jpg`);
  const page = await openPage(VIEW);

  await page.goto(`${SITE}/remove-bg`, { waitUntil: 'networkidle', timeout: 90_000 });
  await page.locator('input[type=file]').setInputFiles({ name: 'tiger.jpg', mimeType: 'image/jpeg', buffer: photo });
  // The first use downloads the segmentation model, then it runs on the CPU.
  await page.getByRole('button', { name: 'tiger, done' }).waitFor({ timeout: 300_000 });
  await page.waitForTimeout(1_500);

  // Drag the handle from the left edge, where a finished photo starts, to the split.
  const compare = await page.locator('.compare').first().boundingBox();
  const handle = await page.locator('.compare__handle').first().boundingBox();
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(compare.x + compare.width * SPLIT, handle.y + handle.height / 2, { steps: 12 });
  await page.mouse.up();
  await page.mouse.move(700, 820);
  await page.waitForTimeout(1_000);
  return { png: await page.screenshot() };
}
