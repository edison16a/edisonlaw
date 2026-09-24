/**
 * Renders a composed layout (see lib/layouts) to a PNG at twice the card size,
 * so edges, shadows and scaled screenshots come out smooth after encoding.
 */
import { openPage } from './browser.mjs';
import { CARD_HEIGHT, CARD_WIDTH } from './encode.mjs';

export async function renderHtml(browser, html) {
  const { context, page } = await openPage(browser, { width: CARD_WIDTH, height: CARD_HEIGHT, scale: 2 });
  try {
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    return await page.screenshot({ type: 'png' });
  } finally {
    await context.close();
  }
}
