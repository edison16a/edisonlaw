/**
 * Backbond, gallery photo 2: Investigate, on an example gummy recipe. The ingredient graph shows what each
 * ingredient raises or lowers, beside the composition and legend, and the assistant on the
 * right reasons through cutting sucrose by 15% down to the mass balance, before and after.
 * Source: Edison's own screenshot of the app (private, see lib/private.mjs), 2000 x 1139.
 */
import { dataUrl } from '../lib/layouts/base.mjs';
import { appWindow } from '../lib/layouts/window.mjs';
import { readSource } from '../lib/private.mjs';
import { BACKDROP } from './backbond.mjs';

export async function capture({ compose }) {
  const src = dataUrl(await readSource('backbond-investigate.webp'));
  return { png: await compose(appWindow({ src, aspect: 2000 / 1139, background: BACKDROP })), quality: 0.92 };
}
