import { seededRandom } from '@/lib/math';

/** Seeded data for charts, so every screen draws the same believable numbers each time. */

interface WalkOptions {
  start: number;
  /** Average change per step. */
  drift?: number;
  /** Size of the random change per step. */
  volatility: number;
  min?: number;
  max?: number;
}

export function randomWalk(seed: number, count: number, { start, drift = 0, volatility, min = -Infinity, max = Infinity }: WalkOptions) {
  const random = seededRandom(seed);
  const values = [start];
  for (let i = 1; i < count; i++) {
    const next = values[i - 1] + drift + (random() * 2 - 1) * volatility;
    values.push(Math.min(max, Math.max(min, next)));
  }
  return values;
}

/** Moving average, keeping the length. */
export function smooth(values: number[], window: number) {
  return values.map((_, index) => {
    const from = Math.max(0, index - window + 1);
    const slice = values.slice(from, index + 1);
    return slice.reduce((sum, value) => sum + value, 0) / slice.length;
  });
}

/** `count` seeded values between `min` and `max`. */
export function randomValues(seed: number, count: number, min: number, max: number) {
  const random = seededRandom(seed);
  return Array.from({ length: count }, () => min + random() * (max - min));
}
