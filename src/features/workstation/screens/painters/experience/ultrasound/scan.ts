import { seededRandom } from '@/lib/math';
import { echo, SECTOR } from './anatomy';

/**
 * Renders the greyscale fan into offscreen canvases, one per speckle pattern. Speckle is drawn
 * on a polar grid and stretched along the arc, the way real scans smear it sideways.
 */

/** The fan is computed at half resolution and scaled up, which softens it like a real probe. */
const SCALE = 0.5;
const THETA_CELLS = 220;
const DEPTH_CELLS = 300;

export const SCAN_BOUNDS = {
  x: SECTOR.apexX - Math.sin(SECTOR.halfAngle) * SECTOR.far,
  y: SECTOR.apexY,
  w: Math.sin(SECTOR.halfAngle) * SECTOR.far * 2,
  h: SECTOR.far,
};

function speckleGrid(seed: number) {
  const random = seededRandom(seed);
  const grid = new Float32Array(THETA_CELLS * DEPTH_CELLS);
  for (let i = 0; i < grid.length; i++) {
    // Rayleigh distributed, like the envelope of scattered ultrasound.
    grid[i] = Math.sqrt(-2 * Math.log(1 - random() * 0.999)) * 0.62;
  }
  // Smear sideways along the arc.
  const smeared = new Float32Array(grid.length);
  for (let j = 0; j < DEPTH_CELLS; j++) {
    for (let i = 0; i < THETA_CELLS; i++) {
      const left = grid[j * THETA_CELLS + Math.max(0, i - 1)];
      const right = grid[j * THETA_CELLS + Math.min(THETA_CELLS - 1, i + 1)];
      smeared[j * THETA_CELLS + i] = (left + grid[j * THETA_CELLS + i] * 2 + right) / 4;
    }
  }
  return smeared;
}

function renderFrame(seed: number) {
  const width = Math.ceil(SCAN_BOUNDS.w * SCALE);
  const height = Math.ceil(SCAN_BOUNDS.h * SCALE);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const image = ctx.createImageData(width, height);
  const speckle = speckleGrid(seed);
  const apexX = (SECTOR.apexX - SCAN_BOUNDS.x) * SCALE;

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const dx = px - apexX;
      const dy = py;
      const radius = Math.hypot(dx, dy) / SCALE;
      const angle = Math.atan2(dx, dy);
      if (radius < SECTOR.near || radius > SECTOR.far || Math.abs(angle) > SECTOR.halfAngle) continue;
      const radial = (radius - SECTOR.near) / (SECTOR.far - SECTOR.near);
      const lateral = angle / SECTOR.halfAngle;
      const flatX = dx / SCALE / SECTOR.far;
      const flatD = (dy / SCALE - SECTOR.near) / (SECTOR.far - SECTOR.near);
      const cellI = Math.min(THETA_CELLS - 1, Math.floor(((lateral + 1) / 2) * THETA_CELLS));
      const cellJ = Math.min(DEPTH_CELLS - 1, Math.floor(radial * DEPTH_CELLS));
      const value = Math.min(1, echo(flatX, flatD, radial) * speckle[cellJ * THETA_CELLS + cellI]);
      // Slightly warm grey, like a medical display.
      const index = (py * width + px) * 4;
      const level = Math.pow(value, 0.9) * 255;
      image.data[index] = level;
      image.data[index + 1] = level * 0.98;
      image.data[index + 2] = level * 0.93;
      image.data[index + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

/** Renders `count` speckle variations of the same anatomy. */
export function renderScanFrames(count: number): HTMLCanvasElement[] {
  return Array.from({ length: count }, (_, index) => renderFrame(1000 + index * 77));
}
