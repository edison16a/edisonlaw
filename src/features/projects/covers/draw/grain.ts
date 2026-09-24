import { seededRandom } from '@/lib/math';
import { createCanvas } from './canvas';

const TILE_SIZE = 256;
const TILE_SEED = 0x6a41;

/**
 * Tileable film grain as light and dark specks on transparency, so it can be laid
 * over anything with plain source-over blending (much cheaper than overlay).
 * `amount` is the strongest speck's opacity.
 */
export function createGrainTile(amount: number) {
  const canvas = createCanvas(TILE_SIZE, TILE_SIZE);
  const context = canvas.getContext('2d');
  if (!context) return canvas;
  const image = context.createImageData(TILE_SIZE, TILE_SIZE);
  const random = seededRandom(TILE_SEED);
  for (let i = 0; i < image.data.length; i += 4) {
    // Triangular distribution: most pixels barely change, a few become visible flecks.
    const value = random() + random() - 1;
    const tone = value > 0 ? 255 : 0;
    image.data[i] = tone;
    image.data[i + 1] = tone;
    image.data[i + 2] = tone;
    image.data[i + 3] = Math.abs(value) * amount * 255;
  }
  context.putImageData(image, 0, 0);
  return canvas;
}
