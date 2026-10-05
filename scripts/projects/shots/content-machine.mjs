/**
 * Content Machine: the landing page's first screen. The install line for Claude Code sits over a
 * long YouTube video turning into a fan of short vertical clips, the way the tool works.
 * Source: https://contentmachine-install.vercel.app
 */
const SITE = 'https://contentmachine-install.vercel.app';

export async function capture({ openPage }) {
  // The page is 16:10 at this size, the shape of a card, so the first screen fills it exactly.
  const page = await openPage({ width: 1440, height: 900, scale: 2, colorScheme: 'dark' });
  await page.goto(SITE, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.getByText('Agentic content automation package').first().waitFor({ timeout: 60_000 });
  // Every thumbnail and the hero fonts in, and the clips settled after they fan out.
  await page.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map((image) => image.decode().catch(() => {}))]));
  await page.waitForTimeout(3_000);
  return { png: await page.screenshot(), quality: 0.92 };
}
