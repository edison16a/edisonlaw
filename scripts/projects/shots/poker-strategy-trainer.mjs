/**
 * Poker Strategy Trainer: a hand in Playthrough mode after a decision. The AI Coach grades it
 * with a score, the Elo change, the best action and why, beside the board, your hand and the
 * three opponents, whose cards turn over when the hand reaches showdown.
 * Source: https://poker-strats.vercel.app
 */
const SITE = 'https://poker-strats.vercel.app';

/**
 * The site's stylesheet asks for Inter first, then the system face, and does not load Inter
 * itself. Headless Linux has neither, so Inter is loaded for the shot.
 */
const INTER = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=block';

/**
 * The full width from the header down to the seats, in CSS pixels. The coach's verdict shows
 * and its long notes run on below, with the Fold, Call and Raise bar.
 */
const CROP = { x: 0, y: 22, width: 1440, height: 900 };
const SCALE = 2;

export async function capture({ openPage }) {
  const page = await openPage({ width: 1440, height: 900, scale: SCALE, colorScheme: 'dark' });
  await page.goto(SITE, { waitUntil: 'networkidle', timeout: 90_000 });
  await page.addStyleTag({ url: INTER });
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole('button', { name: 'Playthrough', exact: true }).click();
  await page.waitForTimeout(1_500);

  // Deal until calling earns a good grade after the flop, so the board has cards on it.
  for (let hand = 0; hand < 12; hand++) {
    await page.getByRole('button', { name: /^(Call|Check)/ }).first().click();
    await page.waitForTimeout(3_000);
    const text = await page.evaluate(() => document.body.innerText);
    if (/\b(GOOD|GREAT|EXCELLENT|PERFECT)\b/.test(text) && /\b(FLOP|TURN|RIVER)\b/.test(text)) break;
    await page.getByRole('button', { name: 'Next hand' }).click();
    await page.waitForTimeout(1_500);
  }
  await page.mouse.move(1430, 20);
  await page.waitForTimeout(500);
  const png = await page.screenshot({ fullPage: true });
  const crop = Object.fromEntries(Object.entries(CROP).map(([key, value]) => [key, value * SCALE]));
  return { png, crop };
}
