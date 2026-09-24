import { step } from '../../../anim/timeline';
import { fillRect } from '../../../draw/shapes';
import { text, textRun } from '../../../draw/text';
import { SCREEN_HEIGHT, SCREEN_WIDTH, type PainterFactory } from '../../../types';
import { candlePanel, correlationPanel, scatterPanel } from './charts';
import { CANDLES, VIX } from './market';
import { drawPhone } from './phone';
import { TANIUS_THEME as T } from './theme';

const TOP = 46;
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

function topBar(ctx: CanvasRenderingContext2D, live: number) {
  fillRect(ctx, 0, 0, SCREEN_WIDTH, TOP, '#0d1119');
  fillRect(ctx, 0, TOP - 1, SCREEN_WIDTH, 1, T.border);
  const after = textRun(ctx, 'Tanius', 20, TOP / 2 + 1, { size: 16, weight: 700, family: 'sans', color: T.text });
  textRun(ctx, ' Analytics', after, TOP / 2 + 1, { size: 16, family: 'sans', color: T.muted });
  const { spy, spyChange, vx1, vxChange } = quotes(live);
  const tickers = [
    ['SPY', spy.toFixed(2), spyChange],
    ['VX1', vx1.toFixed(2), vxChange],
    ['VX2', (vx1 + 1.05).toFixed(2), vxChange * 0.7],
    ['QQQ', '489.10', 0.52],
  ] as const;
  let x = 190;
  for (const [symbol, price, change] of tickers) {
    x = textRun(ctx, symbol, x, TOP / 2 + 1, { size: 12.5, weight: 700, family: 'mono', color: T.text });
    x = textRun(ctx, ` ${price} `, x, TOP / 2 + 1, { size: 12.5, family: 'mono', color: T.muted });
    x = textRun(ctx, pct(change), x, TOP / 2 + 1, { size: 12.5, family: 'mono', color: change >= 0 ? T.up : T.down }) + 26;
  }
}

/** Tanius trading analytics: SPY against VIX futures, with the Flutter app in the simulator. */
export const tanius: PainterFactory = () => ({
  stillTime: 0,
  frameKey: (time) => String(step(time, 2) % WIGGLE.length),
  paint(ctx, time) {
    const live = WIGGLE[step(time, 2) % WIGGLE.length];
    fillRect(ctx, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, T.background);
    topBar(ctx, live);
    const x = 16;
    const w = 880;
    candlePanel(ctx, { x, y: TOP + 14, w, h: 360 }, live);
    const lowerY = TOP + 388;
    const lowerH = SCREEN_HEIGHT - lowerY - 16;
    correlationPanel(ctx, { x, y: lowerY, w: 480, h: lowerH });
    scatterPanel(ctx, { x: x + 494, y: lowerY, w: w - 494, h: lowerH });

    text(ctx, 'iPhone 15 Pro, iOS 17.5', 1082, TOP + 22, { size: 12, family: 'sans', color: T.faint, align: 'center' });
    const { spy, spyChange, vx1, vxChange } = quotes(live);
    drawPhone(ctx, { x: 936, y: TOP + 38, w: 292, h: SCREEN_HEIGHT - TOP - 50 }, {
      spy: { price: spy.toFixed(2), change: pct(spyChange), up: spyChange >= 0 },
      vx1: { price: vx1.toFixed(2), change: pct(vxChange), up: vxChange >= 0 },
    });
  },
});
