/**
 * Photo Craft, gallery photo 3: an Instagram post made from shapes and text, with the font
 * picker open on a search for script faces. Every font previews in its own face.
 * Source: https://photo-craft.vercel.app
 */
import { VIEW, editorTools } from '../lib/photo-craft.mjs';

/** The sea's sparkle under the setting sun: widths and tops of three flat ellipses. */
const SPARKLE = [
  [360, 770],
  [240, 820],
  [140, 866],
];

export async function capture({ openPage }) {
  const page = await openPage(VIEW);
  const { createProject, setColour, addShape, addText } = editorTools(page);

  await createProject('Hello summer', 'Instagram post');
  await setColour(/^Background: /, '#fed7aa');
  await page.keyboard.press('Escape');

  // Shapes stack in the order they are added: the sun sets behind the sea.
  await addShape('Ellipse', '#fb923c', { x: 260, y: 420, width: 560, height: 560 });
  await addShape('Rectangle', '#0e7490', { x: 0, y: 700, width: 1080, height: 380 });
  for (const [width, y] of SPARKLE) {
    await addShape('Ellipse', '#fdba74', { x: (1080 - width) / 2, y, width, height: 16 });
  }

  await addText('Add a subheading', 'SATURDAY 21 JUNE', {
    font: 'Montserrat',
    size: 44,
    colour: '#ffffff',
    y: 950,
    spacing: 6,
  });
  await addText('Add a heading', 'Hello\nsummer', {
    font: 'Kaushan Script',
    size: 190,
    colour: '#7c2d12',
    y: 70,
    lineHeight: 1,
  });

  // The heading stays selected. Open its font list from the panel, where it covers no artwork.
  await page.locator('.panel__body').evaluate((panel) => panel.scrollTo(0, 0));
  await page.getByRole('button', { name: /^Font: / }).last().click();
  await page.getByPlaceholder('Search fonts').fill('script');
  await page.mouse.move(1000, 800);
  await page.waitForTimeout(2_500);
  return { png: await page.screenshot() };
}
