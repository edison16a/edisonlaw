import { circle, fillRect, fillRound, strokeRound, type Rect } from '../../../draw/shapes';
import { text, textRun } from '../../../draw/text';
import { pill } from '../../../draw/widgets';
import { ALLERGENS, IOS_APP } from './data';
import { APP_STORE_THEME as T } from './theme';

/** App Store Connect for SafeEats, zoomed in: the version page with screenshots and app details. */

/** Phones are drawn at their design size, then scaled down into the zoomed card. */
const PHONE = { w: 122, h: 250, gap: 20, scale: 0.76 };

function appIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
  gradient.addColorStop(0, '#34c759');
  gradient.addColorStop(1, '#0f7a3a');
  fillRound(ctx, x, y, size, size, size * 0.23, gradient);
  // A leaf inside a scan frame.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(x + size / 2, y + size / 2, size * 0.2, size * 0.12, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  scanCorners(ctx, { x, y, w: size, h: size }, size * 0.2, size * 0.14, 'rgba(255,255,255,0.85)');
}

/** Four corner brackets, like a camera viewfinder. */
function scanCorners(ctx: CanvasRenderingContext2D, rect: Rect, inset: number, arm: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (const [cx, cy, dx, dy] of [
    [rect.x + inset, rect.y + inset, 1, 1],
    [rect.x + rect.w - inset, rect.y + inset, -1, 1],
    [rect.x + inset, rect.y + rect.h - inset, 1, -1],
    [rect.x + rect.w - inset, rect.y + rect.h - inset, -1, -1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + dy * arm);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + dx * arm, cy);
    ctx.stroke();
  }
}

/** Grey bars standing in for lines of text. */
function lines(ctx: CanvasRenderingContext2D, x: number, y: number, widths: number[], color: string, gap = 9) {
  widths.forEach((width, index) => fillRound(ctx, x, y + index * gap, width, 4, 2, color));
}

/** Screenshot 1: the camera over an ingredient label, with the scan line at `scan` (0 top, 1 bottom). */
function scannerShot(ctx: CanvasRenderingContext2D, s: Rect, scan: number) {
  fillRect(ctx, s.x, s.y, s.w, s.h, '#2a2c2e');
  const label = { x: s.x + 18, y: s.y + 62, w: s.w - 36, h: 104 };
  fillRound(ctx, label.x, label.y, label.w, label.h, 4, '#e9e6de');
  lines(ctx, label.x + 8, label.y + 12, [48, 58, 54, 60, 40, 56, 50, 34, 58, 44], '#a8a398');
  fillRound(ctx, label.x + 6, label.y + 36, 46, 8, 3, 'rgba(255,69,58,0.55)');
  scanCorners(ctx, { x: s.x + 8, y: s.y + 50, w: s.w - 16, h: 128 }, 0, 14, '#ffffff');
  fillRect(ctx, s.x + 12, s.y + 56 + scan * 116, s.w - 24, 2, T.green);
  fillRound(ctx, s.x + 10, s.y + s.h - 40, s.w - 20, 26, 13, 'rgba(255,69,58,0.9)');
  text(ctx, '1 allergen found', s.x + s.w / 2, s.y + s.h - 26, { size: 9.5, weight: 600, family: 'sans', color: '#ffffff', align: 'center' });
}

/** Screenshot 2: the ingredient list with the flagged line marked. */
function resultsShot(ctx: CanvasRenderingContext2D, s: Rect) {
  fillRect(ctx, s.x, s.y, s.w, s.h, '#1c1c1e');
  text(ctx, 'Ingredients', s.x + 10, s.y + 34, { size: 11, weight: 700, family: 'sans', color: T.text });
  for (let i = 0; i < 8; i++) {
    const y = s.y + 56 + i * 21;
    const flagged = i === 2;
    if (flagged) fillRound(ctx, s.x + 6, y - 8, s.w - 12, 17, 4, 'rgba(255,69,58,0.18)');
    circle(ctx, s.x + 14, y, 3, flagged ? T.red : T.green);
    fillRound(ctx, s.x + 24, y - 2, [60, 44, 52, 70, 38, 56, 48, 64][i], 4, 2, flagged ? '#ff9f98' : '#5a5a5f');
  }
}

/** Screenshot 3: the allergen settings, with toggles. */
function settingsShot(ctx: CanvasRenderingContext2D, s: Rect) {
  fillRect(ctx, s.x, s.y, s.w, s.h, '#1c1c1e');
  text(ctx, 'Your allergens', s.x + 10, s.y + 34, { size: 11, weight: 700, family: 'sans', color: T.text });
  ALLERGENS.forEach(([name, on], index) => {
    const y = s.y + 60 + index * 30;
    fillRound(ctx, s.x + 6, y - 11, s.w - 12, 24, 5, '#2c2c2e');
    text(ctx, name, s.x + 13, y + 1, { size: 9.5, family: 'sans', color: T.text });
    const toggleX = s.x + s.w - 36;
    fillRound(ctx, toggleX, y - 6, 24, 14, 7, on ? T.green : '#48484a');
    circle(ctx, on ? toggleX + 17 : toggleX + 7, y + 1, 5.5, '#ffffff');
  });
}

