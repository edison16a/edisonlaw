import { circle } from '../../../draw/shapes';
import { text } from '../../../draw/text';
import { pill } from '../../../draw/widgets';
import { CAROTID, NODULE, SECTOR, type Ellipse } from './anatomy';
import { ULTRASOUND_THEME as T } from './theme';

/** Everything drawn over the scan: SAM masks and prompts, depth scale and probe settings. */

const DEPTH_CM = 4.5;

/** Screen position of a point given in the flat anatomy coordinates. */
export function toScreen(x: number, d: number): [number, number] {
  return [SECTOR.apexX + x * SECTOR.far, SECTOR.apexY + SECTOR.near + d * (SECTOR.far - SECTOR.near)];
}

/** Mask outline: the ellipse with a slightly irregular edge, like a real segmentation. */
function traceMask(ctx: CanvasRenderingContext2D, e: Ellipse, wobble: number) {
  ctx.beginPath();
  for (let i = 0; i <= 72; i++) {
    const t = (i / 72) * Math.PI * 2;
    const r = 1.02 + 0.045 * Math.sin(3 * t + wobble) + 0.03 * Math.cos(5 * t);
    const [x, y] = toScreen(e.x + e.rx * r * Math.cos(t), e.d + e.rd * r * Math.sin(t));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function mask(ctx: CanvasRenderingContext2D, e: Ellipse, color: string, fill: string, label: string, pulse: number) {
  traceMask(ctx, e, 0.4);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 + pulse;
  ctx.stroke();
  const [x, y] = toScreen(e.x + e.rx * 0.75, e.d - e.rd * 1.1);
  pill(ctx, label, x, y - 12, { bg: 'rgba(6,8,11,0.8)', color, size: 11, dot: color });
}

function point(ctx: CanvasRenderingContext2D, x: number, d: number, color: string) {
  const [px, py] = toScreen(x, d);
  circle(ctx, px, py, 7, '#ffffff');
  circle(ctx, px, py, 5, color);
}

export function drawMasks(ctx: CanvasRenderingContext2D, pulse: number) {
  mask(ctx, CAROTID, T.magenta, 'rgba(244,114,182,0.22)', 'Carotid 0.94', 0);
  mask(ctx, NODULE, T.cyan, 'rgba(34,211,238,0.22)', 'Nodule 0.97', pulse);

  // Box prompt around the nodule, dashed like the SAM demo tools.
  const [left, top] = toScreen(NODULE.x - NODULE.rx * 1.25, NODULE.d - NODULE.rd * 1.3);
  const [right, bottom] = toScreen(NODULE.x + NODULE.rx * 1.25, NODULE.d + NODULE.rd * 1.3);
  ctx.setLineDash([6, 5]);
  ctx.strokeStyle = 'rgba(34,211,238,0.7)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(left, top, right - left, bottom - top);
  ctx.setLineDash([]);

  point(ctx, NODULE.x + 0.02, NODULE.d - 0.02, T.green);
  point(ctx, NODULE.x - 0.04, NODULE.d + 0.05, T.green);
  point(ctx, NODULE.x + 0.22, NODULE.d + 0.1, T.red);
}

export function drawScanAnnotations(ctx: CanvasRenderingContext2D, frameNumber: number) {
  const style = { size: 13, family: 'mono', color: '#b8c2cf' } as const;
  ['L12-5  12.0 MHz', 'Gn 58   DR 60', 'D 4.5 cm', 'FR 32 Hz'].forEach((line, index) => text(ctx, line, 28, 84 + index * 20, style));
  ['Thyroid R, trans', 'MI 0.8   TIs 0.3', `Frame ${frameNumber}`].forEach((line, index) =>
    text(ctx, line, 744, 84 + index * 20, { ...style, align: 'right' }),
  );

  // Depth scale down the right side, one tick per centimetre.
  const x = 772;
  const top = SECTOR.apexY + SECTOR.near;
  const span = SECTOR.far - SECTOR.near;
  ctx.fillStyle = '#6b7686';
  for (let cm = 0; cm <= DEPTH_CM; cm += 0.5) {
    const y = Math.round(top + (cm / DEPTH_CM) * span);
    const major = cm % 1 === 0;
    ctx.fillRect(x - (major ? 10 : 5), y, major ? 10 : 5, 1.5);
    if (major && cm > 0) text(ctx, String(cm), x + 6, y + 1, { size: 12, family: 'mono', color: '#8b97a8' });
  }
  // Focus marker at the nodule depth.
  const focusY = top + NODULE.d * span;
  ctx.beginPath();
  ctx.moveTo(x - 14, focusY);
  ctx.lineTo(x - 22, focusY - 5);
  ctx.lineTo(x - 22, focusY + 5);
  ctx.closePath();
  ctx.fillStyle = T.amber;
  ctx.fill();
}
