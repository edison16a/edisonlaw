import { seededRandom } from '@/lib/math';
import { lineChart } from '../../../draw/charts';
import { drawGlyph } from '../../../draw/glyphs';
import { fillRect, fillRound, strokeRound, type Rect } from '../../../draw/shapes';
import { text } from '../../../draw/text';
import { trafficLights } from '../../../draw/window';
import { pill } from '../../../draw/widgets';
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

export function renderMicrograph(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = IMAGE_WIDTH;
  canvas.height = IMAGE_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
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

export function drawViewer(ctx: CanvasRenderingContext2D, rect: Rect, image: HTMLCanvasElement, cursor: [number, number]) {
  // Soft drop shadow so the window floats over the sheet.
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  fillRound(ctx, rect.x, rect.y, rect.w, rect.h, 12, T.viewer);
  ctx.restore();
  strokeRound(ctx, rect.x, rect.y, rect.w, rect.h, 12, '#3a3a40');
  trafficLights(ctx, rect.x + 20, rect.y + 18, 6, 20);
  text(ctx, 'img_0716_40x.tif', rect.x + rect.w / 2, rect.y + 19, { size: 13, weight: 600, family: 'sans', color: T.text, align: 'center' });

  const imageX = rect.x + (rect.w - IMAGE_WIDTH) / 2;
  const imageY = rect.y + 38;
  ctx.drawImage(image, imageX, imageY);
  // Scale bar.
  fillRect(ctx, imageX + IMAGE_WIDTH - 86, imageY + IMAGE_HEIGHT - 20, 64, 4, '#ffffff');
  text(ctx, '20 µm', imageX + IMAGE_WIDTH - 54, imageY + IMAGE_HEIGHT - 32, { size: 11.5, weight: 600, family: 'sans', color: '#ffffff', align: 'center' });
  text(ctx, '40x, NA 0.95', imageX + 10, imageY + 16, { size: 11.5, family: 'mono', color: '#d0d0d0' });

  // Pointer with a pixel readout.
  const [cx, cy] = [imageX + cursor[0], imageY + cursor[1]];
  drawGlyph(ctx, 'cross', cx, cy, 22, '#ffffff');
  const readout = `x ${Math.round(cursor[0] * 2.2)}  y ${Math.round(cursor[1] * 2.2)}  GFP ${Math.round(1800 + cursor[0] * 3)}`;
  fillRound(ctx, cx + 12, cy + 10, 186, 22, 5, 'rgba(0,0,0,0.75)');
  text(ctx, readout, cx + 20, cy + 22, { size: 11, family: 'mono', color: '#e8e8e8' });

  const infoY = imageY + IMAGE_HEIGHT + 20;
  let x = rect.x + 20;
  for (const [label, color] of [
    ['DAPI', '#5b8cff'],
    ['GFP', '#3fdc7c'],
    ['Merge', '#e4e4e7'],
  ]) {
    x += pill(ctx, label, x, infoY, { bg: '#1c1c20', color, size: 11.5, dot: color }) + 8;
  }
  text(ctx, 'Fixed HeLa, sample S11', rect.x + rect.w - 20, infoY, { size: 12, family: 'sans', color: T.muted, align: 'right' });

  const plot = { x: rect.x + 20, y: infoY + 22, w: rect.w - 40, h: rect.y + rect.h - infoY - 36 };
  fillRect(ctx, plot.x, plot.y + plot.h, plot.w, 1, '#3a3a40');
  lineChart(ctx, plot, HISTOGRAM, { min: 0, max: 1 }, { color: '#3fdc7c', width: 1.5, fill: 'rgba(63,220,124,0.25)' });
  text(ctx, 'intensity histogram', plot.x + plot.w, plot.y + 8, { size: 11, family: 'sans', color: T.faint, align: 'right' });
}
