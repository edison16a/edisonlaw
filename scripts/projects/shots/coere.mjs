/**
 * Coere: the home page of coere.ai, with its dashboard tile beside the headline.
 * Source: the live site at https://www.coere.ai. The dashboard it draws holds made up chats.
 */
const SITE = 'https://www.coere.ai';

export async function capture({ openPage }) {
  const page = await openPage({ width: 1440, height: 900, scale: 2, colorScheme: 'dark' });
  await page.goto(SITE, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.locator('h1').first().waitFor({ state: 'attached', timeout: 60_000 });
  // The hero's background and tiles settle as they animate in.
  await page.waitForTimeout(6000);
  return { png: await page.screenshot(), quality: 0.92 };
}
