/**
 * FlameSense: the Predict map. A fire near Lake Isabella has been simulated from its NASA EONET
 * marker, and its predicted spread shows as a heat map in the app's four phases, red at the core
 * to green at the edge, leaning downwind. The panel shows the live Open-Meteo readings for the
 * point and the growth score the model turns them into.
 *
 * Drawn as HTML over OpenStreetMap tiles (the app's own tile layer), toned down so the heat map
 * reads first, with the app's controls restyled in the manner of Photo Craft's dark theme.
 * The spread shape follows the app: a ragged 20 sided polygon per phase, stretched downwind.
 * The growth score uses the app's formula (data/growth-model.json) on the readings shown:
 * 50 + (31 - 20) x 1.2 + (50 - 18) x 0.3 = 72.8, before its random jitter.
 * Sources:
 *   https://github.com/edison16a/FlameSense (public/data: content, site.config, growth-model, fire-phases)
 *   https://tile.openstreetmap.org (map tiles, OpenStreetMap contributors)
 */
import { dataUrl } from '../lib/layouts/base.mjs';
import { icon, productShell } from '../lib/layouts/product.mjs';

const WIDTH = 1600;
const HEIGHT = 1000;
const ZOOM = 11;
const TILE = 256;
/** The map's centre, a little west of the fire so the panel does not cover it. */
const CENTRE = [35.645, -118.5];
/** The simulated fire, in the hills north east of Lake Isabella. */
const FIRE = [35.715, -118.31];
/** Other open EONET wildfire markers in view, with a burn radius in pixels. */
const MARKERS = [
  [35.585, -118.72, 34],
  [35.5, -118.25, 22],
  [35.83, -118.6, 18],
];
/** Wind from 292 degrees, so the fire spreads toward 112 degrees. */
const WIND_FROM = 292;

const ORANGE = '#ff7a1a';

/** OpenStreetMap's tile policy asks for a user agent that says who is asking. It serves an error tile to a generic browser one. */
const TILE_HEADERS = { 'user-agent': 'EdisonLawProjectPhotos/1.0 (+https://github.com/edison16a)' };

