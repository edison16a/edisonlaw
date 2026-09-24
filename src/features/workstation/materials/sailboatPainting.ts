import { seededRandom } from '@/lib/math';

/**
 * A small sailboat on calm water at dusk, painted for the framed print on the wall: a low sun sinking
 * into a warm horizon, soft clouds lit from below, a hazy headland, and the boat with its sails catching
 * the last light, all mirrored in the water. Everything is placed in fractions of the canvas, so it
 * paints the same picture at any size.
 */

type Context = CanvasRenderingContext2D;
type Stops = [number, string][];

const SKY: Stops = [
  [0, '#27295a'],
  [0.3, '#4b3f7e'],
  [0.58, '#a4638a'],
  [0.82, '#e88f78'],
  [1, '#ffcf8f'],
];
const WATER: Stops = [
  [0, '#f2b183'],
  [0.12, '#c07a86'],
  [0.45, '#5c4a7c'],
  [1, '#1c1d42'],
];
/** Where the sea meets the sky, as a fraction of the height. */
const HORIZON = 0.6;
const SUN = { x: 0.7, radius: 0.085, glow: '255, 206, 140' };
/** The boat's waterline centre and hull length, as fractions of the canvas. */
const BOAT = { x: 0.33, y: 0.745, length: 0.25 };

function fillGradient(ctx: Context, top: number, bottom: number, stops: Stops, width: number) {
  const gradient = ctx.createLinearGradient(0, top, 0, bottom);
  for (const [offset, color] of stops) gradient.addColorStop(offset, color);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, top, width, bottom - top);
}

/** A soft edged ellipse that fades from `rgb` at `alpha` in the middle to nothing at its rim. */
function softEllipse(ctx: Context, x: number, y: number, rx: number, ry: number, rgb: string, alpha: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(rx, ry);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  gradient.addColorStop(0, `rgba(${rgb}, ${alpha})`);
  gradient.addColorStop(0.55, `rgba(${rgb}, ${alpha * 0.55})`);
  gradient.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(-1, -1, 2, 2);
  ctx.restore();
}

/** Long thin clouds, a shaded mauve top with a warm lit underside that grows golden toward the sun. */
function paintClouds(ctx: Context, w: number, h: number, random: () => number) {
  const bands: [number, number, number][] = [
    // Centre x, centre y and length, as fractions.
    [0.2, 0.2, 0.34],
    [0.62, 0.13, 0.4],
    [0.9, 0.3, 0.26],
    [0.42, 0.36, 0.3],
    [0.78, 0.46, 0.22],
    [0.14, 0.47, 0.2],
  ];
  for (const [cx, cy, length] of bands) {
    const nearSun = Math.max(0, 1 - Math.abs(cx - SUN.x) * 1.6) * (0.4 + cy);
    const lit = nearSun > 0.35 ? '255, 206, 156' : '246, 166, 158';
    const puffs = 9;
    for (let i = 0; i < puffs; i++) {
      const t = i / (puffs - 1) - 0.5;
      const x = (cx + t * length) * w;
      const y = (cy + (random() - 0.5) * 0.02) * h;
      const rx = length * w * (0.16 + random() * 0.1) * (1 - Math.abs(t) * 0.8);
      const ry = h * (0.016 + random() * 0.012);
      softEllipse(ctx, x, y - ry * 0.45, rx, ry, '112, 78, 142', 0.34);
      softEllipse(ctx, x, y + ry * 0.35, rx * 0.9, ry * 0.7, lit, 0.5 + nearSun * 0.4);
    }
  }
}

function paintSun(ctx: Context, w: number, h: number) {
  const x = SUN.x * w;
  const horizon = HORIZON * h;
  const radius = SUN.radius * h;
  const y = horizon - radius * 0.55;
  // A wide warm bloom across the sky, then the disc, cut off where it sinks into the sea.
  softEllipse(ctx, x, y, w * 0.42, h * 0.36, SUN.glow, 0.5);
  softEllipse(ctx, x, y, radius * 3, radius * 2.6, '255, 226, 170', 0.5);
  softEllipse(ctx, x, horizon, w * 0.75, h * 0.035, '255, 228, 178', 0.55);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, horizon);
  ctx.clip();
  const disc = ctx.createRadialGradient(x, y - radius * 0.2, 0, x, y, radius);
  disc.addColorStop(0, '#fffbea');
  disc.addColorStop(0.75, '#fff0c4');
  disc.addColorStop(1, '#ffcf8a');
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A ridge line along the horizon from `from` to `to` (fractions of the width), rising to `peak` px. */
function ridgePath(ctx: Context, w: number, horizon: number, from: number, to: number, peak: number, random: () => number) {
  const steps = 9;
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const rise = Math.sin(t * Math.PI) ** 0.7 * (0.72 + random() * 0.28);
    points.push([(from + (to - from) * t) * w, horizon - peak * rise]);
  }
  // Curves through the midpoints, so the ridge rolls instead of zigzagging.
  ctx.beginPath();
  ctx.moveTo(from * w, horizon);
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    ctx.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2);
  }
  ctx.lineTo(to * w, horizon);
  ctx.closePath();
}

