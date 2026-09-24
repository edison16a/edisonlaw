/**
 * BetterBART: a planned trip from Oakland Airport to Powell St, with its transfer at Coliseum.
 * Source: https://betterbart.vercel.app
 */
const TRIP = [
  ['#ina', 'Oakland Airport'],
  ['#inb', 'Powell'],
];

export async function capture({ openPage }) {
  const page = await openPage({ width: 1440, height: 900, scale: 2 });
  await page.goto('https://betterbart.vercel.app', { waitUntil: 'networkidle', timeout: 90_000 });
  await page.waitForTimeout(2_000);

  for (const [field, station] of TRIP) {
    await page.click(field);
    await page.fill(field, station);
    await page.waitForTimeout(700);
    // Enter picks the best match from the station search.
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1_200);
  }

  await page.locator('#pbody').filter({ hasText: 'Powell' }).waitFor();
  await page.evaluate(() => document.activeElement?.blur());
  // Let the camera settle on the route and the trip panel finish animating.
  await page.waitForTimeout(3_000);
  return { png: await page.screenshot() };
}
