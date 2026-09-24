/**
 * AutoLab: the Neurotech@Berkeley research poster for the automated neuron culture system,
 * with its CAD models, pipette housing, imaging unit and printer based motion stage.
 * It is the only published image of the project so far, and it is 900 px wide.
 * Source: https://neurotech.studentorg.berkeley.edu/divisions/wetware.html
 */
import { GLOW, dataUrl, shell } from '../lib/layouts/base.mjs';
import { cascade } from '../lib/layouts/cards.mjs';

const POSTER = 'https://neurotech.studentorg.berkeley.edu/images/autolab.png';

export async function capture({ download, compose }) {
  const poster = dataUrl(await download(POSTER));
  const body = cascade({ images: [poster], width: 1150, aspect: 900 / 673, radius: 14 });
  // Deep teal into the blue of the poster header.
  const background = `${GLOW}, linear-gradient(135deg, #0b2a33 0%, #174b63 50%, #4571c4 100%)`;
  return { png: await compose(shell({ background, body })) };
}
