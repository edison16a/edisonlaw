import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { seededRandom } from '@/lib/math';

type Painter = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

function paintTexture(width: number, height: number, paint: Painter) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) paint(ctx, width, height);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Dark oak planks running left to right, tiled across the floor. */
export function createFloorTexture() {
  const texture = paintTexture(1024, 1024, (ctx, w, h) => {
    const random = seededRandom(7);
    const rows = 8;
    const rowHeight = h / rows;
    for (let row = 0; row < rows; row++) {
      let x = -random() * w * 0.5;
      while (x < w) {
        const length = w * (0.45 + random() * 0.5);
        const tone = 30 + random() * 14;
        ctx.fillStyle = `rgb(${tone + 14}, ${tone + 3}, ${tone - 6})`;
        ctx.fillRect(x, row * rowHeight, length, rowHeight);
        // Soft grain streaks along each plank.
        for (let i = 0; i < 14; i++) {
          const y = row * rowHeight + random() * rowHeight;
          ctx.fillStyle = `rgba(${random() > 0.5 ? '255,220,190' : '0,0,0'}, ${0.03 + random() * 0.04})`;
          ctx.fillRect(x, y, length, 1 + random() * 3);
        }
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(x, row * rowHeight, 3, rowHeight);
        x += length;
      }
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, row * rowHeight, w, 3);
    }
  });
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  return texture;
}

/** Speckled cork for the pin board. */
export function createCorkTexture() {
  return paintTexture(256, 256, (ctx, w, h) => {
    const random = seededRandom(11);
    ctx.fillStyle = '#8a6446';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      const shade = random() > 0.5 ? '60, 38, 22' : '176, 136, 98';
      ctx.fillStyle = `rgba(${shade}, ${0.25 + random() * 0.4})`;
      ctx.fillRect(random() * w, random() * h, 1 + random() * 2.5, 1 + random() * 2.5);
    }
  });
}

/** A pinned paper note with a few handwritten looking lines. */
export function createNoteTexture(paper: string, ink: string, seed: number) {
  return paintTexture(256, 256, (ctx, w, h) => {
    const random = seededRandom(seed);
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = ink;
    ctx.lineCap = 'round';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(34, 50);
    ctx.lineTo(34 + w * (0.35 + random() * 0.2), 50);
    ctx.stroke();
    ctx.lineWidth = 4;
    for (let line = 0; line < 6; line++) {
      const y = 92 + line * 26;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.moveTo(34, y);
      ctx.lineTo(34 + (w - 80) * (0.4 + random() * 0.6), y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
}

/** A small night landscape for the framed picture: hills, a moon and a few stars. */
export function createPictureTexture() {
  return paintTexture(320, 240, (ctx, w, h) => {
    const random = seededRandom(5);
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0f1a3a');
    sky.addColorStop(1, '#3b4c86');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + random() * 0.6})`;
      ctx.fillRect(random() * w, random() * h * 0.55, 2, 2);
    }
    ctx.fillStyle = '#f4efd9';
    ctx.beginPath();
    ctx.arc(w * 0.7, h * 0.3, 26, 0, Math.PI * 2);
    ctx.fill();
    const hill = (color: string, peaks: [number, number][]) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (const [x, y] of peaks) ctx.lineTo(x * w, y * h);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    };
    hill('#26325e', [[0, 0.72], [0.28, 0.46], [0.5, 0.66], [0.78, 0.5], [1, 0.7]]);
    hill('#141c3a', [[0, 0.86], [0.35, 0.66], [0.62, 0.84], [1, 0.74]]);
  });
}
