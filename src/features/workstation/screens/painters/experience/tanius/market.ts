import { seededRandom } from '@/lib/math';

/**
 * A seeded market: SPY daily candles and the front month VIX future moving against it.
 * The correlation and fit are computed from the returns, not made up.
 */

export const DAYS = 64;

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

function gaussian(random: () => number) {
  return Math.sqrt(-2 * Math.log(1 - random() * 0.999)) * Math.cos(2 * Math.PI * random());
}

const random = seededRandom(2024);
const spyReturns: number[] = [];
const vixReturns: number[] = [];
for (let i = 0; i < DAYS; i++) {
  const spy = 0.0006 + gaussian(random) * 0.008;
  spyReturns.push(spy);
  vixReturns.push(-3.9 * spy + gaussian(random) * 0.028);
}

export const CANDLES: Candle[] = [];
export const VIX: number[] = [];
let close = 548;
let vix = 16.2;
for (let i = 0; i < DAYS; i++) {
  const open = close * (1 + gaussian(random) * 0.0025);
  close = open * (1 + spyReturns[i]);
  const high = Math.max(open, close) * (1 + random() * 0.004);
  const low = Math.min(open, close) * (1 - random() * 0.004);
  CANDLES.push({ open, high, low, close });
  vix *= 1 + vixReturns[i];
  VIX.push(vix);
}

function correlation(a: number[], b: number[]) {
  const meanA = a.reduce((sum, value) => sum + value, 0) / a.length;
  const meanB = b.reduce((sum, value) => sum + value, 0) / b.length;
  let covariance = 0;
  let varianceA = 0;
  let varianceB = 0;
  a.forEach((value, index) => {
    covariance += (value - meanA) * (b[index] - meanB);
    varianceA += (value - meanA) ** 2;
    varianceB += (b[index] - meanB) ** 2;
  });
  return covariance / Math.sqrt(varianceA * varianceB);
}

/** 20 day rolling correlation of daily returns. */
export const ROLLING_CORRELATION = spyReturns.map((_, index) => {
  const from = Math.max(0, index - 19);
  return index < 5 ? NaN : correlation(spyReturns.slice(from, index + 1), vixReturns.slice(from, index + 1));
}).filter((value) => !Number.isNaN(value));

export const RETURNS = spyReturns.map((spy, index) => [spy, vixReturns[index]] as const);

/** Least squares slope of VIX future returns on SPY returns, and R squared. */
export const FIT = (() => {
  const r = correlation(spyReturns, vixReturns);
  const meanS = spyReturns.reduce((sum, value) => sum + value, 0) / DAYS;
  const meanV = vixReturns.reduce((sum, value) => sum + value, 0) / DAYS;
  let covariance = 0;
  let variance = 0;
  spyReturns.forEach((value, index) => {
    covariance += (value - meanS) * (vixReturns[index] - meanV);
    variance += (value - meanS) ** 2;
  });
  const beta = covariance / variance;
  return { beta, intercept: meanV - beta * meanS, r2: r * r, r };
})();

/** Signed number with a real minus sign. */
export const signed = (value: number, digits = 2) => `${value < 0 ? '−' : '+'}${Math.abs(value).toFixed(digits)}`;
