import { seededRandom } from '@/lib/math';
import { lineChart } from '../../../draw/charts';
import { drawGlyph } from '../../../draw/glyphs';
import { fillRect, fillRound, strokeRound, type Rect } from '../../../draw/shapes';
import { measure, text } from '../../../draw/text';
import { trafficLights } from '../../../draw/window';
import { pill } from '../../../draw/widgets';
import { pixelScale } from '../../../resolution';
import { LAB_SHEET_THEME as T } from './theme';

/**
 * A fluorescence micrograph of fixed HeLa cells: blue DAPI nuclei inside green GFP cell bodies,
 * rendered once with additive blending so overlaps glow the way stacked channels do.
 */

const IMAGE_WIDTH = 468;
const IMAGE_HEIGHT = 330;

function blob(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, angle: number, color: string, alpha: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(1, ry / rx);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  gradient.addColorStop(0, `rgba(${color},${alpha})`);
  gradient.addColorStop(0.6, `rgba(${color},${alpha * 0.55})`);
  gradient.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Renders the micrograph at `resolution` pixels per unit. The viewer shows it at about one screen
 * unit per image unit, so the screen's pixel scale keeps it sharp.
 */
export function renderMicrograph(resolution: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(IMAGE_WIDTH * resolution);
  canvas.height = Math.round(IMAGE_HEIGHT * resolution);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.scale(resolution, resolution);
  const random = seededRandom(716);
  ctx.fillStyle = '#020303';
  ctx.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
  const cells = Array.from({ length: 46 }, () => ({
    x: random() * IMAGE_WIDTH,
    y: random() * IMAGE_HEIGHT,
    size: 20 + random() * 16,
    angle: random() * Math.PI,
    stretch: 1.2 + random() * 0.8,
  }));
  ctx.globalCompositeOperation = 'lighter';
  for (const cell of cells) {
    // Elongated cytoplasm from a few overlapping lobes along the cell's axis.
    for (let lobe = -1; lobe <= 1; lobe++) {
      const along = lobe * cell.size * 0.55;
      const x = cell.x + Math.cos(cell.angle) * along + (random() - 0.5) * 6;
      const y = cell.y + Math.sin(cell.angle) * along + (random() - 0.5) * 6;
      blob(ctx, x, y, cell.size * cell.stretch * 0.7, cell.size * 0.55, cell.angle, '46,200,96', 0.26);
    }
  }
  // GFP stays out of the nucleus, which leaves a dark ring round each one.
  ctx.globalCompositeOperation = 'destination-out';
  for (const cell of cells) blob(ctx, cell.x, cell.y, cell.size * 0.42, cell.size * 0.36, cell.angle, '0,0,0', 0.9);
  ctx.globalCompositeOperation = 'lighter';
  for (const cell of cells) {
    blob(ctx, cell.x, cell.y, cell.size * 0.34, cell.size * 0.28, cell.angle, '50,90,255', 1);
    blob(ctx, cell.x + 2, cell.y - 1, cell.size * 0.16, cell.size * 0.13, cell.angle, '140,170,255', 0.45);
  }
  // Sensor noise.
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = `rgba(160,200,170,${random() * 0.06})`;
    ctx.fillRect(random() * IMAGE_WIDTH, random() * IMAGE_HEIGHT, 1, 1);
  }
  return canvas;
}

const HISTOGRAM = Array.from({ length: 48 }, (_, i) => Math.exp(-((i - 9) ** 2) / 30) * 0.9 + Math.exp(-((i - 30) ** 2) / 60) * 0.35 + 0.02);

/** The viewer window floating over the sheet: the micrograph with a pixel readout, channels and a histogram. */
export function drawViewer(ctx: CanvasRenderingContext2D, rect: Rect, image: HTMLCanvasElement, cursor: [number, number]) {
  // Soft drop shadow so the window floats over the sheet. Shadows ignore the transform.
  const scale = pixelScale(ctx);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 20 * scale;
  ctx.shadowOffsetY = 6 * scale;
  fillRound(ctx, rect.x, rect.y, rect.w, rect.h, 10, T.viewer);
  ctx.restore();
  strokeRound(ctx, rect.x, rect.y, rect.w, rect.h, 10, '#3a3a40');
  trafficLights(ctx, rect.x + 16, rect.y + 14, 5, 16);
  text(ctx, 'img_0716_40x.tif', rect.x + rect.w / 2, rect.y + 15, { size: 11.5, weight: 600, family: 'sans', color: T.text, align: 'center' });

  // The micrograph is rendered once and scaled into the window.
  const imageW = rect.w - 20;
  const fit = imageW / IMAGE_WIDTH;
  const imageH = IMAGE_HEIGHT * fit;
  const imageX = rect.x + 10;
  const imageY = rect.y + 28;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, imageX, imageY, imageW, imageH);
  // Scale bar.
  fillRect(ctx, imageX + imageW - 58, imageY + imageH - 14, 44, 3, '#ffffff');
  text(ctx, '20 µm', imageX + imageW - 36, imageY + imageH - 24, { size: 10, weight: 600, family: 'sans', color: '#ffffff', align: 'center' });
  text(ctx, '40x, NA 0.95', imageX + 8, imageY + 12, { size: 10, family: 'mono', color: '#d0d0d0' });

  // Pointer with a pixel readout, which flips to the pointer's left near the image edge.
  const [cx, cy] = [imageX + cursor[0] * fit, imageY + cursor[1] * fit];
  drawGlyph(ctx, 'cross', cx, cy, 16, '#ffffff');
  const readout = `x ${Math.round(cursor[0] * 2.2)}  y ${Math.round(cursor[1] * 2.2)}  GFP ${Math.round(1800 + cursor[0] * 3)}`;
  const style = { size: 9.5, family: 'mono', color: '#e8e8e8' } as const;
  const boxW = measure(ctx, readout, style) + 12;
  const boxX = cx + 10 + boxW <= imageX + imageW ? cx + 10 : cx - 10 - boxW;
  fillRound(ctx, boxX, cy + 8, boxW, 17, 4, 'rgba(0,0,0,0.75)');
  text(ctx, readout, boxX + 6, cy + 17, style);

  const infoY = imageY + imageH + 15;
  let x = rect.x + 12;
  for (const [label, color] of [
    ['DAPI', '#5b8cff'],
    ['GFP', '#3fdc7c'],
    ['Merge', '#e4e4e7'],
  ]) {
    x += pill(ctx, label, x, infoY, { bg: '#1c1c20', color, size: 10, dot: color }) + 6;
  }
  text(ctx, 'Fixed HeLa, S11', rect.x + rect.w - 12, infoY, { size: 10.5, family: 'sans', color: T.muted, align: 'right' });

  const plot = { x: rect.x + 12, y: infoY + 14, w: rect.w - 24, h: rect.y + rect.h - infoY - 24 };
  fillRect(ctx, plot.x, plot.y + plot.h, plot.w, 1, '#3a3a40');
  lineChart(ctx, plot, HISTOGRAM, { min: 0, max: 1 }, { color: '#3fdc7c', width: 1.5, fill: 'rgba(63,220,124,0.25)' });
}
