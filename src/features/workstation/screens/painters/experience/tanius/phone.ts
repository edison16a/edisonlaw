import { lineChart, scaleOf } from '../../../draw/charts';
import { drawIcon, type IconName } from '../../../draw/icons';
import { fillRect, fillRound, roundRectPath, strokeRound, type Rect } from '../../../draw/shapes';
import { text } from '../../../draw/text';
import { avatar } from '../../../draw/widgets';
import { FIT, ROLLING_CORRELATION, signed } from './market';
import { FLUTTER_THEME as F } from './theme';

/** The Flutter app running in the iOS Simulator: Material 3 dark with the default purple seed. */

function statusBar(ctx: CanvasRenderingContext2D, screen: Rect) {
  const y = screen.y + 24;
  text(ctx, '9:41', screen.x + 34, y, { size: 14, weight: 600, family: 'sans', color: F.onSurface });
  const right = screen.x + screen.w - 28;
  fillRound(ctx, right - 24, y - 6, 22, 11, 3, F.onSurface);
  fillRect(ctx, right - 1, y - 2, 2, 4, F.onSurface);
  for (let i = 0; i < 4; i++) fillRect(ctx, right - 66 + i * 5, y + 4 - (i + 1) * 2.5, 3, (i + 1) * 2.5, F.onSurface);
  ctx.strokeStyle = F.onSurface;
  ctx.lineWidth = 1.8;
  for (let i = 1; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(right - 36, y + 5, i * 4, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();
  }
}

function heroCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, correlation: string) {
  fillRound(ctx, x, y, w, 146, 16, F.container);
  text(ctx, 'SPY and VX1 correlation', x + 16, y + 22, { size: 12.5, family: 'sans', color: F.onSurfaceVariant });
  text(ctx, correlation, x + 16, y + 58, { size: 36, weight: 600, family: 'sans', color: F.primary });
  fillRound(ctx, x + w - 78, y + 12, 62, 24, 8, F.secondaryContainer);
  text(ctx, '20 day', x + w - 47, y + 25, { size: 11.5, weight: 600, family: 'sans', color: F.onSurface, align: 'center' });
  lineChart(ctx, { x: x + 16, y: y + 86, w: w - 32, h: 46 }, ROLLING_CORRELATION, scaleOf(ROLLING_CORRELATION), {
    color: F.primary,
    width: 2,
    fill: 'rgba(208,188,255,0.22)',
  });
}

const SEGMENTS = ['1D', '1W', '1M', '3M'];
const NAV: { icon: IconName; label: string }[] = [
  { icon: 'home', label: 'Home' },
  { icon: 'chart', label: 'Charts' },
  { icon: 'bell', label: 'Alerts' },
  { icon: 'gear', label: 'Settings' },
];

export interface Quote {
  price: string;
  change: string;
  up: boolean;
}

export interface PhoneQuotes {
  spy: Quote;
  vx1: Quote;
}

export function drawPhone(ctx: CanvasRenderingContext2D, frame: Rect, quotes: PhoneQuotes) {
  fillRound(ctx, frame.x, frame.y, frame.w, frame.h, 46, '#1c1c1e');
  strokeRound(ctx, frame.x, frame.y, frame.w, frame.h, 46, '#48484a', 2);
  const screen = { x: frame.x + 10, y: frame.y + 10, w: frame.w - 20, h: frame.h - 20 };
  // Everything on the display is clipped to its rounded corners.
  ctx.save();
  roundRectPath(ctx, screen.x, screen.y, screen.w, screen.h, 37);
  ctx.clip();
  fillRect(ctx, screen.x, screen.y, screen.w, screen.h, F.surface);
  fillRound(ctx, screen.x + screen.w / 2 - 46, screen.y + 11, 92, 26, 13, '#000000');
  statusBar(ctx, screen);

  const x = screen.x + 16;
  const w = screen.w - 32;
  let y = screen.y + 74;
  for (let i = 0; i < 3; i++) fillRect(ctx, x + 2, y - 7 + i * 6, 18, 2, F.onSurface);
  text(ctx, 'Tanius Metrics', x + 36, y, { size: 19, family: 'sans', color: F.onSurface });
  avatar(ctx, 'E', x + w - 14, y, 14, F.secondaryContainer, F.onSurface);

  y += 36;
  const segmentW = w / SEGMENTS.length;
  strokeRound(ctx, x, y, w, 34, 17, F.outline);
  fillRound(ctx, x + segmentW * 2, y, segmentW, 34, 0, F.secondaryContainer);
  SEGMENTS.forEach((label, index) => {
    if (index > 0) fillRect(ctx, x + segmentW * index, y, 1, 34, F.outline);
    text(ctx, label, x + segmentW * (index + 0.5), y + 18, { size: 13, weight: 600, family: 'sans', color: F.onSurface, align: 'center' });
  });

  y += 50;
  heroCard(ctx, x, y, w, signed(ROLLING_CORRELATION[ROLLING_CORRELATION.length - 1]));

  y += 160;
  const tiles: { label: string; value: string; change?: Quote }[] = [
    { label: 'Beta to VX1', value: signed(FIT.beta, 1) },
    { label: 'Hedge ratio', value: (1 / Math.abs(FIT.beta)).toFixed(2) },
    { label: 'SPY', value: quotes.spy.price, change: quotes.spy },
    { label: 'VX1', value: quotes.vx1.price, change: quotes.vx1 },
  ];
  const tileW = (w - 10) / 2;
  tiles.forEach((tile, index) => {
    const tx = x + (index % 2) * (tileW + 10);
    const ty = y + Math.floor(index / 2) * 72;
    fillRound(ctx, tx, ty, tileW, 62, 12, F.containerHigh);
    text(ctx, tile.label, tx + 12, ty + 20, { size: 11.5, family: 'sans', color: F.onSurfaceVariant });
    if (tile.change) {
      const color = tile.change.up ? '#7fd8a8' : '#ffb4ab';
      text(ctx, tile.change.change, tx + tileW - 10, ty + 20, { size: 11, weight: 600, family: 'sans', color, align: 'right' });
    }
    text(ctx, tile.value, tx + 12, ty + 44, { size: 17, weight: 600, family: 'sans', color: F.onSurface });
  });

  const navY = screen.y + screen.h - 92;
  fillRect(ctx, screen.x, navY, screen.w, 70, F.container);
  const navW = screen.w / NAV.length;
  NAV.forEach((item, index) => {
    const cx = screen.x + navW * (index + 0.5);
    if (index === 1) fillRound(ctx, cx - 28, navY + 10, 56, 30, 15, F.secondaryContainer);
    drawIcon(ctx, item.icon, cx, navY + 25, 20, F.onSurface, 1.6);
    text(ctx, item.label, cx, navY + 54, { size: 11, weight: index === 1 ? 700 : 500, family: 'sans', color: index === 1 ? F.onSurface : F.onSurfaceVariant, align: 'center' });
  });
  fillRect(ctx, screen.x, navY + 70, screen.w, screen.y + screen.h - navY - 70, F.container);
  fillRound(ctx, screen.x + screen.w / 2 - 60, screen.y + screen.h - 12, 120, 4, 2, F.onSurface);
  ctx.restore();
}
