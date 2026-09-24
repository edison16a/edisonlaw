/**
 * Photo Craft: a thumbnail being designed in the editor. The tiger is the demo photo the site
 * ships with, and its background is removed for real by the in-browser model.
 * Source: https://photo-craft.vercel.app
 */
const SITE = 'https://photo-craft.vercel.app';

/** Where the 1280 x 720 page sits on screen at the editor's default 76% zoom. */
const ZOOM = 0.759;
const ORIGIN = { x: 120, y: 167 };

export async function capture({ openPage, download }) {
  const photo = await download(`${SITE}/demo/before.jpg`);
  const page = await openPage({ width: 1440, height: 900, scale: 2, colorScheme: 'dark' });

  const clickOnPage = (x, y) => page.mouse.click(ORIGIN.x + x * ZOOM, ORIGIN.y + y * ZOOM);
  const setField = async (label, value) => {
    const input = page
      .locator('label.field')
      .filter({ has: page.locator('.field__label', { hasText: new RegExp(`^${label}$`) }) })
      .locator('input')
      .first();
    await input.fill(String(value));
    await input.press('Enter');
    await page.waitForTimeout(200);
  };
  const setColour = async (swatch, hex) => {
    await page.getByRole('button', { name: swatch }).first().click();
    await page.getByLabel('Hex colour').fill(hex);
    await page.getByLabel('Hex colour').press('Enter');
  };

  await page.goto(`${SITE}/new`, { waitUntil: 'networkidle', timeout: 90_000 });
  await page.getByLabel('Project name').fill('Into the wild');
  await page.getByText('YouTube thumbnail').first().click();
  await page.getByRole('button', { name: 'Create project' }).click();
  await page.waitForTimeout(2_500);
  await setColour(/^Background: /, '#0f766e');
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Upload' }).click();
  await page.locator('input[type=file]').setInputFiles({ name: 'tiger.jpg', mimeType: 'image/jpeg', buffer: photo });
  await page.waitForTimeout(2_000);
  // The first use downloads the segmentation model, then it runs on the CPU.
  await page.getByRole('button', { name: 'Remove background' }).first().click();
  await page.getByRole('button', { name: 'Restore background' }).first().waitFor({ timeout: 300_000 });
  await setField('Width', 1000);
  await setField('X', 270);
  await setField('Y', 52);

  await page.getByRole('button', { name: 'Text' }).first().click();
  await page.getByRole('button', { name: 'Add a heading' }).click();
  await page.waitForTimeout(800);
  await page.getByLabel('Text content').fill('Into the\nwild');
  await page.getByLabel('Text content').blur();
  await setField('Size', 140);
  await setField('Line height', 1.12);
  await setField('X', 70);
  await setField('Y', 72);
  await setColour(/^Colour: /, '#ffffff');
  // Clicking the heading closes the colour popover and keeps the heading selected.
  await clickOnPage(200, 130);
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: /^Font: / }).first().click();
  await page.getByPlaceholder(/search/i).first().fill('Anton');
  await page.waitForTimeout(800);
  await page.getByText('Anton', { exact: true }).first().click();
  await page.waitForTimeout(1_500);

  // End with the tiger selected, so its handles and the Restore background action show.
  await clickOnPage(880, 480);
  await page.waitForTimeout(1_200);
  return { png: await page.screenshot() };
}