/** A hazy headland on the left and a low island far off to the right, with their faint reflections. */
function paintLand(ctx: Context, w: number, h: number, random: () => number) {
  const horizon = HORIZON * h;
  const land: [number, number, number, string, string][] = [
    [-0.08, 0.3, 0.085, '#6b4f7f', 'rgba(70, 48, 96, 0.55)'],
    [-0.05, 0.17, 0.12, '#4e3c6e', 'rgba(52, 38, 82, 0.6)'],
    [0.86, 1.06, 0.035, '#8a6184', 'rgba(110, 72, 110, 0.4)'],
  ];
  for (const [from, to, peak, color, reflection] of land) {
    const seed = random();
    ctx.fillStyle = color;
    ridgePath(ctx, w, horizon, from, to, peak * h, seededRandom(Math.floor(seed * 1e6)));
    ctx.fill();
    ctx.save();
    ctx.translate(0, horizon * 2);
    ctx.scale(1, -1);
    ctx.fillStyle = reflection;
    ridgePath(ctx, w, horizon, from, to, peak * h * 0.8, seededRandom(Math.floor(seed * 1e6)));
    ctx.fill();
    ctx.restore();
  }
}

/** A small lighthouse on the headland, its lamp lit for the evening. */
function paintLighthouse(ctx: Context, w: number, h: number) {
  const x = w * 0.075;
  const base = HORIZON * h - h * 0.098;
  const height = h * 0.075;
  const bottom = h * 0.011;
  const top = h * 0.007;
  ctx.fillStyle = '#e9dcd6';
  ctx.beginPath();
  ctx.moveTo(x - bottom, base);
  ctx.lineTo(x - top, base - height);
  ctx.lineTo(x + top, base - height);
  ctx.lineTo(x + bottom, base);
  ctx.closePath();
  ctx.fill();
  // Two red bands, clipped to the tower's taper.
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#c85a55';
  ctx.fillRect(x - bottom, base - height * 0.36, bottom * 2, height * 0.16);
  ctx.fillRect(x - bottom, base - height * 0.76, bottom * 2, height * 0.16);
  ctx.restore();
  // Lantern room, cap and the lamp's glow.
  softEllipse(ctx, x, base - height - h * 0.012, h * 0.05, h * 0.04, '255, 222, 150', 0.6);
  ctx.fillStyle = '#ffe9b0';
  ctx.fillRect(x - top * 0.9, base - height - h * 0.016, top * 1.8, h * 0.016);
  ctx.fillStyle = '#3a2d4f';
  ctx.beginPath();
  ctx.moveTo(x - top * 1.4, base - height - h * 0.016);
  ctx.lineTo(x, base - height - h * 0.03);
  ctx.lineTo(x + top * 1.4, base - height - h * 0.016);
  ctx.closePath();
  ctx.fill();
}

/** The sun's glitter path: short horizontal strokes under the sun that spread and fade toward the viewer. */
function paintGlitter(ctx: Context, w: number, h: number, random: () => number) {
  const horizon = HORIZON * h;
  const x = SUN.x * w;
  ctx.lineCap = 'round';
  // A soft column of light first, then the strokes on top.
  softEllipse(ctx, x, horizon + h * 0.1, w * 0.07, h * 0.16, '255, 214, 160', 0.45);
  for (let i = 0; i < 70; i++) {
    const depth = (i / 70) ** 1.35;
    const y = horizon + 3 + depth * (h - horizon) * 0.92;
    const spread = w * (0.03 + depth * 0.09);
    const cx = x + (random() - 0.5) * spread * 1.4;
    const length = w * (0.012 + random() * 0.05) * (0.6 + depth);
    ctx.strokeStyle = `rgba(255, ${228 - depth * 50}, ${178 - depth * 36}, ${(0.85 - depth * 0.72) * (0.5 + random() * 0.5)})`;
    ctx.lineWidth = h * (0.003 + depth * 0.006);
    ctx.beginPath();
    ctx.moveTo(cx - length / 2, y);
    ctx.lineTo(cx + length / 2, y);
    ctx.stroke();
  }
}

