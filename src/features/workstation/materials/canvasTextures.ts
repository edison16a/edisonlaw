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

/** Staggered round perforations on dark metal, tiled across vent panels. */
export function createPerforationTexture() {
  const texture = paintTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#2c2e35';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#050506';
    const pitch = 16;
    for (let row = 0; row <= h / pitch; row++) {
      for (let col = 0; col <= w / pitch; col++) {
        const x = col * pitch + (row % 2) * (pitch / 2);
        ctx.beginPath();
        ctx.arc(x, row * pitch, 5.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  return texture;
}

/**
 * The back of the PC case, drawn on its rear panel: the I/O shield beside the motherboard tray, the exhaust
 * fan grille, seven expansion slot covers and the power supply with its switch and socket. U runs from the
 * tray side to the glass side and V from the floor up.
 */
export function createTowerRearTexture() {
  return paintTexture(256, 512, (ctx, w, h) => {
    ctx.fillStyle = '#141519';
    ctx.fillRect(0, 0, w, h);
    const y = (fromTop: number) => fromTop * h;
    // I/O shield with rows of ports.
    ctx.fillStyle = '#23252b';
    ctx.fillRect(w * 0.06, y(0.04), w * 0.22, y(0.3));
    ctx.fillStyle = '#060607';
    for (let i = 0; i < 9; i++) ctx.fillRect(w * 0.09, y(0.07) + i * y(0.028), w * 0.15, y(0.014));
    // Exhaust fan grille: a round field of honeycomb holes.
    ctx.save();
    ctx.beginPath();
    ctx.arc(w * 0.56, y(0.2), w * 0.25, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = '#050506';
    for (let row = 0; row < 24; row++) {
      for (let col = 0; col < 18; col++) {
        ctx.beginPath();
        ctx.arc(w * 0.28 + col * 12 + (row % 2) * 6, y(0.07) + row * 10.5, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
    // Expansion slot covers.
    for (let i = 0; i < 7; i++) {
      const top = y(0.44) + i * y(0.036);
      ctx.fillStyle = '#26282e';
      ctx.fillRect(w * 0.06, top, w * 0.7, y(0.027));
      ctx.fillStyle = '#0b0b0d';
      ctx.fillRect(w * 0.14, top + y(0.009), w * 0.54, y(0.01));
    }
    // Power supply: fan grille, switch and socket.
    ctx.fillStyle = '#1d1f24';
    ctx.fillRect(w * 0.06, y(0.77), w * 0.86, y(0.2));
    ctx.fillStyle = '#060607';
    for (let i = 0; i < 9; i++) ctx.fillRect(w * 0.12 + i * w * 0.045, y(0.8), w * 0.022, y(0.14));
    ctx.fillRect(w * 0.64, y(0.81), w * 0.2, y(0.06));
    ctx.fillStyle = '#3a3c43';
    ctx.fillRect(w * 0.68, y(0.89), w * 0.1, y(0.04));
  });
}

/**
 * Dark felt for the desk mat, `width` by `depth` metres: a fine fibre speckle and a stitched border
 * a few millimetres in from the edge.
 */
export function createDeskMatTexture(width: number, depth: number) {
  const pxPerMetre = 1200;
  const inset = 0.007 * pxPerMetre;
  return paintTexture(Math.round(width * pxPerMetre), Math.round(depth * pxPerMetre), (ctx, w, h) => {
    const random = seededRandom(17);
    ctx.fillStyle = '#1c1d23';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 16000; i++) {
      const shade = random() > 0.5 ? '255, 255, 255' : '0, 0, 0';
      ctx.fillStyle = `rgba(${shade}, ${0.025 + random() * 0.035})`;
      ctx.fillRect(random() * w, random() * h, 1 + random() * 2, 1);
    }
    ctx.strokeStyle = '#3a3c46';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([7, 4]);
    ctx.beginPath();
    ctx.roundRect(inset, inset, w - inset * 2, h - inset * 2, 10);
    ctx.stroke();
  });
}

/** The moon lamp's face: a warm pale disc with soft grey maria and a few small craters. */
export function createMoonTexture() {
  return paintTexture(256, 128, (ctx, w, h) => {
    const random = seededRandom(31);
    ctx.fillStyle = '#fff1dc';
    ctx.fillRect(0, 0, w, h);
    const blotch = (x: number, y: number, radius: number, alpha: number) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(150, 128, 104, ${alpha})`);
      gradient.addColorStop(1, 'rgba(150, 128, 104, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };
    for (let i = 0; i < 9; i++) blotch(random() * w, h * (0.25 + random() * 0.5), 14 + random() * 26, 0.28 + random() * 0.2);
    for (let i = 0; i < 40; i++) blotch(random() * w, random() * h, 2 + random() * 5, 0.25 + random() * 0.25);
  });
}

/** A book spine in `color` with two foil bands and a short title line. */
export function createSpineTexture(color: string, foil: string, seed: number) {
  return paintTexture(64, 256, (ctx, w, h) => {
    const random = seededRandom(seed);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = foil;
    const top = 0.1 + random() * 0.05;
    ctx.fillRect(0, h * top, w, h * 0.02);
    ctx.fillRect(0, h * (0.86 - random() * 0.04), w, h * 0.02);
    ctx.globalAlpha = 0.85;
    ctx.fillRect(w * 0.3, h * (top + 0.1), w * 0.4, h * (0.3 + random() * 0.2));
    ctx.globalAlpha = 1;
  });
}

/** Soft mottled plaster, a few percent either side of white, to keep large walls from reading as flat colour. */
export function createPlasterTexture() {
  const texture = paintTexture(256, 256, (ctx, w, h) => {
    const random = seededRandom(23);
    ctx.fillStyle = '#f4f4f4';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      const x = random() * w;
      const y = random() * h;
      const radius = 6 + random() * 26;
      const shade = random() > 0.5 ? 255 : 205;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${shade}, ${shade}, ${shade}, 0.12)`);
      gradient.addColorStop(1, `rgba(${shade}, ${shade}, ${shade}, 0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = `rgba(0, 0, 0, ${random() * 0.05})`;
      ctx.fillRect(random() * w, random() * h, 1, 1);
    }
  });
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  return texture;
}

/** Tufted wool: fine light and dark flecks, tiled over the rug and tinted by each band's colour. */
export function createFibreTexture() {
  const texture = paintTexture(256, 256, (ctx, w, h) => {
    const random = seededRandom(29);
    ctx.fillStyle = '#e6e6e6';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) {
      const light = random() > 0.45;
      ctx.fillStyle = light ? `rgba(255, 255, 255, ${0.1 + random() * 0.25})` : `rgba(0, 0, 0, ${0.08 + random() * 0.2})`;
      ctx.beginPath();
      ctx.arc(random() * w, random() * h, 0.6 + random() * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  return texture;
}
