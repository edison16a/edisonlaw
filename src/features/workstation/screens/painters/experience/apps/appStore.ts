import { barChart } from '../../../draw/charts';
import { drawIcon } from '../../../draw/icons';
import { fillRect, fillRound, strokeRound, type Rect } from '../../../draw/shapes';
import { text, textRun } from '../../../draw/text';
import { pill, progressBar } from '../../../draw/widgets';
import { DOWNLOADS } from './data';
import { APP_STORE_THEME as T } from './theme';

/** App Store Connect analytics for SafeEats: headline metrics, daily downloads and ratings. */

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
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2;
  const inset = size * 0.2;
  const arm = size * 0.14;
  for (const [cx, cy, dx, dy] of [
    [x + inset, y + inset, 1, 1],
    [x + size - inset, y + inset, -1, 1],
    [x + inset, y + size - inset, 1, -1],
    [x + size - inset, y + size - inset, -1, -1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + dy * arm);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + dx * arm, cy);
    ctx.stroke();
  }
}

function metric(ctx: CanvasRenderingContext2D, rect: Rect, label: string, value: string, change: string) {
  fillRound(ctx, rect.x, rect.y, rect.w, rect.h, 10, T.surface);
  text(ctx, label, rect.x + 14, rect.y + 22, { size: 11.5, family: 'sans', color: T.muted });
  text(ctx, value, rect.x + 14, rect.y + 50, { size: 22, weight: 700, family: 'sans', color: T.text });
  text(ctx, change, rect.x + 14, rect.y + 74, { size: 11.5, weight: 600, family: 'sans', color: T.green });
}

export function drawAppStore(ctx: CanvasRenderingContext2D, rect: Rect, hover: number, downloads: number) {
  fillRect(ctx, rect.x, rect.y, rect.w, rect.h, T.background);
  text(ctx, 'App Store Connect', rect.x + 20, rect.y + 28, { size: 15, weight: 600, family: 'sans', color: T.text });
  let tabX = rect.x + 190;
  ['Apps', 'Analytics', 'Trends', 'Payments'].forEach((tab) => {
    const active = tab === 'Analytics';
    const after = textRun(ctx, tab, tabX, rect.y + 28, { size: 13, weight: active ? 600 : 400, family: 'sans', color: active ? T.text : T.muted });
    if (active) fillRect(ctx, tabX, rect.y + 46, after - tabX, 2, T.blue);
    tabX = after + 22;
  });
  fillRect(ctx, rect.x, rect.y + 56, rect.w, 1, T.border);

  const x = rect.x + 20;
  const w = rect.w - 40;
  appIcon(ctx, x, rect.y + 74, 58);
  text(ctx, 'SafeEats: Food Scanner', x + 72, rect.y + 94, { size: 17, weight: 700, family: 'sans', color: T.text });
  text(ctx, 'iOS App, Health and Fitness', x + 72, rect.y + 116, { size: 12.5, family: 'sans', color: T.muted });
  pill(ctx, '1.4.2 Ready for Distribution', x + w - 196, rect.y + 104, { bg: 'rgba(48,209,88,0.14)', color: T.green, size: 11, dot: T.green });

  const metricsY = rect.y + 150;
  const metricW = (w - 20) / 3;
  metric(ctx, { x, y: metricsY, w: metricW, h: 88 }, 'Impressions', '48.2K', '+12% vs last month');
  metric(ctx, { x: x + metricW + 10, y: metricsY, w: metricW, h: 88 }, 'Product page views', '6,130', '+8% vs last month');
  metric(ctx, { x: x + (metricW + 10) * 2, y: metricsY, w: metricW, h: 88 }, 'First time downloads', downloads.toLocaleString('en-US'), '+17% vs last month');

  const chart = { x, y: metricsY + 102, w, h: 236 };
  fillRound(ctx, chart.x, chart.y, chart.w, chart.h, 10, T.surface);
  text(ctx, 'Downloads, last 30 days', chart.x + 14, chart.y + 22, { size: 13, weight: 600, family: 'sans', color: T.text });
  const plot = { x: chart.x + 14, y: chart.y + 42, w: chart.w - 28, h: chart.h - 58 };
  barChart(ctx, plot, DOWNLOADS, 150, { color: (index) => (index === hover ? '#5eb1ff' : T.blue), gap: 3, radius: 2 });
  const slot = plot.w / DOWNLOADS.length;
  const tipX = Math.min(plot.x + hover * slot - 20, plot.x + plot.w - 92);
  fillRound(ctx, tipX, plot.y, 92, 40, 6, '#3a3a3e');
  text(ctx, `Sep ${hover + 1}`, tipX + 10, plot.y + 13, { size: 11, family: 'sans', color: T.muted });
  text(ctx, `${Math.round(DOWNLOADS[hover])} downloads`, tipX + 10, plot.y + 29, { size: 11.5, weight: 600, family: 'sans', color: T.text });

  const ratings = { x, y: chart.y + chart.h + 12, w, h: rect.y + rect.h - chart.y - chart.h - 32 };
  fillRound(ctx, ratings.x, ratings.y, ratings.w, ratings.h, 10, T.surface);
  strokeRound(ctx, ratings.x, ratings.y, ratings.w, ratings.h, 10, T.border);
  text(ctx, '4.8', ratings.x + 18, ratings.y + 44, { size: 38, weight: 700, family: 'sans', color: T.text });
  for (let i = 0; i < 5; i++) drawIcon(ctx, 'star', ratings.x + 100 + i * 18, ratings.y + 34, 15, T.star, 1.5);
  text(ctx, '312 ratings', ratings.x + 92, ratings.y + 56, { size: 12, family: 'sans', color: T.muted });
  [0.86, 0.09, 0.03, 0.01, 0.01].forEach((share, index) => {
    const y = ratings.y + 22 + index * 15;
    text(ctx, String(5 - index), ratings.x + 214, y, { size: 10.5, family: 'sans', color: T.muted, align: 'right' });
    progressBar(ctx, ratings.x + 222, y - 3, ratings.w - 244, 6, share, T.muted, '#3a3a3e');
  });

  const stats = [
    ['Crash free sessions', '99.8%'],
    ['Day 7 retention', '41%'],
    ['Allergens checked', '1,500'],
  ];
  const statW = (ratings.w - 36) / stats.length;
  fillRect(ctx, ratings.x + 18, ratings.y + 104, ratings.w - 36, 1, T.border);
  stats.forEach(([label, value], index) => {
    const sx = ratings.x + 18 + index * statW;
    text(ctx, label, sx, ratings.y + 126, { size: 11.5, family: 'sans', color: T.muted });
    text(ctx, value, sx, ratings.y + 150, { size: 17, weight: 700, family: 'sans', color: T.text });
  });
}
