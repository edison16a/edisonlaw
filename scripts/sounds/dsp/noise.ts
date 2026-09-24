import type { Random } from './random';
import { silence, type Signal } from './signal';

/** Every noise colour comes out at the same RMS, so recipes can mix them by ear. */
const NOISE_RMS = 0.25;

function normalise(signal: Signal): Signal {
  let sum = 0;
  for (let i = 0; i < signal.length; i++) sum += signal[i] * signal[i];
  const rms = Math.sqrt(sum / Math.max(1, signal.length));
  if (rms > 0) for (let i = 0; i < signal.length; i++) signal[i] *= NOISE_RMS / rms;
  return signal;
}

export function whiteNoise(seconds: number, random: Random): Signal {
  const out = silence(seconds);
  for (let i = 0; i < out.length; i++) out[i] = random() * 2 - 1;
  return normalise(out);
}

/** Pink noise (3 dB per octave) using Paul Kellet's refined filter bank. */
export function pinkNoise(seconds: number, random: Random): Signal {
  const out = silence(seconds);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let b3 = 0;
  let b4 = 0;
  let b5 = 0;
  let b6 = 0;
  for (let i = 0; i < out.length; i++) {
    const white = random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    out[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    b6 = white * 0.115926;
  }
  return normalise(out);
}

/** Brown noise (6 dB per octave): a leaky running sum of white noise, deep and rumbly. */
export function brownNoise(seconds: number, random: Random): Signal {
  const out = silence(seconds);
  let last = 0;
  for (let i = 0; i < out.length; i++) {
    last = last * 0.998 + (random() * 2 - 1) * 0.02;
    out[i] = last;
  }
  return normalise(out);
}
