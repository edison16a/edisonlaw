import { createOccurrence, occurrence, type Recurring } from './timeline';

const first = createOccurrence();
const echo = createOccurrence();
const TIMING: Recurring = { period: 3.7, duration: 0.19, ease: 0.075 };

/** Seconds between the two blinks of a double blink. */
const DOUBLE_GAP = 0.26;

/**
 * How shut the eyes are at time `t`: a quick blink every few seconds, sometimes a double blink.
 * Pure function of time, so a frozen frame is stable.
 */
export function blinkAt(t: number, seed: number) {
  const single = occurrence(t, TIMING, seed, first).weight;
  occurrence(t - DOUBLE_GAP, TIMING, seed, echo);
  const double = echo.roll < 0.3 ? echo.weight : 0;
  return Math.max(single, double);
}
