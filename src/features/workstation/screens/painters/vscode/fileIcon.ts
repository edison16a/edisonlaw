import { text } from '../../draw/text';
import { FILE_COLORS } from './theme';

function atom(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(x, y, 7, 2.8, (i * Math.PI) / 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(x, y, 1.6, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function diamond(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.beginPath();
  ctx.moveTo(x, y - 5.5);
  ctx.lineTo(x + 5.5, y);
  ctx.lineTo(x, y + 5.5);
  ctx.lineTo(x - 5.5, y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function lines(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  for (let i = -1; i <= 1; i++) ctx.fillRect(x - 5, y + i * 3.5 - 0.75, 10, 1.5);
}

/** Seti style file icons: a React atom for TSX, short coloured letters or marks for the rest. */
export function drawFileIcon(ctx: CanvasRenderingContext2D, name: string, x: number, y: number) {
  const extension = name.includes('.') ? (name.split('.').pop() ?? '') : '';
  const color = FILE_COLORS[extension] ?? '#6d8086';
  if (extension === 'tsx') return atom(ctx, x, y, color);
  if (extension === 'frag') return diamond(ctx, x, y, color);
  const label = { ts: 'TS', json: '{}', mjs: 'JS' }[extension];
  if (!label) return lines(ctx, x, y, color);
  text(ctx, label, x, y + 1, { size: 10, weight: 700, family: 'sans', color, align: 'center' });
}
