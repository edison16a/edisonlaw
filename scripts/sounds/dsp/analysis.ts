import { SAMPLE_RATE, type Signal } from './signal';

export const toDb = (linear: number) => (linear > 0 ? 20 * Math.log10(linear) : -Infinity);
export const fromDb = (db: number) => Math.pow(10, db / 20);

export function peak(signal: Signal) {
  let max = 0;
  for (let i = 0; i < signal.length; i++) max = Math.max(max, Math.abs(signal[i]));
  return max;
}

export function rms(signal: Signal) {
  let sum = 0;
  for (let i = 0; i < signal.length; i++) sum += signal[i] * signal[i];
  return Math.sqrt(sum / Math.max(1, signal.length));
}

/** Average sample value. Anything far from zero is DC offset. */
export function mean(signal: Signal) {
  let sum = 0;
  for (let i = 0; i < signal.length; i++) sum += signal[i];
  return sum / Math.max(1, signal.length);
}

/** Loudest sample in the last `seconds`. A one-shot should have died away to near silence there. */
export function tailLevel(signal: Signal, seconds = 0.002) {
  const count = Math.min(signal.length, Math.round(seconds * SAMPLE_RATE));
  let max = 0;
  for (let i = signal.length - count; i < signal.length; i++) max = Math.max(max, Math.abs(signal[i]));
  return max;
}

/**
 * How big the jump across a loop seam is compared with an average step inside the loop.
 * About 1 means the seam is as smooth as any other point.
 */
export function seamRatio(loop: Signal) {
  let sum = 0;
  for (let i = 1; i < loop.length; i++) sum += Math.abs(loop[i] - loop[i - 1]);
  const typical = sum / Math.max(1, loop.length - 1);
  return typical > 0 ? Math.abs(loop[0] - loop[loop.length - 1]) / typical : 0;
}
