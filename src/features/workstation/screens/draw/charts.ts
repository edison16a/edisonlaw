import type { Rect } from './shapes';

/** Minimal chart marks. Values map into a rect with `min` at the bottom and `max` at the top. */

export interface Scale {
  min: number;
  max: number;
}

export const scaleOf = (values: number[], padding = 0.08): Scale => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min || 1) * padding;
  return { min: min - pad, max: max + pad };
};

export const yOf = (rect: Rect, scale: Scale, value: number) =>
  rect.y + rect.h - ((value - scale.min) / (scale.max - scale.min || 1)) * rect.h;

export const xOf = (rect: Rect, index: number, count: number) => rect.x + (count <= 1 ? 0 : (index / (count - 1)) * rect.w);

function tracePath(ctx: CanvasRenderingContext2D, rect: Rect, values: number[], scale: Scale) {
  values.forEach((value, index) => {
    const x = xOf(rect, index, values.length);
    const y = yOf(rect, scale, value);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
}

interface LineOptions {
  color: string;
  width?: number;
  /** Colour at the top of a gradient fill under the line. Omit for no fill. */
  fill?: string;
  dash?: number[];
}

export function lineChart(ctx: CanvasRenderingContext2D, rect: Rect, values: number[], scale: Scale, options: LineOptions) {
  if (options.fill) {
    const gradient = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
    gradient.addColorStop(0, options.fill);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    tracePath(ctx, rect, values, scale);
    ctx.lineTo(rect.x + rect.w, rect.y + rect.h);
    ctx.lineTo(rect.x, rect.y + rect.h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }
  ctx.beginPath();
  tracePath(ctx, rect, values, scale);
  ctx.strokeStyle = options.color;
  ctx.lineWidth = options.width ?? 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.setLineDash(options.dash ?? []);
  ctx.stroke();
  ctx.setLineDash([]);
}

interface BarOptions {
  color: string | ((index: number) => string);
  gap?: number;
  radius?: number;
}

export function barChart(ctx: CanvasRenderingContext2D, rect: Rect, values: number[], max: number, options: BarOptions) {
  const slot = rect.w / values.length;
  const gap = options.gap ?? slot * 0.3;
  values.forEach((value, index) => {
    const height = Math.max(1, (value / max) * rect.h);
    ctx.beginPath();
    ctx.roundRect(rect.x + index * slot + gap / 2, rect.y + rect.h - height, slot - gap, height, [options.radius ?? 2, options.radius ?? 2, 0, 0]);
    ctx.fillStyle = typeof options.color === 'function' ? options.color(index) : options.color;
    ctx.fill();
  });
}

/** Bars built from stacked segments, bottom segment first. */
export function stackedBars(ctx: CanvasRenderingContext2D, rect: Rect, stacks: number[][], max: number, colors: string[], gap = 0.3) {
  const slot = rect.w / stacks.length;
  stacks.forEach((stack, index) => {
    let base = rect.y + rect.h;
    stack.forEach((value, layer) => {
      const height = (value / max) * rect.h;
      ctx.fillStyle = colors[layer % colors.length];
      ctx.fillRect(rect.x + index * slot + (slot * gap) / 2, base - height, slot * (1 - gap), height);
      base -= height;
    });
  });
}

/** Evenly spaced horizontal grid lines, top and bottom included. */
export function gridLines(ctx: CanvasRenderingContext2D, rect: Rect, count: number, color: string, dash: number[] = []) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash(dash);
  for (let i = 0; i <= count; i++) {
    const y = Math.round(rect.y + (i / count) * rect.h) + 0.5;
    ctx.beginPath();
    ctx.moveTo(rect.x, y);
    ctx.lineTo(rect.x + rect.w, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

/** Ring gauge filled clockwise from the top. */
export function ringGauge(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, width: number, fraction: number, color: string, track: string) {
  ctx.lineCap = 'round';
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = track;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + fraction * Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.lineCap = 'butt';
}
