/**
 * Shared pieces for composed card photos: the page shell, backgrounds and shadows.
 * Every composition is plain HTML at the card size, rendered by Chromium.
 */
import { CARD_HEIGHT, CARD_WIDTH } from '../encode.mjs';

const SHADOW = '0 50px 90px -30px rgba(0, 0, 0, 0.55), 0 18px 36px -12px rgba(0, 0, 0, 0.35)';

/** Soft light from the top left, laid over gradients so they do not look flat. */
export const GLOW = 'radial-gradient(120% 90% at 12% 0%, rgba(255, 255, 255, 0.16), transparent 60%)';

/**
 * The least clear space between composed content and every edge of the card: 8% of its
 * height, so a window, row of phones or panel never touches or runs past the frame.
 */
export const MARGIN = Math.round(CARD_HEIGHT * 0.08);

/**
 * The largest box of `aspect` (width over height) that keeps `margin` clear on every side,
 * centred on the card. Returns { left, top, width, height } in card pixels.
 */
export function fit(aspect, margin = MARGIN) {
  const width = Math.min(CARD_WIDTH - 2 * margin, (CARD_HEIGHT - 2 * margin) * aspect);
  const height = width / aspect;
  return { left: (CARD_WIDTH - width) / 2, top: (CARD_HEIGHT - height) / 2, width, height };
}

/** Inlines image bytes as a data URL, sniffing the type from the file header. */
export function dataUrl(bytes) {
  const buffer = Buffer.from(bytes);
  const head = buffer.subarray(0, 4).toString('hex');
  const mime = head.startsWith('ffd8')
    ? 'image/jpeg'
    : head === '52494646'
      ? 'image/webp'
      : head === '47494638'
        ? 'image/gif'
        : 'image/png';
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

/** A full page at the card size. `background` is any CSS background value. */
export function shell({ background, body, css = '' }) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
html, body { margin: 0; width: ${CARD_WIDTH}px; height: ${CARD_HEIGHT}px; overflow: hidden; }
body { position: relative; background: ${background}; }
.layer { position: absolute; inset: 0; }
.shot { position: absolute; overflow: hidden; box-shadow: ${SHADOW}; }
.shot img { display: block; width: 100%; height: 100%; object-fit: cover; }
${css}
</style>
</head>
<body>${body}</body>
</html>`;
}

/**
 * A blurred, dimmed copy of an image that fills the frame, used behind phones and panels.
 * `fit: 'stretch'` squashes the whole image in, which keeps a tall image's colours at the edges.
 */
export function blurredBackdrop(src, { blur = 70, dim = 0.3, saturate = 1.15, scale = 1.6, fit = 'cover' } = {}) {
  const size = fit === 'stretch' ? '100% 100%' : 'cover';
  return `<div class="layer" style="background: url(${src}) center / ${size}; filter: blur(${blur}px) saturate(${saturate}); transform: scale(${scale});"></div>
<div class="layer" style="background: rgba(0, 0, 0, ${dim});"></div>`;
}