/** Faint ripples across the whole bay, closer together near the horizon. */
function paintRipples(ctx: Context, w: number, h: number, random: () => number) {
  const horizon = HORIZON * h;
  ctx.lineCap = 'round';
  for (let i = 0; i < 60; i++) {
    const depth = random() ** 1.6;
    const y = horizon + 4 + depth * (h - horizon);
    const length = w * (0.03 + random() * 0.12) * (0.5 + depth);
    const x = random() * w;
    const light = random() > 0.45;
    ctx.strokeStyle = light ? `rgba(255, 214, 196, ${0.06 + (1 - depth) * 0.08})` : `rgba(28, 20, 60, ${0.06 + depth * 0.08})`;
    ctx.lineWidth = h * (0.002 + depth * 0.004);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y);
    ctx.stroke();
  }
}

interface BoatColors {
  hull: string;
  stripe: string;
  cabin: string;
  mainsail: [string, string];
  jib: [string, string];
  spar: string;
  flag: string;
}

const BOAT_COLORS: BoatColors = {
  hull: '#221d3b',
  stripe: '#f0b27c',
  cabin: '#d8c3c2',
  mainsail: ['#a996bf', '#ffd6b4'],
  jib: ['#b7a0c2', '#ffcfaa'],
  spar: '#2b2440',
  flag: '#e2685a',
};

/** A sloop heading right, drawn with its waterline at the origin and its hull `length` px long. */
function drawBoat(ctx: Context, length: number, colors: BoatColors) {
  const L = length;
  const mastX = -0.04 * L;
  const mastTop = -1.28 * L;
  const deck = -0.1 * L;

  // Sails first, behind the hull. Each is shaded from the cool shadow side to the sunlit side.
  const sail = (points: [number, number][], bulge: [number, number], [shade, lit]: [string, string]) => {
    const [head, tack, clew] = points;
    const gradient = ctx.createLinearGradient(Math.min(head[0], clew[0]), 0, Math.max(tack[0], clew[0]), 0);
    gradient.addColorStop(0, shade);
    gradient.addColorStop(1, lit);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(...head);
    ctx.lineTo(...tack);
    ctx.lineTo(...clew);
    ctx.quadraticCurveTo(bulge[0], bulge[1], head[0], head[1]);
    ctx.closePath();
    ctx.fill();
  };
  sail(
    [
      [mastX - 0.012 * L, mastTop + 0.06 * L],
      [mastX - 0.012 * L, deck - 0.1 * L],
      [-0.46 * L, deck - 0.08 * L],
    ],
    [-0.3 * L, -0.62 * L],
    colors.mainsail,
  );
  sail(
    [
      [mastX + 0.018 * L, mastTop + 0.16 * L],
      [0.49 * L, deck - 0.03 * L],
      [0.1 * L, deck - 0.07 * L],
    ],
    [0.02 * L, -0.56 * L],
    colors.jib,
  );

  // Mast, boom and the forestay.
  ctx.strokeStyle = colors.spar;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1.5, L * 0.016);
  ctx.beginPath();
  ctx.moveTo(mastX, deck);
  ctx.lineTo(mastX, mastTop);
  ctx.moveTo(mastX, deck - 0.08 * L);
  ctx.lineTo(-0.48 * L, deck - 0.075 * L);
  ctx.stroke();
  ctx.lineWidth = Math.max(1, L * 0.006);
  ctx.beginPath();
  ctx.moveTo(mastX, mastTop + 0.02 * L);
  ctx.lineTo(0.5 * L, deck - 0.02 * L);
  ctx.stroke();

  // Pennant at the masthead, streaming aft.
  ctx.fillStyle = colors.flag;
  ctx.beginPath();
  ctx.moveTo(mastX, mastTop);
  ctx.lineTo(mastX - 0.13 * L, mastTop + 0.025 * L);
  ctx.lineTo(mastX, mastTop + 0.05 * L);
  ctx.closePath();
  ctx.fill();

  // Low cabin behind the mast.
  ctx.fillStyle = colors.cabin;
  ctx.beginPath();
  ctx.roundRect(-0.28 * L, deck - 0.055 * L, 0.22 * L, 0.07 * L, 0.02 * L);
  ctx.fill();
  ctx.fillStyle = colors.hull;
  ctx.beginPath();
  ctx.roundRect(-0.24 * L, deck - 0.04 * L, 0.14 * L, 0.018 * L, 0.009 * L);
  ctx.fill();

  // Hull: a sheer line that dips amidships, a raked bow and a short transom.
  ctx.fillStyle = colors.hull;
  ctx.beginPath();
  ctx.moveTo(-0.5 * L, -0.11 * L);
  ctx.quadraticCurveTo(0, -0.05 * L, 0.54 * L, -0.14 * L);
  ctx.quadraticCurveTo(0.44 * L, -0.02 * L, 0.34 * L, 0.01 * L);
  ctx.lineTo(-0.4 * L, 0.01 * L);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = colors.stripe;
  ctx.lineWidth = Math.max(1, L * 0.012);
  ctx.beginPath();
  ctx.moveTo(-0.47 * L, -0.085 * L);
  ctx.quadraticCurveTo(0, -0.035 * L, 0.47 * L, -0.105 * L);
  ctx.stroke();
}

