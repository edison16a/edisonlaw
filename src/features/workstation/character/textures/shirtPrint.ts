import { CanvasTexture, SRGBColorSpace } from 'three';
import { seededRandom } from '@/lib/math';
import { PALETTE } from '../materials';

/** Canvas size of the shirt map. It wraps once around the torso, front in the middle. */
const WIDTH = 1024;
const HEIGHT = 512;

/** Where the print sits in UV space and how tall its letters are. */
const PRINT = { u: 0.5, v: 0.66, letterHeight: 0.082, squeeze: 0.84 } as const;

/** Faint knit texture so the fabric does not look like plastic up close. */
function paintKnit(ctx: CanvasRenderingContext2D) {
  const random = seededRandom(7);
  ctx.fillStyle = PALETTE.shirt;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  for (let x = 0; x < WIDTH; x += 3) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.012 + random() * 0.018})`;
    ctx.fillRect(x, 0, 1, HEIGHT);
  }
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = random() > 0.5 ? 'rgba(255, 255, 255, 0.035)' : 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(random() * WIDTH, random() * HEIGHT, 2, 2);
  }
}

/** Collegiate slab letters drawn as shapes, so the print looks the same on every machine. */
function letterC(ctx: CanvasRenderingContext2D, x: number, w: number, h: number, stroke: number) {
  const cx = x + w / 2;
  const cy = h / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - w, -h, w * 3, h * 3);
  ctx.rect(cx + w * 0.12, cy - h * 0.2, w, h * 0.4);
  ctx.clip('evenodd');
  ctx.beginPath();
  ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.ellipse(cx, cy, w / 2 - stroke * 0.95, h / 2 - stroke * 0.72, 0, 0, Math.PI * 2);
  ctx.fill('evenodd');
  ctx.restore();
  ctx.fillRect(cx + w * 0.3, cy - h * 0.34, stroke * 0.32, h * 0.18);
  ctx.fillRect(cx + w * 0.3, cy + h * 0.16, stroke * 0.32, h * 0.18);
}

function letterA(ctx: CanvasRenderingContext2D, x: number, w: number, h: number, stroke: number) {
  ctx.beginPath();
  ctx.moveTo(x + w * 0.02, h);
  ctx.lineTo(x + w * 0.37, 0);
  ctx.lineTo(x + w * 0.63, 0);
  ctx.lineTo(x + w * 0.98, h);
  ctx.lineTo(x + w * 0.98 - stroke * 1.05, h);
  ctx.lineTo(x + w * 0.5, h * 0.2);
  ctx.lineTo(x + w * 0.02 + stroke * 1.05, h);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(x + w * 0.27, h * 0.6, w * 0.46, h * 0.14);
  ctx.fillRect(x - w * 0.06, h - h * 0.1, w * 0.4, h * 0.1);
  ctx.fillRect(x + w * 0.66, h - h * 0.1, w * 0.4, h * 0.1);
}

function letterL(ctx: CanvasRenderingContext2D, x: number, w: number, h: number, stroke: number) {
  ctx.fillRect(x + w * 0.12, 0, stroke, h);
  ctx.fillRect(x + w * 0.12, h - stroke * 0.8, w * 0.84, stroke * 0.8);
  ctx.fillRect(x - w * 0.04, 0, stroke + w * 0.32, h * 0.1);
  ctx.fillRect(x - w * 0.04, h - h * 0.1, w * 0.3, h * 0.1);
  ctx.fillRect(x + w * 0.88, h - stroke * 1.35, w * 0.1, stroke * 1.35);
}

/** "CAL" in Berkeley gold, centred at the print position, with a slightly worn screen print edge. */
function paintPrint(ctx: CanvasRenderingContext2D) {
  const h = PRINT.letterHeight * HEIGHT;
  const w = h * 0.8;
  const gap = w * 0.16;
  const stroke = h * 0.27;
  const total = w * 3 + gap * 2;
  ctx.save();
  ctx.translate(PRINT.u * WIDTH - (total * PRINT.squeeze) / 2, (1 - PRINT.v) * HEIGHT - h / 2);
  ctx.scale(PRINT.squeeze, 1);
  ctx.fillStyle = PALETTE.print;
  letterC(ctx, 0, w, h, stroke);
  letterA(ctx, w + gap, w, h, stroke);
  letterL(ctx, (w + gap) * 2, w, h, stroke);
  ctx.restore();

  // Knock a few specks out of the ink so it reads as a print, not a sticker.
  const random = seededRandom(11);
  ctx.fillStyle = PALETTE.shirt;
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 90; i++) {
    const px = PRINT.u * WIDTH + (random() - 0.5) * total;
    const py = (1 - PRINT.v) * HEIGHT + (random() - 0.5) * h;
    ctx.fillRect(px, py, 1.5, 1.5);
  }
  ctx.globalAlpha = 1;
}

/** Shirt colour map: knit base plus the chest print. Call on the client only. */
export function createShirtTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    paintKnit(ctx);
    paintPrint(ctx);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
