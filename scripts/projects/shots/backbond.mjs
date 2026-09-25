/**
 * Backbond: Design. The engine has designed 8 experiments from 341 candidates
 * for an ultra soft gummy, plotted in 3D on their principal components, and the right panel
 * shows the picked recipe: its promise score, why the engine chose it, its composition and its
 * predicted properties.
 * Source: Edison's own screenshot of the app (private, see lib/private.mjs), 2000 x 1139.
 */
import { dataUrl } from '../lib/layouts/base.mjs';
import { appWindow } from '../lib/layouts/window.mjs';
import { readSource } from '../lib/private.mjs';
import { BACKDROP } from './backbond.mjs';

export async function capture({ compose }) {
  const src = dataUrl(await readSource('backbond-design.webp'));
  return { png: await compose(appWindow({ src, aspect: 2000 / 1139, background: BACKDROP })), quality: 0.92 };
}
