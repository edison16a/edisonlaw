/**
 * Backbond: the live landing page hero with its animated field of lines.
 * Source: https://backbond.net
 */
const HEADLINE = 'Physics-Driven Simulation';
const ERROR = 'Something went wrong';

export async function capture({ openPage }) {
  // Rendered straight at the card size. At 2x, software WebGL is too slow for the intro to finish.
  const page = await openPage({ width: 1600, height: 1000, scale: 1 });

  // A dropped script chunk sends the site to its error page, so try a fresh load a few times.
  for (let attempt = 1; ; attempt++) {
    await page.goto('https://backbond.net', { waitUntil: 'networkidle', timeout: 90_000 });
    await page.waitForFunction(
      (texts) => texts.some((text) => document.body.innerText.includes(text)),
      [HEADLINE, ERROR],
      { timeout: 60_000 },
    );
    if (!(await page.getByText(ERROR).count())) break;
    if (attempt === 3) throw new Error('Backbond kept showing its error page');
  }

  // The lines ease in over several seconds, then the copy on the right fades up.
  await page.waitForTimeout(12_000);
  return { png: await page.screenshot() };
}
