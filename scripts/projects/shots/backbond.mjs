/**
 * Backbond: Investigate, on an example gummy recipe. The ingredient graph shows what each
 * ingredient raises or lowers, beside the composition and legend, and the assistant on the
 * right reasons through cutting sucrose by 15% down to the mass balance, before and after.
 * Source: Edison's own screenshot of the app (private, see lib/private.mjs), 2000 x 1139.
 */
import { dataUrl } from '../lib/layouts/base.mjs';
import { appWindow } from '../lib/layouts/window.mjs';
import { readSource } from '../lib/private.mjs';

/** Backbond's own off white, warming toward the maroon of its buttons at the edges. */
export const BACKDROP = 'radial-gradient(120% 90% at 50% 0%, #f7f5f1 0%, #ece7e2 60%, #e4dcd8 100%)';

export async function capture({ compose }) {
  const src = dataUrl(await readSource('backbond-investigate.webp'));
  return { png: await compose(appWindow({ src, aspect: 2000 / 1139, background: BACKDROP })), quality: 0.92 };
}