function phone(ctx: CanvasRenderingContext2D, x: number, y: number, selected: boolean, paintScreen: (screen: Rect) => void) {
  if (selected) strokeRound(ctx, x - 5, y - 5, PHONE.w + 10, PHONE.h + 10, 22, T.blue, 2);
  fillRound(ctx, x, y, PHONE.w, PHONE.h, 18, '#0b0b0c');
  const screen = { x: x + 5, y: y + 5, w: PHONE.w - 10, h: PHONE.h - 10 };
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(screen.x, screen.y, screen.w, screen.h, 14);
  ctx.clip();
  paintScreen(screen);
  ctx.restore();
  fillRound(ctx, x + PHONE.w / 2 - 18, y + 10, 36, 9, 4.5, '#000000');
}

function screenshots(ctx: CanvasRenderingContext2D, rect: Rect, selected: number, scan: number) {
  fillRound(ctx, rect.x, rect.y, rect.w, rect.h, 8, T.surface);
  text(ctx, 'iPhone Screenshots', rect.x + 12, rect.y + 18, { size: 12, weight: 600, family: 'sans', color: T.text });
  const painters = [(s: Rect) => scannerShot(ctx, s, scan), (s: Rect) => resultsShot(ctx, s), (s: Rect) => settingsShot(ctx, s)];
  const rowWidth = (PHONE.w * 3 + PHONE.gap * 2) * PHONE.scale;
  ctx.save();
  ctx.translate(rect.x + (rect.w - rowWidth) / 2, rect.y + 36);
  ctx.scale(PHONE.scale, PHONE.scale);
  painters.forEach((paintScreen, index) => phone(ctx, index * (PHONE.w + PHONE.gap), 0, index === selected, paintScreen));
  ctx.restore();
}

function appInformation(ctx: CanvasRenderingContext2D, rect: Rect) {
  fillRound(ctx, rect.x, rect.y, rect.w, rect.h, 8, T.surface);
  strokeRound(ctx, rect.x, rect.y, rect.w, rect.h, 8, T.border);
  text(ctx, 'App Information', rect.x + 12, rect.y + 18, { size: 12, weight: 600, family: 'sans', color: T.text });
  const details = [
    ['Primary category', IOS_APP.category],
    ['Secondary category', IOS_APP.secondaryCategory],
    ['Version', IOS_APP.version],
  ];
  const columnW = (rect.w - 24) / details.length;
  details.forEach(([label, value], index) => {
    const x = rect.x + 12 + index * columnW;
    text(ctx, label, x, rect.y + 40, { size: 9.5, family: 'sans', color: T.muted });
    text(ctx, value, x, rect.y + 58, { size: 13, weight: 700, family: 'sans', color: T.text });
  });
}

export function drawAppStore(ctx: CanvasRenderingContext2D, rect: Rect, selected: number, scan: number) {
  fillRect(ctx, rect.x, rect.y, rect.w, rect.h, T.background);
  text(ctx, 'App Store Connect', rect.x + 14, rect.y + 20, { size: 13, weight: 600, family: 'sans', color: T.text });
  let tabX = rect.x + 154;
  ['Apps', 'Analytics', 'Trends'].forEach((tab) => {
    const active = tab === 'Apps';
    const after = textRun(ctx, tab, tabX, rect.y + 20, { size: 11.5, weight: active ? 600 : 400, family: 'sans', color: active ? T.text : T.muted });
    if (active) fillRect(ctx, tabX, rect.y + 34, after - tabX, 2, T.blue);
    tabX = after + 16;
  });
  fillRect(ctx, rect.x, rect.y + 40, rect.w, 1, T.border);

  const x = rect.x + 14;
  const w = rect.w - 28;
  appIcon(ctx, x, rect.y + 50, 40);
  text(ctx, IOS_APP.name, x + 50, rect.y + 62, { size: 14, weight: 700, family: 'sans', color: T.text });
  pill(ctx, `${IOS_APP.version} Ready for Distribution`, x + 50, rect.y + 82, { bg: 'rgba(48,209,88,0.14)', color: T.green, size: 9.5, dot: T.green });

  const cardsY = rect.y + 102;
  const shotsH = 36 + PHONE.h * PHONE.scale + 12;
  screenshots(ctx, { x, y: cardsY, w, h: shotsH }, selected, scan);
  appInformation(ctx, { x, y: cardsY + shotsH + 10, w, h: rect.y + rect.h - cardsY - shotsH - 10 - 12 });
}
