/**
 * Screenshot arrangements: overlapping windows stepping across the frame,
 * and a centred row of phones or store panels.
 */
import { CARD_HEIGHT, CARD_WIDTH } from '../encode.mjs';

function card({ src, left, top, width, height, radius, bezel = 0, trim }) {
  const frame = bezel ? `padding: ${bezel}px; background: #0b0b0d;` : '';
  const inner = [bezel && `border-radius: ${radius - bezel}px`, trim && `object-view-box: ${trim}`].filter(Boolean);
  return `<div class="shot" style="left: ${left}px; top: ${top}px; width: ${width}px; height: ${height}px; border-radius: ${radius}px; ${frame}"><img src="${src}" style="${inner.join('; ')}"></div>`;
}

/**
 * Screenshots from back to front, each one lower and further right than the last.
 * `aspect` is width over height of the cards. A single image is centred.
 * `trim` cuts stray edges off every image, as a CSS inset() such as 'inset(0 2% 5% 0)'.
 */
export function cascade({ images, width, aspect, radius = 18, margin = 64, trim }) {
  const height = Math.round(width / aspect);
  const steps = images.length - 1;
  const stepX = steps ? (CARD_WIDTH - 2 * margin - width) / steps : 0;
  const stepY = steps ? (CARD_HEIGHT - 2 * margin - height) / steps : 0;
  const left = steps ? margin : (CARD_WIDTH - width) / 2;
  const top = steps ? margin : (CARD_HEIGHT - height) / 2;

  return images
    .map((src, index) =>
      card({ src, left: left + index * stepX, top: top + index * stepY, width, height, radius, trim }),
    )
    .join('');
}

/**
 * Equal height items in a centred row. A `bezel` draws a thin dark device frame
 * around each one, which turns raw phone screenshots into phones.
 * `lift` raises or lowers individual items in pixels.
 */
export function row({ images, height, aspect, gap, radius, bezel = 0, lift = [] }) {
  const width = Math.round(height * aspect);
  const outer = width + 2 * bezel;
  const total = images.length * outer + (images.length - 1) * gap;
  const top = (CARD_HEIGHT - height - 2 * bezel) / 2;

  return images
    .map((src, index) =>
      card({
        src,
        left: (CARD_WIDTH - total) / 2 + index * (outer + gap),
        top: top - (lift[index] ?? 0),
        width,
        height,
        radius: radius + bezel,
        bezel,
      }),
    )
    .join('');
}
