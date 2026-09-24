import { seededRandom } from '@/lib/math';
import type { Scale } from '../../../draw/charts';
import { circle, fillRect, type Rect } from '../../../draw/shapes';
import { text } from '../../../draw/text';
import { GELS, stressAt, ZONES } from './data';
import { LAB_THEME as T } from './theme';

/** The notebook figure: stress strain curves, a plate photo and zone diameters, matplotlib style. */

const LABEL = { size: 9.5, family: 'sans', color: T.axis } as const;

const px = (rect: Rect, scale: Scale, value: number) => rect.x + ((value - scale.min) / (scale.max - scale.min)) * rect.w;
const py = (rect: Rect, scale: Scale, value: number) => rect.y + rect.h - ((value - scale.min) / (scale.max - scale.min)) * rect.h;

interface AxesOptions {
  x: Scale;
  y: Scale;
  xTicks: number[];
  yTicks: number[];
  xLabel: string;
  yLabel: string;
  title: string;
}

function axes(ctx: CanvasRenderingContext2D, rect: Rect, options: AxesOptions) {
  ctx.strokeStyle = T.axis;
  ctx.lineWidth = 1;
  ctx.strokeRect(Math.round(rect.x) + 0.5, Math.round(rect.y) + 0.5, Math.round(rect.w), Math.round(rect.h));
  options.xTicks.forEach((tick) => {
    const x = Math.round(px(rect, options.x, tick)) + 0.5;
    fillRect(ctx, x - 0.5, rect.y + rect.h, 1, 3, T.axis);
    text(ctx, String(tick), x, rect.y + rect.h + 10, { ...LABEL, align: 'center' });
  });
  options.yTicks.forEach((tick) => {
    const y = Math.round(py(rect, options.y, tick)) + 0.5;
    fillRect(ctx, rect.x - 3, y - 0.5, 3, 1, T.axis);
    text(ctx, String(tick), rect.x - 6, y, { ...LABEL, align: 'right' });
  });
  text(ctx, options.xLabel, rect.x + rect.w / 2, rect.y + rect.h + 24, { ...LABEL, size: 10, align: 'center' });
  ctx.save();
  ctx.translate(rect.x - 28, rect.y + rect.h / 2);
  ctx.rotate(-Math.PI / 2);
  text(ctx, options.yLabel, 0, 0, { ...LABEL, size: 10, align: 'center' });
  ctx.restore();
  text(ctx, options.title, rect.x + rect.w / 2, rect.y - 10, { ...LABEL, size: 11, align: 'center' });
}

function legend(ctx: CanvasRenderingContext2D, x: number, y: number, labels: string[], colors: string[], swatch: 'line' | 'box') {
  const height = labels.length * 12 + 6;
  const width = 86;
  ctx.fillStyle = 'rgba(17,17,17,0.85)';
  ctx.strokeStyle = '#555555';
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 3);
  ctx.fill();
  ctx.stroke();
  labels.forEach((label, index) => {
    const rowY = y + 9 + index * 12;
    if (swatch === 'line') fillRect(ctx, x + 6, rowY - 1, 13, 2, colors[index]);
    else fillRect(ctx, x + 7, rowY - 4, 9, 8, colors[index]);
    text(ctx, label, x + 24, rowY + 1, { ...LABEL, size: 8.5 });
  });
}

