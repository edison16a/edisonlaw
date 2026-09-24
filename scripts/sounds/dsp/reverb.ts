import { SAMPLE_RATE, toSamples, type Signal } from './signal';

export interface ReverbOptions {
  /** Seconds for the tail to fall by 60 dB. */
  decay: number;
  /** Lowpass inside the feedback loop in Hz. Lower is a darker, softer tail. */
  damping?: number;
  /** Scales the delay lengths: below 1 is a small room, above 1 a bigger space. */
  size?: number;
  /** Silence before the tail starts, in seconds. */
  preDelay?: number;
  /** Extra time rendered after the input ends, in seconds. Defaults to the decay time. */
  tail?: number;
}

/** Mutually prime delay lengths (about 23 to 58 ms), so echoes never line up into a pitch. */
const DELAYS = [1031, 1327, 1523, 1709, 1913, 2111, 2297, 2539];
const LINES = DELAYS.length;
const INPUT_SIGNS = [1, -1, 1, 1, -1, 1, -1, -1];
const HADAMARD_SCALE = 1 / Math.sqrt(LINES);

/** In place fast Walsh Hadamard transform of 8 values, the lossless mixing matrix of the network. */
function hadamard(v: Float64Array) {
  for (let size = 1; size < LINES; size *= 2) {
    for (let start = 0; start < LINES; start += size * 2) {
      for (let i = start; i < start + size; i++) {
        const a = v[i];
        const b = v[i + size];
        v[i] = a + b;
        v[i + size] = a - b;
      }
    }
  }
  for (let i = 0; i < LINES; i++) v[i] *= HADAMARD_SCALE;
}

/**
 * Feedback delay network reverb (eight lines, Hadamard feedback, damped loop).
 * Returns only the wet signal, longer than the input by the pre delay plus the tail.
 */
export function reverb(input: Signal, { decay, damping = 5000, size = 1, preDelay = 0, tail = decay }: ReverbOptions): Signal {
  const lengths = DELAYS.map((delay) => Math.max(16, Math.round(delay * size)));
  const lines = lengths.map((length) => new Float32Array(length));
  const heads = new Int32Array(LINES);
  const feedback = lengths.map((length) => Math.pow(10, (-3 * length) / (decay * SAMPLE_RATE)));
  const dampK = 1 - Math.exp((-2 * Math.PI * damping) / SAMPLE_RATE);
  const damped = new Float64Array(LINES);
  const v = new Float64Array(LINES);

  const pre = toSamples(preDelay);
  const out = new Float32Array(input.length + pre + toSamples(tail));
  for (let n = 0; n < out.length; n++) {
    const inIndex = n - pre;
    const x = inIndex >= 0 && inIndex < input.length ? input[inIndex] : 0;

    let y = 0;
    for (let i = 0; i < LINES; i++) {
      const value = lines[i][heads[i]];
      y += i & 1 ? -value : value;
      damped[i] += dampK * (value - damped[i]);
      v[i] = damped[i];
    }
    out[n] = y * HADAMARD_SCALE;

    hadamard(v);
    for (let i = 0; i < LINES; i++) {
      lines[i][heads[i]] = v[i] * feedback[i] + x * INPUT_SIGNS[i] * HADAMARD_SCALE;
      heads[i] = heads[i] + 1 === lengths[i] ? 0 : heads[i] + 1;
    }
  }
  return out;
}
