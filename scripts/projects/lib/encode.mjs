/**
 * Turns a full resolution capture into the final card photo: 1600 x 1000 WebP.
 * Encoding happens in Chromium's canvas, so no image library is needed.
 */
import { openPage } from './browser.mjs';

export const CARD_WIDTH = 1600;
export const CARD_HEIGHT = 1000;

/** Files over this size are encoded again at a slightly lower quality. */
const MAX_BYTES = 250 * 1024;
const QUALITIES = [0.82, 0.78, 0.74, 0.7];

/**
 * Encodes `png` to WebP. `crop` is a source rectangle in pixels ({ x, y, width, height });
 * without it the image is cropped around its centre to 16:10.
 */
export async function encodeWebp(browser, png, crop) {
  const { context, page } = await openPage(browser, { width: 320, height: 200, scale: 1 });
  try {
    await page.setContent('<canvas></canvas>');
    const source = `data:image/png;base64,${png.toString('base64')}`;
    let bytes;
    let quality;
    for (quality of QUALITIES) {
      const dataUrl = await page.evaluate(drawAndEncode, {
        source,
        crop: crop ?? null,
        quality,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      });
      bytes = Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
      if (bytes.length <= MAX_BYTES) break;
    }
    return { bytes, quality };
  } finally {
    await context.close();
  }
}

/** Runs inside the page. */
async function drawAndEncode({ source, crop, quality, width, height }) {
  const image = new Image();
  image.src = source;
  await image.decode();

  let box = crop;
  if (!box) {
    const target = width / height;
    const w = Math.min(image.naturalWidth, image.naturalHeight * target);
    const h = w / target;
    box = { x: (image.naturalWidth - w) / 2, y: (image.naturalHeight - h) / 2, width: w, height: h };
  }

  const canvas = document.querySelector('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, box.x, box.y, box.width, box.height, 0, 0, width, height);
  return canvas.toDataURL('image/webp', quality);
}
