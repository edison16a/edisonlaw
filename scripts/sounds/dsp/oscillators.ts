import { SAMPLE_RATE, silence, type Signal } from './signal';

const TAU = Math.PI * 2;

/** A frequency in Hz, fixed or following a curve over time in seconds. */
export type Frequency = number | ((t: number) => number);

const frequencyAt = (frequency: Frequency, t: number) => (typeof frequency === 'number' ? frequency : frequency(t));

/** Phase continuous sine, so pitch glides stay smooth. */
export function sine(seconds: number, frequency: Frequency, phase = 0): Signal {
  const out = silence(seconds);
  let angle = phase;
  for (let i = 0; i < out.length; i++) {
    out[i] = Math.sin(angle);
    angle += (TAU * frequencyAt(frequency, i / SAMPLE_RATE)) / SAMPLE_RATE;
    if (angle > TAU) angle -= TAU;
  }
  return out;
}

export interface Mode {
  frequency: number;
  amplitude: number;
  /** Time constant of the exponential decay, in seconds. */
  decay: number;
  phase?: number;
}

/**
 * Modal synthesis: a sum of exponentially decaying sines.
 * This is the ringing body of anything struck, from a wood block to a key cap.
 */
export function modes(seconds: number, list: Mode[]): Signal {
  const out = silence(seconds);
  for (const { frequency, amplitude, decay, phase = 0 } of list) {
    if (frequency >= SAMPLE_RATE / 2) continue;
    const step = (TAU * frequency) / SAMPLE_RATE;
    const fall = Math.exp(-1 / (decay * SAMPLE_RATE));
    let level = amplitude;
    for (let i = 0; i < out.length; i++) {
      out[i] += Math.sin(phase + step * i) * level;
      level *= fall;
      if (level < 1e-6) break;
    }
  }
  return out;
}

/** Nearest frequency that fits a whole number of cycles in `seconds`, so tones loop without a seam. */
export const loopableFrequency = (frequency: number, seconds: number) => Math.max(1, Math.round(frequency * seconds)) / seconds;

/** PolyBLEP correction for a phase `phase` (0 to 1) that wraps every cycle, `step` of a cycle per sample. */
function polyBlep(phase: number, step: number) {
  if (phase < step) {
    const x = phase / step;
    return x + x - x * x - 1;
  }
  if (phase > 1 - step) {
    const x = (phase - 1) / step;
    return x * x + x + x + 1;
  }
  return 0;
}

/** Band limited sawtooth (PolyBLEP), bright but free of the aliasing a naive ramp has. Starts at `phase` (0 to 1). */
export function saw(seconds: number, frequency: number, phase = 0): Signal {
  const out = silence(seconds);
  const step = frequency / SAMPLE_RATE;
  let p = phase;
  for (let i = 0; i < out.length; i++) {
    out[i] = 2 * p - 1 - polyBlep(p, step);
    p += step;
    if (p >= 1) p -= 1;
  }
  return out;
}
