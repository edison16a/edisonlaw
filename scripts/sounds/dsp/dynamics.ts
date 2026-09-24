import { fromDb, mean, peak, rms } from './analysis';
import { gain, type Signal } from './signal';

/** Scales so the loudest sample sits at `targetDb`, in place. */
export function normalisePeak(signal: Signal, targetDb: number): Signal {
  const current = peak(signal);
  return current > 0 ? gain(signal, fromDb(targetDb) / current) : signal;
}

/** Scales so the RMS level sits at `targetDb`, in place. Best for steady sounds like loops. */
export function normaliseRms(signal: Signal, targetDb: number): Signal {
  const current = rms(signal);
  return current > 0 ? gain(signal, fromDb(targetDb) / current) : signal;
}

/** Subtracts the average, in place. Safe for loops because it cannot create a seam. */
export function removeDc(signal: Signal): Signal {
  const offset = mean(signal);
  for (let i = 0; i < signal.length; i++) signal[i] -= offset;
  return signal;
}

/**
 * Soft limiter, in place. Below the knee nothing changes; above it the level bends smoothly
 * toward the ceiling (a tanh curve) and can never pass it.
 */
export function softLimit(signal: Signal, ceilingDb = -1, knee = 0.75): Signal {
  const ceiling = fromDb(ceilingDb);
  const threshold = ceiling * knee;
  const room = ceiling - threshold;
  for (let i = 0; i < signal.length; i++) {
    const level = Math.abs(signal[i]);
    if (level <= threshold) continue;
    signal[i] = Math.sign(signal[i]) * (threshold + room * Math.tanh((level - threshold) / room));
  }
  return signal;
}