/** The boat's reflection: its mirror image, dimmed and broken into wavering strips by the ripples. */
function paintBoatReflection(ctx: Context, w: number, h: number, random: () => number) {
  const x = BOAT.x * w;
  const y = BOAT.y * h;
  const length = BOAT.length * w;
  const depth = length * 1.2;
  const muted: BoatColors = {
    ...BOAT_COLORS,
    hull: '#241d3e',
    cabin: '#8f7590',
    mainsail: ['#80678e', '#c3928f'],
    jib: ['#8c7294', '#c89590'],
  };
  for (let top = 0; top < depth; ) {
    const along = top / depth;
    const strip = h * (0.003 + random() * 0.004 + along * 0.006);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y + top, w, strip);
    ctx.clip();
    ctx.globalAlpha = 0.42 * (1 - along) ** 1.3;
    ctx.translate(x + (random() - 0.5) * length * (0.03 + along * 0.14), y);
    ctx.scale(1, -0.92);
    drawBoat(ctx, length, muted);
    ctx.restore();
    top += strip + h * (0.001 + along * 0.005) * (0.5 + random());
  }
}

/** Two gulls gliding high on the right. */
function paintGulls(ctx: Context, w: number, h: number) {
  ctx.strokeStyle = 'rgba(40, 30, 70, 0.75)';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const gull = (x: number, y: number, span: number) => {
    ctx.lineWidth = Math.max(1.5, span * 0.09);
    ctx.beginPath();
    ctx.moveTo(x - span, y - span * 0.15);
    ctx.quadraticCurveTo(x - span * 0.45, y - span * 0.55, x, y);
    ctx.quadraticCurveTo(x + span * 0.45, y - span * 0.55, x + span, y - span * 0.2);
    ctx.stroke();
  };
  gull(w * 0.54, h * 0.24, w * 0.022);
  gull(w * 0.6, h * 0.28, w * 0.016);
}

/** A light paper grain and a soft darkening toward the corners, so it reads as a print, not a screen. */
function paintPaper(ctx: Context, w: number, h: number, random: () => number) {
  for (let i = 0; i < (w * h) / 60; i++) {
    const light = random() > 0.5;
    ctx.fillStyle = light ? `rgba(255, 240, 220, ${random() * 0.05})` : `rgba(20, 10, 30, ${random() * 0.06})`;
    ctx.fillRect(random() * w, random() * h, 1.5, 1.5);
  }
  const vignette = ctx.createRadialGradient(w / 2, h * 0.55, Math.min(w, h) * 0.35, w / 2, h / 2, Math.hypot(w, h) * 0.6);
  vignette.addColorStop(0, 'rgba(18, 10, 32, 0)');
  vignette.addColorStop(1, 'rgba(18, 10, 32, 0.4)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

export function paintSailboatAtDusk(ctx: Context, w: number, h: number) {
  const random = seededRandom(47);
  const horizon = HORIZON * h;
  fillGradient(ctx, 0, horizon, SKY, w);
  paintClouds(ctx, w, h, random);
  paintSun(ctx, w, h);
  paintGulls(ctx, w, h);
  fillGradient(ctx, horizon, h, WATER, w);
  paintLand(ctx, w, h, random);
  paintLighthouse(ctx, w, h);
  paintGlitter(ctx, w, h, random);
  paintRipples(ctx, w, h, random);
  paintBoatReflection(ctx, w, h, random);
  ctx.save();
  ctx.translate(BOAT.x * w, BOAT.y * h);
  drawBoat(ctx, BOAT.length * w, BOAT_COLORS);
  ctx.restore();
  paintPaper(ctx, w, h, random);
}
