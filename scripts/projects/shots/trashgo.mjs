/**
 * TrashGo: three phone captures from the Devpost gallery. The title screen, the AR view with a
 * virtual trash can placed in a real classroom, and the game world with its trash counter.
 * Source: https://devpost.com/software/trashgo-j34nxr
 */
import { blurredBackdrop, dataUrl, shell } from '../lib/layouts/base.mjs';
import { row } from '../lib/layouts/cards.mjs';

const GALLERY = 'https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/002/369';
const SCREENS = [
  `${GALLERY}/752/datas/original.png`,
  `${GALLERY}/754/datas/original.jpg`,
  `${GALLERY}/753/datas/original.png`,
];

export async function capture({ download, compose }) {
  const images = await Promise.all(SCREENS.map(async (url) => dataUrl(await download(url))));
  const body =
    blurredBackdrop(images[2], { dim: 0.3 }) +
    row({ images, height: 836, aspect: 1170 / 2532, gap: 56, radius: 40, bezel: 12 });
  return { png: await compose(shell({ background: '#14301c', body })) };
}