export function stressStrain(ctx: CanvasRenderingContext2D, rect: Rect) {
  const x = { min: 0, max: 500 };
  const y = { min: 0, max: 60 };
  axes(ctx, rect, { x, y, xTicks: [0, 100, 200, 300, 400, 500], yTicks: [0, 20, 40, 60], xLabel: 'Strain (%)', yLabel: 'Stress (kPa)', title: 'Tensile tests' });
  GELS.forEach((gel, index) => {
    const color = T.series[index];
    ctx.beginPath();
    for (let strain = 0; strain <= gel.failure; strain += 5) {
      const sx = px(rect, x, strain);
      const sy = py(rect, y, stressAt(gel, strain));
      if (strain === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Failure point.
    const fx = px(rect, x, gel.failure);
    const fy = py(rect, y, stressAt(gel, gel.failure));
    ctx.beginPath();
    ctx.moveTo(fx - 3, fy - 3);
    ctx.lineTo(fx + 3, fy + 3);
    ctx.moveTo(fx + 3, fy - 3);
    ctx.lineTo(fx - 3, fy + 3);
    ctx.lineWidth = 1.4;
    ctx.stroke();
  });
  legend(ctx, rect.x + 5, rect.y + 5, GELS.map((gel) => gel.label), [...T.series], 'line');
}

export function plate(ctx: CanvasRenderingContext2D, rect: Rect) {
  const size = Math.min(rect.w, rect.h);
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const radius = size * 0.46;
  fillRect(ctx, rect.x, rect.y, rect.w, rect.h, '#0b0a08');
  text(ctx, 'E. coli, 24 h, 37 °C', cx, rect.y - 10, { ...LABEL, size: 11, align: 'center' });

  const agar = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.2, radius * 0.1, cx, cy, radius);
  agar.addColorStop(0, '#e2bf57');
  agar.addColorStop(1, '#a8812a');
  circle(ctx, cx, cy, radius, agar);
  // Bacterial lawn texture.
  const random = seededRandom(42);
  for (let i = 0; i < 600; i++) {
    const angle = random() * Math.PI * 2;
    const distance = Math.sqrt(random()) * radius * 0.97;
    ctx.fillStyle = random() > 0.5 ? 'rgba(255,240,190,0.18)' : 'rgba(90,60,10,0.18)';
    ctx.fillRect(cx + Math.cos(angle) * distance, cy + Math.sin(angle) * distance, 1.2, 1.2);
  }
  const mm = (radius * 2) / 90;
  ZONES.coli.forEach((zone, index) => {
    const angle = -Math.PI / 2 + (index / 4) * Math.PI * 2 + Math.PI / 4;
    const dx = cx + Math.cos(angle) * radius * 0.5;
    const dy = cy + Math.sin(angle) * radius * 0.5;
    circle(ctx, dx, dy, (zone / 2) * mm, 'rgba(60,44,14,0.75)');
    circle(ctx, dx, dy, 3 * mm, '#f4f1e8');
    text(ctx, ZONES.concentrations[index], dx, dy + (zone / 2) * mm + 7, { size: 8.5, family: 'sans', color: '#ffffff', align: 'center' });
    if (index === 3) {
      const half = (zone / 2) * mm;
      fillRect(ctx, dx - half, dy - 0.6, half * 2, 1.2, '#ffffff');
      fillRect(ctx, dx - half, dy - 4, 1.2, 8, '#ffffff');
      fillRect(ctx, dx + half - 1.2, dy - 4, 1.2, 8, '#ffffff');
      text(ctx, `${zone} mm`, dx, dy - half - 7, { size: 9.5, weight: 600, family: 'sans', color: '#ffffff', align: 'center' });
    }
  });
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = 'rgba(230,230,230,0.55)';
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 1, 0, Math.PI * 2);
  ctx.stroke();
}

export function zoneBars(ctx: CanvasRenderingContext2D, rect: Rect) {
  const y = { min: 0, max: 20 };
  const x = { min: 0, max: 4 };
  axes(ctx, rect, { x, y, xTicks: [], yTicks: [0, 5, 10, 15, 20], xLabel: 'AgNP (wt%)', yLabel: 'Zone diameter (mm)', title: 'Zone of inhibition' });
  const groups = [
    { values: ZONES.coli, errors: ZONES.coliError, color: T.series[0] },
    { values: ZONES.aureus, errors: ZONES.aureusError, color: T.series[1] },
  ];
  const slot = rect.w / 4;
  const barW = slot * 0.3;
  ZONES.concentrations.forEach((label, index) => {
    const center = rect.x + slot * (index + 0.5);
    text(ctx, label, center, rect.y + rect.h + 10, { ...LABEL, align: 'center' });
    groups.forEach((group, g) => {
      const left = center - barW + g * barW;
      const top = py(rect, y, group.values[index]);
      fillRect(ctx, left + 1, top, barW - 2, rect.y + rect.h - top, group.color);
      const errorTop = py(rect, y, group.values[index] + group.errors[index]);
      const errorBottom = py(rect, y, group.values[index] - group.errors[index]);
      const mid = left + barW / 2;
      fillRect(ctx, mid - 0.5, errorTop, 1, errorBottom - errorTop, T.axis);
      fillRect(ctx, mid - 3, errorTop, 6, 1, T.axis);
      fillRect(ctx, mid - 3, errorBottom, 6, 1, T.axis);
    });
  });
  legend(ctx, rect.x + 5, rect.y + 5, ['E. coli', 'S. aureus'], [T.series[0], T.series[1]], 'box');
}
