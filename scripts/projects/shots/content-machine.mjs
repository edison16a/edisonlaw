/**
 * Content Machine: its dashboard with the player open on a finished short. The vertical video plays
 * beside its caption and its TikTok, Instagram and YouTube slots, over the week calendar.
 * Source: the player screenshot the landing page shows, https://contentmachine-install.vercel.app
 */
import { CARD_HEIGHT, CARD_WIDTH } from '../lib/encode.mjs';
import { dataUrl, shell } from '../lib/layouts/base.mjs';

const PLAYER = 'https://contentmachine-install.vercel.app/_next/static/immutable/media/player.0u9f06duk1e67.webp';
const SOURCE = { width: 2000, height: 1134 };
/** The player dialog's middle in the screenshot, so the 16:10 crop keeps it centred. */
const FOCUS_X = 1000;

export async function capture({ compose, download }) {
  const src = dataUrl(await download(PLAYER));
  // Fill the card's height and crop the sides evenly around the player.
  const k = CARD_HEIGHT / SOURCE.height;
  const left = CARD_WIDTH / 2 - FOCUS_X * k;
  const css = `.shot { position: absolute; top: 0; left: ${left}px; width: ${SOURCE.width * k}px; height: ${CARD_HEIGHT}px; }`;
  const html = shell({ background: '#000000', css, body: `<img class="shot" src="${src}">` });
  return { png: await compose(html), quality: 0.92 };
}
