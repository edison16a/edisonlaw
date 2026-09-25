/**
 * Pieces for the crafted product shots: whole product screens drawn as HTML and CSS, rather
 * than screenshots laid out on a background. Used by the recipes for TrashGo, SensePlan,
 * CallSense, FlameSense, SunBlock and Text & Image Replacer.
 *
 * Everything is set in Geist, embedded from the site's own `geist` package, so the render needs
 * no font from the network and every shot shares one typeface.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { shell } from './base.mjs';

const require = createRequire(import.meta.url);
const GEIST = join(dirname(require.resolve('geist/font')), 'fonts');

let fontCss;
/** @font-face rules for Geist Sans and Geist Mono, as data URLs. */
export function fonts() {
  if (!fontCss) {
    const face = (family, file) => {
      const data = readFileSync(join(GEIST, file)).toString('base64');
      return `@font-face { font-family: '${family}'; src: url(data:font/woff2;base64,${data}) format('woff2'); font-weight: 100 900; font-style: normal; }`;
    };
    fontCss = [face('Geist', 'geist-sans/Geist-Variable.woff2'), face('Geist Mono', 'geist-mono/GeistMono-Variable.woff2')].join('\n');
  }
  return fontCss;
}

/** Base type and resets shared by every product shot. */
const BASE_CSS = `
* { box-sizing: border-box; }
body { font-family: 'Geist', sans-serif; font-size: 14px; line-height: 1.45; -webkit-font-smoothing: antialiased; font-feature-settings: 'ss01' 0; }
.num { font-variant-numeric: tabular-nums; }
.mono { font-family: 'Geist Mono', monospace; }
svg { display: block; flex: none; }
p, h1, h2, h3, h4, ul { margin: 0; padding: 0; }
ul { list-style: none; }
`;

/** A full card sized page, with Geist and the base styles. */
export function productShell({ background, body, css = '' }) {
  return shell({ background, body, css: `${fonts()}\n${BASE_CSS}\n${css}` });
}

/**
 * Stroke icons in the style of Lucide (ISC licence), drawn at 24 x 24.
 * `icon(name, { size, stroke, width })` returns an inline SVG.
 */
const ICONS = {
  back: '<path d="m15 18-6-6 6-6"/>',
  forward: '<path d="m9 18 6-6-6-6"/>',
  reload: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
  puzzle: '<path d="M19.4 14.6a2 2 0 1 0 0-3.2V8a1 1 0 0 0-1-1h-3.4a2 2 0 1 0-3.2 0H8.4a1 1 0 0 0-1 1v3.4a2 2 0 1 0 0 3.2V18a1 1 0 0 0 1 1h3.4a2 2 0 1 1 3.2 0h3.4a1 1 0 0 0 1-1z"/>',
  more: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  pin: '<path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  highlight: '<path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M6.3 17.7l2.5-2.5M15.2 8.8l2.5-2.5"/>',
  phoneOff: '<path d="M10.7 13.3a16 16 0 0 0 3.4 2.6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9"/><path d="M22 2 2 22"/>',
  upload: '<path d="M12 15V3M7 8l5-5 5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  type: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  crosshair: '<circle cx="12" cy="12" r="9"/><path d="M22 12h-4M6 12H2M12 6V2M12 22v-4"/>',
  wind: '<path d="M12.8 19.6A2 2 0 1 0 14 16H2M17.5 8a2.5 2.5 0 1 1 2 4H2M9.8 4.4A2 2 0 1 1 11 8H2"/>',
  thermo: '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/>',
  droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5S12.5 5.5 12 2.5c-.5 3-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.3 19a10 10 0 1 1 17.4 0"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.3.3 1.8 1.5 2.8 2.5 2.8z"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  play: '<path d="M7 4v16l13-8z"/>',
  send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  bag: '<path d="M6 7h12l1 13H5z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/>',
  recycle: '<path d="M7 19H4.8a1.8 1.8 0 0 1-1.6-2.7l3.9-6.7"/><path d="m11 19 3 3v-6zM9.1 5.3 11 2l1.9 3.3M14 19h5.2a1.8 1.8 0 0 0 1.6-2.7l-1.3-2.3M16.8 9.5 13 3M4 11l3-5 3 5z" /><path d="M20 12l-2.2-3.8L14 10"/>',
  trash: '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"/>',
  map: '<path d="m9 4-6 3v13l6-3 6 3 6-3V4l-6 3z"/><path d="M9 4v13M15 7v13"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
};

