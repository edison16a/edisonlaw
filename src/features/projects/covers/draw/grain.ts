import { seededRandom } from '@/lib/math';
import { createCanvas } from './canvas';

const TILE_SIZE = 256;
const TILE_SEED = 0x6a41;

let tile: HTMLCanvasElement | null = null;

/** Mid grey noise tile, built once and shared by every cover. */
function noiseTile() {
  if (tile) return tile;
  const canvas = createCanvas(TILE_SIZE, TILE_SIZE);
  const context = canvas.getContext('2d');
  if (!context) return null;
  const image = context.createImageData(TILE_SIZE, TILE_SIZE);
  const random = seededRandom(TILE_SEED);
  for (let i = 0; i < image.data.length; i += 4) {
    // Triangular distribution keeps most pixels near grey with the odd bright or dark fleck.
    const value = 128 + (random() + random() - 1) * 127;
    image.data[i] = value;
    image.data[i + 1] = value;
    image.data[i + 2] = value;
    image.data[i + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  tile = canvas;
  return tile;
}

/** Overlays fine film grain. `amount` around 0.1 reads as print texture without looking dirty. */
export function applyGrain(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  const source = noiseTile();
  const pattern = source && ctx.createPattern(source, 'repeat');
  if (!pattern) return;
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = amount;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
