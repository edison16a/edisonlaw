import { gridLines, lineChart, scaleOf, yOf, type Scale } from '../../../draw/charts';
import { circle, fillRect, fillRound, strokeRound, type Rect } from '../../../draw/shapes';
import { text } from '../../../draw/text';
import { CANDLES, FIT, RETURNS, ROLLING_CORRELATION, signed, VIX, type Candle } from './market';
import { TANIUS_THEME as T } from './theme';

/** The three analysis panels on the desk app. */

const SMALL = { size: 11, family: 'mono', color: T.faint } as const;

function card(ctx: CanvasRenderingContext2D, rect: Rect, title: string, detail: string) {
  fillRound(ctx, rect.x, rect.y, rect.w, rect.h, 8, T.panel);
  strokeRound(ctx, rect.x, rect.y, rect.w, rect.h, 8, T.border);
  text(ctx, title, rect.x + 16, rect.y + 22, { size: 13.5, weight: 600, family: 'sans', color: T.text });
  text(ctx, detail, rect.x + rect.w - 16, rect.y + 22, { size: 12, family: 'sans', color: T.muted, align: 'right' });
}

/** SPY candles with the front month VIX future on its own scale, `live` nudging the last close. */
export function candlePanel(ctx: CanvasRenderingContext2D, rect: Rect, live: number) {
  card(ctx, rect, 'SPY daily vs VIX futures', '3M   1D candles');
  const plot = { x: rect.x + 46, y: rect.y + 44, w: rect.w - 112, h: rect.h - 64 };
  const candles: Candle[] = CANDLES.map((candle, index) =>
    index === CANDLES.length - 1 ? { ...candle, close: candle.close + live, high: Math.max(candle.high, candle.close + live) } : candle,
  );
  const prices = candles.flatMap((candle) => [candle.high, candle.low]);
  const priceScale = scaleOf(prices, 0.06);
  const vixScale: Scale = scaleOf(VIX, 0.3);
  gridLines(ctx, plot, 4, T.grid);
  for (let i = 0; i <= 4; i++) {
    const y = plot.y + (i / 4) * plot.h;
    const price = priceScale.max - (i / 4) * (priceScale.max - priceScale.min);
    const vix = vixScale.max - (i / 4) * (vixScale.max - vixScale.min);
    text(ctx, price.toFixed(0), plot.x + plot.w + 10, y, SMALL);
    text(ctx, vix.toFixed(1), plot.x - 10, y, { ...SMALL, color: '#8a6a2e', align: 'right' });
  }

  const slot = plot.w / candles.length;
  candles.forEach((candle, index) => {
    const x = plot.x + index * slot + slot / 2;
    const color = candle.close >= candle.open ? T.up : T.down;
    fillRect(ctx, Math.round(x), yOf(plot, priceScale, candle.high), 1, yOf(plot, priceScale, candle.low) - yOf(plot, priceScale, candle.high), color);
    const top = yOf(plot, priceScale, Math.max(candle.open, candle.close));
    const bottom = yOf(plot, priceScale, Math.min(candle.open, candle.close));
    fillRect(ctx, x - slot * 0.32, top, slot * 0.64, Math.max(1, bottom - top), color);
  });
  lineChart(ctx, { ...plot, x: plot.x + slot / 2, w: plot.w - slot }, VIX, vixScale, { color: T.vix, width: 1.6 });

  const last = candles[candles.length - 1];
  const tagY = yOf(plot, priceScale, last.close);
  const up = last.close >= last.open;
  fillRect(ctx, plot.x, Math.round(tagY), plot.w, 1, up ? 'rgba(38,166,154,0.4)' : 'rgba(239,83,80,0.4)');
  fillRound(ctx, plot.x + plot.w + 4, tagY - 9, 56, 18, 3, up ? T.up : T.down);
  text(ctx, last.close.toFixed(2), plot.x + plot.w + 32, tagY + 1, { size: 11, weight: 600, family: 'mono', color: '#ffffff', align: 'center' });

  fillRect(ctx, rect.x + 212, rect.y + 22, 12, 2, T.vix);
  text(ctx, 'VX1 front month, left axis', rect.x + 230, rect.y + 23, { size: 11.5, family: 'sans', color: T.muted });
}

export function correlationPanel(ctx: CanvasRenderingContext2D, rect: Rect) {
  const current = ROLLING_CORRELATION[ROLLING_CORRELATION.length - 1];
  card(ctx, rect, 'Rolling correlation, 20d', `now ${signed(current)}`);
  const plot = { x: rect.x + 44, y: rect.y + 44, w: rect.w - 60, h: rect.h - 62 };
  const scale = { min: -1, max: 0.2 };
  gridLines(ctx, plot, 3, T.grid);
  [0, -0.5, -1].forEach((value) => text(ctx, value === 0 ? '0' : signed(value, 1), plot.x - 8, yOf(plot, scale, value), { ...SMALL, align: 'right' }));
  ctx.setLineDash([4, 4]);
  fillRect(ctx, plot.x, Math.round(yOf(plot, scale, 0)), plot.w, 1, T.faint);
  ctx.setLineDash([]);
  lineChart(ctx, plot, ROLLING_CORRELATION, scale, { color: T.blue, width: 1.8, fill: 'rgba(91,156,246,0.16)' });
  circle(ctx, plot.x + plot.w, yOf(plot, scale, current), 3.5, T.blue);
}

export function scatterPanel(ctx: CanvasRenderingContext2D, rect: Rect) {
  card(ctx, rect, 'Daily returns, SPY vs VX1', `β ${signed(FIT.beta, 1)}   R² ${FIT.r2.toFixed(2)}`);
  const plot = { x: rect.x + 20, y: rect.y + 40, w: rect.w - 40, h: rect.h - 56 };
  const xScale = { min: -0.025, max: 0.025 };
  const yScale = { min: -0.12, max: 0.12 };
  const px = (value: number) => plot.x + ((value - xScale.min) / (xScale.max - xScale.min)) * plot.w;
  fillRect(ctx, plot.x, Math.round(yOf(plot, yScale, 0)), plot.w, 1, T.grid);
  fillRect(ctx, Math.round(px(0)), plot.y, 1, plot.h, T.grid);
  ctx.globalAlpha = 0.75;
  RETURNS.forEach(([spy, vix]) => circle(ctx, px(spy), yOf(plot, yScale, vix), 2.6, T.blue));
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.moveTo(px(xScale.min), yOf(plot, yScale, FIT.intercept + FIT.beta * xScale.min));
  ctx.lineTo(px(xScale.max), yOf(plot, yScale, FIT.intercept + FIT.beta * xScale.max));
  ctx.strokeStyle = T.vix;
  ctx.lineWidth = 1.8;
  ctx.stroke();
}
