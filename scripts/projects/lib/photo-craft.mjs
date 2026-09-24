/**
 * Steps shared by the Photo Craft recipes (shots/photo-craft*.mjs), which drive the live editor.
 * Positions and sizes are in design pixels, the numbers the editor's properties panel shows.
 * Source: https://photo-craft.vercel.app
 */
export const SITE = 'https://photo-craft.vercel.app';

/** Every Photo Craft photo is taken like this, so the gallery reads as one set. */
export const VIEW = { width: 1440, height: 900, scale: 2, colorScheme: 'dark' };

/** Editor actions on `page`. */
export function editorTools(page) {
  /** Starts a project from one of the size templates on the new project page. */
  const createProject = async (name, template) => {
    await page.goto(`${SITE}/new`, { waitUntil: 'networkidle', timeout: 90_000 });
    await page.getByLabel('Project name').fill(name);
    await page.getByText(template).first().click();
    await page.getByRole('button', { name: 'Create project' }).click();
    await page.waitForTimeout(2_500);
  };

  /** Types into a field of the properties panel, found by its label. */
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

  /** Opens a colour swatch and types a hex value. The popover stays open. */
  const setColour = async (swatch, hex) => {
    await page.getByRole('button', { name: swatch }).first().click();
    await page.getByLabel('Hex colour').fill(hex);
    await page.getByLabel('Hex colour').press('Enter');
  };

  /** Picks a font for the selected text. Google Fonts load when picked, so it waits a little. */
  const pickFont = async (name) => {
    await page.getByRole('button', { name: /^Font: / }).first().click();
    await page.getByPlaceholder('Search fonts').fill(name);
    await page.waitForTimeout(800);
    await page.getByText(name, { exact: true }).first().click();
    await page.waitForTimeout(1_500);
  };

  /** Adds a shape from the Shapes tool, then colours, sizes and places it. */
  const addShape = async (shape, fill, { x, y, width, height }) => {
    await page.getByRole('button', { name: 'Shapes' }).first().click();
    await page.getByRole('button', { name: shape, exact: true }).click();
    await page.waitForTimeout(400);
    await setColour(/^Fill: /, fill);
    await page.keyboard.press('Escape');
    await setField('Width', width);
    await setField('Height', height);
    await setField('X', x);
    await setField('Y', y);
  };

  /**
   * Adds text from the Text tool and centres it on the page at `y`.
   * `kind` is the button that adds it, like 'Add a heading'.
   */
  const addText = async (kind, text, { font, size, colour, y, lineHeight, spacing }) => {
    await page.getByRole('button', { name: 'Text' }).first().click();
    await page.getByRole('button', { name: kind }).click();
    await page.waitForTimeout(600);
    await page.getByLabel('Text content').fill(text);
    await page.getByLabel('Text content').blur();
    await pickFont(font);
    await setField('Size', size);
    if (lineHeight) await setField('Line height', lineHeight);
    if (spacing) await setField('Letter spacing', spacing);
    await setColour(/^Colour: /, colour);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Align center' }).first().click();
    await setField('Y', y);
    // "Align centre" lines the text box up with the page. "Align center" above centres its lines.
    await page.getByRole('button', { name: 'Align centre' }).first().click();
    await page.waitForTimeout(300);
  };

  return { createProject, setField, setColour, pickFont, addShape, addText };
}
