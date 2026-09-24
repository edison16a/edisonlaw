/** Mono sample buffers and the small set of operations every recipe needs. */

export const SAMPLE_RATE = 44100;

export type Signal = Float32Array;

/** A gain curve as a function of time in seconds. */
export type Envelope = (t: number) => number;

/** Sample count for a duration in seconds. */
export const toSamples = (seconds: number) => Math.round(seconds * SAMPLE_RATE);

export const toSeconds = (count: number) => count / SAMPLE_RATE;

export function silence(seconds: number): Signal {
  return new Float32Array(toSamples(seconds));
}

/** Builds a signal sample by sample from a function of time. */
export function render(seconds: number, fn: (t: number) => number): Signal {
  const out = silence(seconds);
  for (let i = 0; i < out.length; i++) out[i] = fn(i / SAMPLE_RATE);
  return out;
}

/** Multiplies a signal by an envelope, in place. */
export function shape(signal: Signal, envelope: Envelope): Signal {
  for (let i = 0; i < signal.length; i++) signal[i] *= envelope(i / SAMPLE_RATE);
  return signal;
}

/** Scales a signal, in place. */
export function gain(signal: Signal, amount: number): Signal {
  for (let i = 0; i < signal.length; i++) signal[i] *= amount;
  return signal;
}

/** Adds `source` into `target` starting at `at` seconds. Anything past the end is dropped. */
export function mixInto(target: Signal, source: Signal, at = 0, level = 1): Signal {
  const offset = toSamples(at);
  const end = Math.min(source.length, target.length - offset);
  for (let i = Math.max(0, -offset); i < end; i++) target[offset + i] += source[i] * level;
  return target;
}

export interface Layer {
  signal: Signal;
  level?: number;
  at?: number;
}

/** Sums layers into a new signal of the given length, or as long as the longest layer. */
export function mix(layers: Layer[], seconds?: number): Signal {
  const length = seconds === undefined ? Math.max(...layers.map(({ signal, at = 0 }) => signal.length + toSamples(at))) : toSamples(seconds);
  const out = new Float32Array(length);
  for (const { signal, level = 1, at = 0 } of layers) mixInto(out, signal, at, level);
  return out;
}

export function concat(...signals: Signal[]): Signal {
  const out = new Float32Array(signals.reduce((sum, signal) => sum + signal.length, 0));
  let offset = 0;
  for (const signal of signals) {
    out.set(signal, offset);
    offset += signal.length;
  }
  return out;
}

/** A copy of the part between two times in seconds. */
export function slice(signal: Signal, from: number, to?: number): Signal {
  return signal.slice(toSamples(from), to === undefined ? undefined : toSamples(to));
}
