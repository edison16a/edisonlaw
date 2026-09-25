import type { Frequency } from './oscillators';
import { SAMPLE_RATE, type Signal } from './signal';

export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'peaking';

interface Coefficients {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
}

/** How often a swept filter recomputes its coefficients, in samples. */
const SWEEP_STEP = 16;

/** Biquad coefficients from the RBJ audio EQ cookbook, normalised so a0 is 1. */
export function coefficients(type: FilterType, frequency: number, q: number, gainDb = 0): Coefficients {
  const f = Math.min(Math.max(frequency, 10), SAMPLE_RATE * 0.49);
  const w = (2 * Math.PI * f) / SAMPLE_RATE;
  const cos = Math.cos(w);
  const alpha = Math.sin(w) / (2 * q);
  let b0: number;
  let b1: number;
  let b2: number;
  let a0: number;
  let a1: number;
  let a2: number;

  switch (type) {
    case 'lowpass':
      [b0, b1, b2] = [(1 - cos) / 2, 1 - cos, (1 - cos) / 2];
      [a0, a1, a2] = [1 + alpha, -2 * cos, 1 - alpha];
      break;
    case 'highpass':
      [b0, b1, b2] = [(1 + cos) / 2, -(1 + cos), (1 + cos) / 2];
      [a0, a1, a2] = [1 + alpha, -2 * cos, 1 - alpha];
      break;
    case 'bandpass':
      // Constant 0 dB peak gain, so sweeping it keeps the level steady.
      [b0, b1, b2] = [alpha, 0, -alpha];
      [a0, a1, a2] = [1 + alpha, -2 * cos, 1 - alpha];
      break;
    case 'peaking': {
      const amp = Math.pow(10, gainDb / 40);
      [b0, b1, b2] = [1 + alpha * amp, -2 * cos, 1 - alpha * amp];
      [a0, a1, a2] = [1 + alpha / amp, -2 * cos, 1 - alpha / amp];
      break;
    }
  }
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0 };
}

/**
 * Runs a biquad over a signal and returns a new one.
 * Pass a frequency curve to sweep it (transposed direct form II copes well with moving coefficients).
 */
export function biquad(signal: Signal, type: FilterType, frequency: Frequency, q = Math.SQRT1_2, gainDb = 0): Signal {
  const out = new Float32Array(signal.length);
  const swept = typeof frequency === 'function';
  let c = coefficients(type, swept ? frequency(0) : frequency, q, gainDb);
  let z1 = 0;
  let z2 = 0;
  for (let i = 0; i < signal.length; i++) {
    if (swept && i % SWEEP_STEP === 0) c = coefficients(type, frequency(i / SAMPLE_RATE), q, gainDb);
    const x = signal[i];
    const y = c.b0 * x + z1;
    z1 = c.b1 * x - c.a1 * y + z2;
    z2 = c.b2 * x - c.a2 * y;
    out[i] = y;
  }
  return out;
}

export const lowpass = (signal: Signal, frequency: Frequency, q?: number) => biquad(signal, 'lowpass', frequency, q);
export const bandpass = (signal: Signal, frequency: Frequency, q?: number) => biquad(signal, 'bandpass', frequency, q);

/** Gentle 6 dB per octave lowpass, in place. Useful for damping and muffling. */
export function onePoleLowpass(signal: Signal, frequency: number): Signal {
  const k = 1 - Math.exp((-2 * Math.PI * frequency) / SAMPLE_RATE);
  let state = 0;
  for (let i = 0; i < signal.length; i++) {
    state += k * (signal[i] - state);
    signal[i] = state;
  }
  return signal;
}

/** 6 dB per octave highpass, in place. At around 15 Hz it doubles as a DC blocker. */
export function onePoleHighpass(signal: Signal, frequency: number): Signal {
  const r = Math.exp((-2 * Math.PI * frequency) / SAMPLE_RATE);
  let lastIn = 0;
  let lastOut = 0;
  for (let i = 0; i < signal.length; i++) {
    const x = signal[i];
    lastOut = x - lastIn + r * lastOut;
    lastIn = x;
    signal[i] = lastOut;
  }
  return signal;
}