export function icon(name, { size = 16, stroke = 'currentColor', width = 1.75, fill = 'none' } = {}) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
}

/**
 * A desktop Chrome window in its light theme: one tab, the address bar and pinned extensions.
 * `extensions` is HTML for the pinned extension buttons at the right of the toolbar.
 * `page` fills the viewport below the toolbar. `zoom` enlarges the whole window, as a browser's
 * own zoom would, while `x`, `y`, `width` and `height` stay in card pixels.
 */
export function browserWindow({ x, y, width, height, tab, favicon, url, extensions = '', page, zoom = 1 }) {
  const z = (value) => (value / zoom).toFixed(2);
  const [host, ...rest] = url.split('/');
  const path = rest.length ? `/${rest.join('/')}` : '';
  return `
<div class="bw" style="zoom: ${zoom}; left: ${z(x)}px; top: ${z(y)}px; width: ${z(width)}px; height: ${z(height)}px;">
  <div class="bw-tabs">
    <div class="bw-lights"><i></i><i></i><i></i></div>
    <div class="bw-tab">${favicon}<span>${tab}</span>${icon('x', { size: 13, width: 2 })}</div>
    <div class="bw-newtab">${icon('plus', { size: 15, width: 2 })}</div>
  </div>
  <div class="bw-bar">
    <div class="bw-nav">${icon('back', { size: 17 })}${icon('forward', { size: 17 })}${icon('reload', { size: 15 })}</div>
    <div class="bw-omni">${icon('lock', { size: 13, width: 2 })}<span><b>${host}</b>${path}</span>${icon('star', { size: 15 })}</div>
    <div class="bw-ext">${extensions}<span class="bw-ext-btn">${icon('puzzle', { size: 16 })}</span><span class="bw-avatar">E</span>${icon('more', { size: 16, width: 2.25 })}</div>
  </div>
  <div class="bw-page">${page}</div>
</div>`;
}

export const BROWSER_CSS = `
.bw { position: absolute; border-radius: 14px; overflow: hidden; background: #fff; box-shadow: 0 0 0 1px rgba(15, 18, 30, 0.08), 0 30px 70px -20px rgba(15, 18, 30, 0.35), 0 10px 24px -10px rgba(15, 18, 30, 0.18); display: flex; flex-direction: column; }
.bw-tabs { height: 44px; background: #e9ecf1; display: flex; align-items: flex-end; padding: 0 12px; gap: 6px; flex: none; }
.bw-lights { display: flex; gap: 8px; align-self: center; margin: 0 14px 0 6px; }
.bw-lights i { width: 12px; height: 12px; border-radius: 50%; background: #d3d7de; display: block; }
.bw-tab { height: 36px; width: 240px; background: #fff; border-radius: 10px 10px 0 0; display: flex; align-items: center; gap: 9px; padding: 0 12px; font-size: 12.5px; color: #1f2329; }
.bw-tab span { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bw-tab svg:last-child { color: #7a818c; }
.bw-newtab { align-self: center; color: #5c636e; padding: 4px; }
.bw-bar { height: 48px; background: #fff; display: flex; align-items: center; gap: 14px; padding: 0 12px; border-bottom: 1px solid #e6e8ec; flex: none; }
.bw-nav { display: flex; gap: 14px; color: #5c636e; padding-left: 4px; align-items: center; }
.bw-nav svg:nth-child(2) { color: #b6bbc4; }
.bw-omni { flex: 1; height: 34px; background: #eff1f4; border-radius: 17px; display: flex; align-items: center; gap: 10px; padding: 0 14px; color: #5c636e; font-size: 13.5px; }
.bw-omni span { flex: 1; color: #6b717c; }
.bw-omni b { font-weight: 450; color: #1f2329; }
.bw-ext { display: flex; align-items: center; gap: 12px; color: #5c636e; }
.bw-ext-btn { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; position: relative; }
.bw-ext-btn.on { background: #e6eaf0; }
.bw-avatar { width: 26px; height: 26px; border-radius: 50%; background: #3f4a5a; color: #fff; font-size: 12px; font-weight: 600; display: grid; place-items: center; }
.bw-page { position: relative; flex: 1; overflow: hidden; }
`;

/** A soft, even backdrop: one colour with a faint lift toward the top. */
export function backdrop(colour, lift = 0.06) {
  return `radial-gradient(90% 70% at 50% 0%, rgba(255, 255, 255, ${lift}), transparent 70%), ${colour}`;
}
