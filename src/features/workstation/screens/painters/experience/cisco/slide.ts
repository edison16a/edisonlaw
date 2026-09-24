import { fillRect, type Rect } from '../../../draw/shapes';
import { text } from '../../../draw/text';
import { drawDevice } from './devices';
import { CISCO_THEME as T } from './theme';
import { deviceById, DEVICES, LINKS, ROUTES } from './topology';

/** The shared slide: a three tier campus network with packets moving along the links. */

export const SLIDE_WIDTH = 964;
export const SLIDE_HEIGHT = 542;
const PACKET_SPEED = 150;

const LAYERS = [
  { label: 'Core', y: 276 },
  { label: 'Distribution', y: 356 },
  { label: 'Access', y: 428 },
];

function links(ctx: CanvasRenderingContext2D, x: number, y: number) {
  for (const link of LINKS) {
    const a = deviceById(link.from);
    const b = deviceById(link.to);
    ctx.beginPath();
    ctx.moveTo(x + a.x, y + a.y);
    ctx.lineTo(x + b.x, y + b.y);
    ctx.strokeStyle = link.standby ? T.standby : T.link;
    ctx.globalAlpha = link.weight ? 0.9 : link.standby ? 0.7 : 0.55;
    ctx.lineWidth = link.weight ?? 1.2;
    ctx.setLineDash(link.standby ? [5, 5] : []);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}

function pointOnRoute(route: string[], distance: number): [number, number] | null {
  let remaining = distance;
  for (let i = 0; i < route.length - 1; i++) {
    const a = deviceById(route[i]);
    const b = deviceById(route[i + 1]);
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    if (remaining <= length) {
      const t = remaining / length;
      return [a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t];
    }
    remaining -= length;
  }
  return null;
}

function packets(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  ROUTES.forEach((route, index) => {
    const distance = ((time + index * 1.7) * PACKET_SPEED) % 1100;
    const point = pointOnRoute(route, distance);
    if (!point) return;
    const px = x + point[0];
    const py = y + point[1];
    const glow = ctx.createRadialGradient(px, py, 0, px, py, 12);
    glow.addColorStop(0, 'rgba(0,188,235,0.9)');
    glow.addColorStop(1, 'rgba(0,188,235,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(px - 12, py - 12, 24, 24);
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#e8fbff';
    ctx.fill();
  });
}

export function drawSlide(ctx: CanvasRenderingContext2D, rect: Rect, time: number) {
  const background = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w * 0.4, rect.y + rect.h);
  background.addColorStop(0, T.slideTop);
  background.addColorStop(1, T.slideBottom);
  fillRect(ctx, rect.x, rect.y, rect.w, rect.h, background);

  text(ctx, 'Campus network, three tier design', rect.x + 40, rect.y + 52, { size: 28, weight: 700, family: 'sans', color: '#ffffff' });
  text(ctx, 'Core, distribution and access layers with redundant uplinks', rect.x + 40, rect.y + 84, { size: 15, family: 'sans', color: T.cyan });

  LAYERS.forEach((layer) => {
    text(ctx, layer.label.toUpperCase(), rect.x + 40, rect.y + layer.y, { size: 11, weight: 700, family: 'sans', color: '#6f8aa6' });
  });
  links(ctx, rect.x, rect.y);
  packets(ctx, rect.x, rect.y, time);
  DEVICES.forEach((device) => drawDevice(ctx, device, rect.x, rect.y));

  // Legend on the right.
  const legendX = rect.x + rect.w - 150;
  fillRect(ctx, legendX, rect.y + 150, 22, 2, T.link);
  text(ctx, 'Active link', legendX + 30, rect.y + 151, { size: 11.5, family: 'sans', color: '#b9d3e6' });
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = T.standby;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(legendX, rect.y + 172);
  ctx.lineTo(legendX + 22, rect.y + 172);
  ctx.stroke();
  ctx.setLineDash([]);
  text(ctx, 'STP standby', legendX + 30, rect.y + 172, { size: 11.5, family: 'sans', color: '#b9d3e6' });

  fillRect(ctx, rect.x + 40, rect.y + rect.h - 30, rect.w - 80, 1, 'rgba(255,255,255,0.12)');
  text(ctx, 'Cisco Career Exploration Program, Summer 2024', rect.x + 40, rect.y + rect.h - 15, { size: 11, family: 'sans', color: '#7d93ab' });
  text(ctx, '7', rect.x + rect.w - 40, rect.y + rect.h - 15, { size: 11, family: 'sans', color: '#7d93ab', align: 'right' });
}