/** Web Mercator pixel position at ZOOM. */
function project([lat, lon]) {
  const scale = TILE * 2 ** ZOOM;
  const x = ((lon + 180) / 360) * scale;
  const s = Math.sin((lat * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * scale;
  return [x, y];
}

/** A small seeded random source, so the ragged edge comes out the same on every run. */
function random(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * One phase's polygon: 20 vertices around (cx, cy), each pushed out by a ragged amount and by
 * 1 + 0.4 cos(angle to the downwind direction), clamped to 0.6 to 1.4, as in fire-phases.json.
 */
function phase(cx, cy, radius, seed) {
  const next = random(seed);
  const downwind = ((WIND_FROM + 180 - 90) * Math.PI) / 180; // compass to screen angle
  const points = [];
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const bias = Math.min(1.4, Math.max(0.6, 1 + 0.4 * Math.cos(angle - downwind)));
    const r = radius * bias * (0.86 + next() * 0.24);
    // The whole shape drifts downwind as it grows.
    const drift = radius * 0.28;
    points.push([cx + Math.cos(downwind) * drift + Math.cos(angle) * r, cy + Math.sin(downwind) * drift + Math.sin(angle) * r]);
  }
  return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

const CSS = `
body { color: #eef0f4; }
.map { position: absolute; inset: 0; background: #1a1d22; overflow: hidden; }
.tiles { position: absolute; inset: 0; filter: invert(1) hue-rotate(180deg) saturate(0.45) brightness(0.9) contrast(0.85); }
.tiles img { position: absolute; width: ${TILE}px; height: ${TILE}px; }
.shade { position: absolute; inset: 0; background: rgba(12, 16, 24, 0.28); }
.ui { position: absolute; inset: 0; zoom: 1.25; }
.glass { background: rgba(18, 20, 26, 0.9); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.6); backdrop-filter: blur(12px); }
.bar { position: absolute; left: 16px; right: 16px; top: 14px; height: 52px; display: flex; align-items: center; padding: 0 8px 0 14px; gap: 12px; }
.logo { display: flex; align-items: center; gap: 9px; font-size: 16px; font-weight: 650; letter-spacing: -0.02em; flex: 1; }
.logo span { width: 28px; height: 28px; border-radius: 8px; background: rgba(255, 122, 26, 0.16); color: ${ORANGE}; display: grid; place-items: center; }
.tabs { display: flex; gap: 2px; background: rgba(255, 255, 255, 0.05); border-radius: 9px; padding: 3px; }
.tabs span { height: 30px; padding: 0 14px; border-radius: 7px; display: flex; align-items: center; font-size: 13px; color: #a4abb8; }
.tabs .on { background: #eef0f4; color: #111214; font-weight: 550; }
.panel { position: absolute; left: 16px; top: 80px; width: 300px; padding: 16px; }
.label { font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #8b93a1; }
.place { font-size: 18px; font-weight: 650; letter-spacing: -0.02em; margin-top: 6px; }
.coords { font-family: 'Geist Mono', monospace; font-size: 11.5px; color: #8b93a1; margin-top: 2px; }
.growth { margin-top: 14px; padding: 12px; border-radius: 10px; background: rgba(255, 122, 26, 0.08); border: 1px solid rgba(255, 122, 26, 0.2); }
.growth-top { display: flex; align-items: baseline; justify-content: space-between; }
.growth b { font-size: 30px; font-weight: 650; letter-spacing: -0.03em; color: #ffb27a; }
.growth span { font-size: 12.5px; color: #c9b4a4; }
.meter { height: 6px; border-radius: 3px; background: rgba(255, 255, 255, 0.08); margin-top: 8px; overflow: hidden; }
.meter i { display: block; height: 100%; width: 72.8%; border-radius: 3px; background: ${ORANGE}; }
.phases { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-top: 14px; }
.phases div { font-size: 11.5px; color: #a4abb8; }
.phases i { display: block; height: 6px; border-radius: 3px; margin-bottom: 6px; }
.readings { margin-top: 14px; }
.r { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 13px; color: #a4abb8; }
.r span { flex: 1; }
.r b { color: #eef0f4; font-weight: 550; }
.src { font-size: 11.5px; color: #6f7785; margin-top: 8px; }
.actions { display: grid; grid-template-columns: 1fr auto; gap: 8px; margin-top: 12px; }
.btn { height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13.5px; font-weight: 550; }
.btn.primary { background: ${ORANGE}; color: #1b0d02; }
.btn.line { border: 1px solid rgba(255, 255, 255, 0.12); color: #d5d9e0; padding: 0 14px; font-weight: 500; }
.zoom { position: absolute; right: 16px; top: 80px; width: 36px; display: flex; flex-direction: column; overflow: hidden; }
.zoom span { height: 36px; display: grid; place-items: center; color: #d5d9e0; }
.zoom span + span { border-top: 1px solid rgba(255, 255, 255, 0.08); }
.legend { position: absolute; right: 16px; bottom: 30px; padding: 10px 12px; display: flex; align-items: center; gap: 14px; font-size: 12px; color: #a4abb8; }
.legend .dot { width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid #ff5b4a; background: rgba(255, 91, 74, 0.25); }
.legend .ramp { width: 90px; height: 6px; border-radius: 3px; background: linear-gradient(90deg, #ff3b1f, #ff9a00, #ffd400, #7bd548); }
.legend span { display: flex; align-items: center; gap: 7px; }
.attr { position: absolute; right: 16px; bottom: 8px; font-size: 10.5px; color: rgba(255, 255, 255, 0.45); }
.tip { position: absolute; padding: 8px 10px; font-size: 12.5px; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
.tip i { width: 7px; height: 7px; border-radius: 50%; background: ${ORANGE}; box-shadow: 0 0 0 3px rgba(255, 122, 26, 0.25); }
`;

export async function capture({ download, compose }) {
  const [cx, cy] = project(CENTRE);
  const left = cx - WIDTH / 2;
  const top = cy - HEIGHT / 2;
  const toScreen = (point) => {
    const [x, y] = project(point);
    return [x - left, y - top];
  };

  // Every tile the view touches.
  const jobs = [];
  for (let ty = Math.floor(top / TILE); ty <= Math.floor((top + HEIGHT) / TILE); ty++) {
    for (let tx = Math.floor(left / TILE); tx <= Math.floor((left + WIDTH) / TILE); tx++) {
      jobs.push({ tx, ty });
    }
  }
  const tiles = [];
  for (let i = 0; i < jobs.length; i += 6) {
    const batch = await Promise.all(
      jobs.slice(i, i + 6).map(async ({ tx, ty }) => {
        const src = dataUrl(await download(`https://tile.openstreetmap.org/${ZOOM}/${tx}/${ty}.png`, TILE_HEADERS));
        return `<img src="${src}" style="left: ${(tx * TILE - left).toFixed(1)}px; top: ${(ty * TILE - top).toFixed(1)}px;" alt="">`;
      }),
    );
    tiles.push(...batch);
  }

  const [fx, fy] = toScreen(FIRE);
  // Outermost phase first, so the hotter phases sit on top: green, yellow, orange, red.
  const PHASES = [
    ['#7bd548', 200, 0.22],
    ['#ffd400', 150, 0.42],
    ['#ff9a00', 102, 0.52],
    ['#ff3b1f', 60, 0.62],
  ];
  const polygons = PHASES.map(
    ([colour, radius, opacity], i) =>
      `<polygon points="${phase(fx, fy, radius, 7 + i * 13)}" fill="${colour}" fill-opacity="${opacity}" stroke="${colour}" stroke-opacity="0.9" stroke-width="1.5" stroke-linejoin="round"/>`,
  ).join('');

  const markers = MARKERS.map(([lat, lon, r]) => {
    const [x, y] = toScreen([lat, lon]);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#ff5b4a" fill-opacity="0.16" stroke="#ff5b4a" stroke-width="1.5"/>
      <circle cx="${x}" cy="${y}" r="5" fill="#ff5b4a" stroke="#1a1d22" stroke-width="2"/>`;
  }).join('');

  const overlay = `
<svg class="layer" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs><filter id="heat" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter></defs>
  ${markers}
  <g filter="url(#heat)">${polygons}</g>
  <circle cx="${fx}" cy="${fy}" r="20" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="1.5" stroke-dasharray="3 4"/>
  <circle cx="${fx}" cy="${fy}" r="6" fill="#fff" stroke="#ff3b1f" stroke-width="3"/>
</svg>`;

  const reading = (ico, label, value) => `<div class="r">${icon(ico, { size: 14 })}<span>${label}</span><b class="num">${value}</b></div>`;
  const arrow = `<svg width="14" height="14" viewBox="0 0 24 24" style="transform: rotate(${WIND_FROM + 180}deg);" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V4M6 10l6-6 6 6"/></svg>`;

  // UI positions are in the zoomed space (1280 x 800).
  const [tipX, tipY] = [fx / 1.25 + 26, fy / 1.25 - 64];

  const ui = `
<div class="ui">
  <div class="glass bar">
    <div class="logo"><span>${icon('flame', { size: 16, width: 2 })}</span>FlameSense</div>
    <div class="tabs"><span>About</span><span>How we did it</span><span class="on">Predict</span></div>
  </div>
  <div class="glass panel">
    <div class="label">Predicted spread</div>
    <div class="place">Near Lake Isabella, CA</div>
    <div class="coords">35.7150, -118.3100</div>
    <div class="growth">
      <div class="growth-top"><span>Growth</span><b class="num">72.8%</b></div>
      <div class="meter"><i></i></div>
    </div>
    <div class="phases">
      <div><i style="background: #ff3b1f"></i>Phase 1</div>
      <div><i style="background: #ff9a00"></i>Phase 2</div>
      <div><i style="background: #ffd400"></i>Phase 3</div>
      <div><i style="background: #7bd548"></i>Phase 4</div>
    </div>
    <div class="readings">
      ${reading('thermo', 'Temperature', '31°C')}
      ${reading('droplet', 'Relative humidity', '18%')}
      <div class="r">${icon('wind', { size: 14 })}<span>Wind</span><b class="num" style="display: flex; align-items: center; gap: 6px;">${arrow}14 km/h, 292°</b></div>
      ${reading('wind', 'Wind gusts', '26 km/h')}
      ${reading('droplet', 'Rain', '0 mm')}
      ${reading('gauge', 'Vapour pressure deficit', '3.1')}
    </div>
    <div class="src">Live weather from Open-Meteo</div>
    <div class="actions">
      <div class="btn primary">${icon('flame', { size: 15, width: 2 })}Simulate fire</div>
      <div class="btn line">Clear</div>
    </div>
  </div>
  <div class="glass zoom"><span>${icon('plus', { size: 16, width: 2 })}</span><span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg></span></div>
  <div class="glass tip" style="left: ${tipX}px; top: ${tipY}px;"><i></i>Simulating from an EONET fire</div>
  <div class="glass legend">
    <span><i class="dot"></i>Active fire, NASA EONET</span>
    <span><i class="ramp"></i>Core to edge</span>
  </div>
  <div class="attr">© OpenStreetMap contributors</div>
</div>`;

  const body = `<div class="map"><div class="tiles">${tiles.join('')}</div><div class="shade"></div>${overlay}${ui}</div>`;
  return { png: await compose(productShell({ background: '#1a1d22', body, css: CSS })) };
}
