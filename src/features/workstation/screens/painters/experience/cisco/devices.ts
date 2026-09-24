import { circle, fillRound } from '../../../draw/shapes';
import { text } from '../../../draw/text';
import { CISCO_THEME as T } from './theme';
import type { Device } from './topology';

/** Network diagram symbols in the familiar blue style: routers, switches, a firewall and endpoints. */

function arrow(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
  const angle = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - Math.cos(angle - 0.6) * 4.5, y1 - Math.sin(angle - 0.6) * 4.5);
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - Math.cos(angle + 0.6) * 4.5, y1 - Math.sin(angle + 0.6) * 4.5);
  ctx.stroke();
}

function whiteStroke(ctx: CanvasRenderingContext2D, width = 1.8) {
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
}

function router(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // A squat cylinder seen from above and the side.
  ctx.fillStyle = '#036e9e';
  ctx.beginPath();
  ctx.ellipse(x, y + 6, 22, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 22, y - 2, 44, 8);
  ctx.fillStyle = T.device;
  ctx.beginPath();
  ctx.ellipse(x, y - 2, 22, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  whiteStroke(ctx, 1.6);
  arrow(ctx, x - 14, y - 6, x - 4, y - 2);
  arrow(ctx, x + 14, y + 2, x + 4, y - 2);
  arrow(ctx, x - 3, y - 3, x - 13, y + 2);
  arrow(ctx, x + 3, y - 1, x + 13, y - 6);
}

function layer3(ctx: CanvasRenderingContext2D, x: number, y: number) {
  fillRound(ctx, x - 19, y - 19, 38, 38, 6, T.device);
  whiteStroke(ctx);
  arrow(ctx, x - 3, y - 3, x - 12, y - 12);
  arrow(ctx, x + 3, y + 3, x + 12, y + 12);
  arrow(ctx, x - 12, y + 12, x - 3, y + 3);
  arrow(ctx, x + 12, y - 12, x + 3, y - 3);
}

function accessSwitch(ctx: CanvasRenderingContext2D, x: number, y: number) {
  fillRound(ctx, x - 24, y - 12, 48, 24, 4, T.device);
  whiteStroke(ctx);
  arrow(ctx, x - 14, y - 4, x + 14, y - 4);
  arrow(ctx, x + 14, y + 4, x - 14, y + 4);
}

function firewall(ctx: CanvasRenderingContext2D, x: number, y: number) {
  fillRound(ctx, x - 24, y - 14, 48, 28, 3, '#c0392b');
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let row = 0; row < 3; row++) {
    const by = y - 14 + row * 9.3;
    ctx.moveTo(x - 24, by);
    ctx.lineTo(x + 24, by);
    for (let col = 0; col < 4; col++) {
      const bx = x - 24 + col * 12 + (row % 2) * 6;
      ctx.moveTo(bx, by);
      ctx.lineTo(bx, by + 9.3);
    }
  }
  ctx.stroke();
}

function cloud(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  ctx.arc(x - 20, y + 4, 13, Math.PI * 0.5, Math.PI * 1.5);
  ctx.arc(x - 4, y - 8, 16, Math.PI, Math.PI * 1.85);
  ctx.arc(x + 18, y, 13, Math.PI * 1.3, Math.PI * 0.5);
  ctx.closePath();
  ctx.fillStyle = 'rgba(95,211,243,0.14)';
  ctx.fill();
  ctx.strokeStyle = T.link;
  ctx.lineWidth = 1.6;
  ctx.stroke();
}

function endpoint(ctx: CanvasRenderingContext2D, kind: Device['kind'], x: number, y: number) {
  ctx.strokeStyle = '#cfe8f5';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (kind === 'laptop') {
    ctx.rect(x - 10, y - 9, 20, 13);
    ctx.moveTo(x - 14, y + 7);
    ctx.lineTo(x + 14, y + 7);
  } else if (kind === 'phone') {
    ctx.roundRect(x - 8, y - 10, 16, 20, 3);
    ctx.moveTo(x - 4, y - 4);
    ctx.lineTo(x + 4, y - 4);
  } else {
    ctx.arc(x, y + 5, 3, 0, Math.PI * 2);
    ctx.moveTo(x - 8, y - 1);
    ctx.arc(x, y + 5, 10, Math.PI * 1.25, Math.PI * 1.75);
    ctx.moveTo(x - 12, y - 6);
    ctx.arc(x, y + 5, 16, Math.PI * 1.27, Math.PI * 1.73);
  }
  ctx.stroke();
}

export function drawDevice(ctx: CanvasRenderingContext2D, device: Device, originX: number, originY: number) {
  const x = originX + device.x;
  const y = originY + device.y;
  switch (device.kind) {
    case 'cloud':
      cloud(ctx, x, y);
      break;
    case 'firewall':
      firewall(ctx, x, y);
      break;
    case 'router':
      router(ctx, x, y);
      break;
    case 'core':
      layer3(ctx, x, y);
      break;
    case 'switch':
      accessSwitch(ctx, x, y);
      break;
    default:
      circle(ctx, x, y, 17, 'rgba(255,255,255,0.05)');
      endpoint(ctx, device.kind, x, y);
  }
  if (device.label) {
    const below = device.kind === 'cloud' ? 0 : 30;
    const labelX = device.kind === 'cloud' ? x : device.kind === 'firewall' ? x + 60 : x;
    const labelY = device.kind === 'cloud' ? y + 2 : device.kind === 'firewall' ? y : y + below;
    text(ctx, device.label, labelX, labelY, { size: 11.5, weight: 600, family: 'sans', color: '#d7eef8', align: 'center' });
  }
}
