/**
 * SafeEats: three of the App Store screenshots (label scanning, allergen choices and travel
 * cards) side by side on a blurred copy of their own gradient.
 * Source: https://apps.apple.com/us/app/safeeats-food-scanner/id6739729515
 */
import { blurredBackdrop, dataUrl, shell } from '../lib/layouts/base.mjs';
import { row } from '../lib/layouts/cards.mjs';

const STORE = 'https://is1-ssl.mzstatic.com/image/thumb';
const PANELS = [
  `${STORE}/PurpleSource221/v4/a7/1f/3e/a71f3e61-b188-5f9b-8edd-13758a00b92b/1_1242x2688.png/1242x2688bb.png`,
  `${STORE}/PurpleSource221/v4/42/8c/1e/428c1e39-3c7e-ef84-580a-cd8625d13387/3_1242x2688.png/1242x2688bb.png`,
  `${STORE}/PurpleSource221/v4/fd/18/61/fd186123-93d5-edd0-723b-a335a5d3cf0d/2_1242x2688.png/1242x2688bb.png`,
];

export async function capture({ download, compose }) {
  const images = await Promise.all(PANELS.map(async (url) => dataUrl(await download(url))));
  const body =
    blurredBackdrop(images[0], { dim: 0.12, fit: 'stretch', scale: 1.2 }) +
    row({ images, height: 880, aspect: 1242 / 2688, gap: 40, radius: 30 });
  return { png: await compose(shell({ background: '#1b1b1f', body })) };
}
