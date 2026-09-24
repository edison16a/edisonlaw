import { step } from '../../../anim/timeline';
import { fillRect } from '../../../draw/shapes';
import { text, textRun } from '../../../draw/text';
import { VIEW_HEIGHT, VIEW_WIDTH, zoomIn } from '../../../draw/view';
import type { PainterFactory } from '../../../types';
import { candlePanel, correlationPanel, scatterPanel } from './charts';
import { CANDLES, VIX } from './market';
import { drawPhone, type PhoneQuotes } from './phone';
import { TANIUS_THEME as T } from './theme';

const TOP = 30;
const MARGIN = 12;
/** The phone app is drawn at its own design size, then scaled to fit beside the charts. */
const PHONE = { w: 292, h: 624, scale: 0.61 };
/** Last price wiggles, one step every half second. */
const WIGGLE = [0, 0.42, 0.18, 0.66, 0.35, -0.12, 0.28, 0.51];

function quotes(live: number) {
  const spy = CANDLES[CANDLES.length - 1].close + live;
  const spyChange = ((spy - CANDLES[CANDLES.length - 2].close) / CANDLES[CANDLES.length - 2].close) * 100;
  const vx1 = VIX[VIX.length - 1] - live * 0.05;
  const vxChange = ((vx1 - VIX[VIX.length - 2]) / VIX[VIX.length - 2]) * 100;
  return { spy, spyChange, vx1, vxChange };
}

const pct = (value: number) => `${value < 0 ? '−' : '+'}${Math.abs(value).toFixed(2)}%`;

function phoneQuotes(live: number): PhoneQuotes {
  const { spy, spyChange, vx1, vxChange } = quotes(live);
  return {
    spy: { price: spy.toFixed(2), change: pct(spyChange), up: spyChange >= 0 },
    vx1: { price: vx1.toFixed(2), change: pct(vxChange), up: vxChange >= 0 },
  };
}

function topBar(ctx: CanvasRenderingContext2D, live: number) {
  fillRect(ctx, 0, 0, VIEW_WIDTH, TOP, '#0d1119');
  fillRect(ctx, 0, TOP - 1, VIEW_WIDTH, 1, T.border);
  const after = textRun(ctx, 'Tanius', MARGIN + 2, TOP / 2 + 1, { size: 16, weight: 700, family: 'sans', color: T.text });
  textRun(ctx, ' Analytics', after, TOP / 2 + 1, { size: 16, family: 'sans', color: T.muted });
  const { spy, spyChange, vx1, vxChange } = quotes(live);
  const tickers = [
    ['SPY', spy.toFixed(2), spyChange],
    ['VX1', vx1.toFixed(2), vxChange],
    ['VX2', (vx1 + 1.05).toFixed(2), vxChange * 0.7],
    ['QQQ', '489.10', 0.52],
  ] as const;
  let x = 160;
  for (const [symbol, price, change] of tickers) {
    x = textRun(ctx, symbol, x, TOP / 2 + 1, { size: 11, weight: 700, family: 'mono', color: T.text });
    x = textRun(ctx, ` ${price} `, x, TOP / 2 + 1, { size: 11, family: 'mono', color: T.muted });
    x = textRun(ctx, pct(change), x, TOP / 2 + 1, { size: 11, family: 'mono', color: change >= 0 ? T.up : T.down }) + 18;
  }
}

/** Tanius trading analytics, zoomed in: SPY against VIX futures, with the Flutter app in the simulator. */
export const tanius: PainterFactory = () => ({
  stillTime: 0,
  frameKey: (time) => String(step(time, 2) % WIGGLE.length),
  paint(ctx, time) {
    const live = WIGGLE[step(time, 2) % WIGGLE.length];
    zoomIn(ctx);
    fillRect(ctx, 0, 0, VIEW_WIDTH, VIEW_HEIGHT, T.background);
    topBar(ctx, live);

    const phoneW = PHONE.w * PHONE.scale;
    const phoneX = VIEW_WIDTH - MARGIN - phoneW;
    const x = MARGIN;
    const w = phoneX - MARGIN - x;
    candlePanel(ctx, { x, y: TOP + 10, w, h: 232 }, live);
    const lowerY = TOP + 252;
    const lowerH = VIEW_HEIGHT - lowerY - MARGIN;
    const half = (w - 10) / 2;
    correlationPanel(ctx, { x, y: lowerY, w: half, h: lowerH });
    scatterPanel(ctx, { x: x + half + 10, y: lowerY, w: half, h: lowerH });

    text(ctx, 'iPhone 15 Pro, iOS 17.5', phoneX + phoneW / 2, TOP + 12, { size: 10, family: 'sans', color: T.faint, align: 'center' });
    ctx.save();
    ctx.translate(phoneX, TOP + 24);
    ctx.scale(PHONE.scale, PHONE.scale);
    drawPhone(ctx, { x: 0, y: 0, w: PHONE.w, h: PHONE.h }, phoneQuotes(live));
    ctx.restore();
  },
});
