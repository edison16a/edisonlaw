/**
 * CallSense: the dispatcher dashboard. Live Call, with the key details and suggested follow up
 * questions, sits in front of Call Priority, which ranks incidents by urgency.
 * Screenshots from the Devpost gallery.
 * Source: https://devpost.com/software/callsense-jo4hg3
 */
import { GLOW, dataUrl, shell } from '../lib/layouts/base.mjs';
import { cascade } from '../lib/layouts/cards.mjs';

const GALLERY = 'https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/003/434';
const SHOTS = [`${GALLERY}/752/datas/original.png`, `${GALLERY}/789/datas/original.png`];

export async function capture({ download, compose }) {
  const images = await Promise.all(SHOTS.map(async (url) => dataUrl(await download(url))));
  // Trim the page scrollbar on the right and the Next.js dev badge in the bottom left corner.
  const body = cascade({ images, width: 1180, aspect: 1.93, radius: 16, trim: 'inset(0 1.2% 6% 0)' });
  // The navy of the CallSense header, lifting to a brighter blue.
  const background = `${GLOW}, linear-gradient(135deg, #172554 0%, #1e3a8a 45%, #2563eb 100%)`;
  return { png: await compose(shell({ background, body })) };
}
