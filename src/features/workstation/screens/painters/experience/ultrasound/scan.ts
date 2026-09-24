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

const WIDTH = Math.ceil(SCAN_BOUNDS.w * SCALE);
const HEIGHT = Math.ceil(SCAN_BOUNDS.h * SCALE);

/**
 * Mean brightness and speckle cell for every pixel of the fan, or -1 outside it. The anatomy is
 * the same in every frame, so this is worked out once and only the speckle changes.
 */
function tissueMap() {
  const brightness = new Float32Array(WIDTH * HEIGHT).fill(-1);
  const cells = new Uint32Array(WIDTH * HEIGHT);
  const apexX = (SECTOR.apexX - SCAN_BOUNDS.x) * SCALE;
  for (let py = 0; py < HEIGHT; py++) {
    for (let px = 0; px < WIDTH; px++) {
      const dx = px - apexX;
      const radius = Math.hypot(dx, py) / SCALE;
      const angle = Math.atan2(dx, py);
      if (radius < SECTOR.near || radius > SECTOR.far || Math.abs(angle) > SECTOR.halfAngle) continue;
      const radial = (radius - SECTOR.near) / (SECTOR.far - SECTOR.near);
      const flatX = dx / SCALE / SECTOR.far;
      const flatD = (py / SCALE - SECTOR.near) / (SECTOR.far - SECTOR.near);
      const cellI = Math.min(THETA_CELLS - 1, Math.floor(((angle / SECTOR.halfAngle + 1) / 2) * THETA_CELLS));
      const cellJ = Math.min(DEPTH_CELLS - 1, Math.floor(radial * DEPTH_CELLS));
      const index = py * WIDTH + px;
      brightness[index] = echo(flatX, flatD, radial);
      cells[index] = cellJ * THETA_CELLS + cellI;
    }
  }
  return { brightness, cells };
}

function renderFrame(tissue: ReturnType<typeof tissueMap>, seed: number) {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const image = ctx.createImageData(WIDTH, HEIGHT);
  const speckle = speckleGrid(seed);
  const { brightness, cells } = tissue;
  for (let index = 0; index < brightness.length; index++) {
    const mean = brightness[index];
    if (mean < 0) continue;
    // Slightly warm grey, like a medical display.
    const level = Math.pow(Math.min(1, mean * speckle[cells[index]]), 0.9) * 255;
    const offset = index * 4;
    image.data[offset] = level;
    image.data[offset + 1] = level * 0.98;
    image.data[offset + 2] = level * 0.93;
    image.data[offset + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

export interface ScanFrames {
  /** Speckle variation `index`, rendered the first time it is asked for. */
  frame(index: number): HTMLCanvasElement;
  dispose(): void;
}

/** Speckle variations of the same anatomy, built lazily so the first paint stays quick. */
export function createScanFrames(count: number): ScanFrames {
  let tissue: ReturnType<typeof tissueMap> | null = null;
  const frames: HTMLCanvasElement[] = [];
  return {
    frame(index) {
      const slot = index % count;
      tissue ??= tissueMap();
      frames[slot] ??= renderFrame(tissue, 1000 + slot * 77);
      return frames[slot];
    },
    dispose() {
      frames.forEach((canvas) => {
        canvas.width = 0;
        canvas.height = 0;
      });
      frames.length = 0;
      tissue = null;
    },
  };
}
