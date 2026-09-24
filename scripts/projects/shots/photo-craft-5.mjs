/**
 * Photo Craft, gallery photo 5: a sticker on a transparent page, about to be exported as a
 * transparent PNG at a custom size. The tiger is the cutout the site ships with for its demo,
 * so this recipe does not wait for the model.
 * Source: https://photo-craft.vercel.app
 */
import { SITE, VIEW, editorTools } from '../lib/photo-craft.mjs';

/**
 * Where the page's left edge goes, in screen pixels from the workspace edge, at 47% zoom. The
 * centred Export dialog then only covers the tip of the tiger's tail.
 */
const PAGE_LEFT = 24;

export async function capture({ openPage, download }) {
  const cutout = await download(`${SITE}/demo/after.webp`);
  const page = await openPage(VIEW);
  const { createProject, setField, addShape, addText } = editorTools(page);

  await createProject('Stay wild sticker', 'Logo large');
  await page.getByRole('switch', { name: 'Transparent background' }).click();

  await page.getByRole('button', { name: 'Upload' }).click();
  await page.locator('input[type=file]').setInputFiles({ name: 'tiger.webp', mimeType: 'image/webp', buffer: cutout });
  // The new image comes in selected, with its own actions in the panel.
  await page.getByRole('button', { name: 'Remove background' }).first().waitFor({ timeout: 60_000 });
  await page.waitForTimeout(500);
  await setField('Width', 920);
  await setField('X', 40);
  await setField('Y', 330);
  await addText('Add a heading', 'STAY WILD', { font: 'Bebas Neue', size: 180, colour: '#1c1917', y: 120 });

  // The badge goes in last and behind the rest, and stays selected. Clearing a selection in
  // headless Chromium leaves its old handles painted on the canvas, so the shot keeps one.
  await addShape('Ellipse', '#facc15', { x: 50, y: 50, width: 900, height: 900 });
  await page.getByRole('button', { name: 'Send to back' }).first().click();

  // Zoom out twice (67% to 47%) and scroll the page to the left.
  await page.getByRole('button', { name: /^Zoom out/ }).click();
  await page.getByRole('button', { name: /^Zoom out/ }).click();
  await page.mouse.move(600, 440);
  // The editor draws with Konva, whose stage offset is where the page starts. Wheel steps
  // shrink with the device scale, so scroll until the page gets there.
  for (let step = 0; step < 12; step++) {
    const left = await page.evaluate(() => window.Konva.stages[0].x());
    if (Math.abs(left - PAGE_LEFT) < 1) break;
    await page.mouse.wheel(left - PAGE_LEFT, 0);
    await page.waitForTimeout(300);
  }

  await page.getByRole('button', { name: 'Export' }).first().click();
  const width = page.getByRole('dialog', { name: 'Export' }).locator('input[type=number]');
  await width.fill('2400');
  await width.blur();
  await page.waitForTimeout(1_000);
  return { png: await page.screenshot() };
}
