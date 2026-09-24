/**
 * Envelope building blocks. Each is a gain as a function of time in seconds,
 * so they multiply together: `(t) => rise(t, 0.002) * decay(t, 0.03)`.
 */

import { SAMPLE_RATE, type Signal } from './signal';

const raisedCosine = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);

/** Smooth S shaped rise from 0 to 1 over `time`, starting at `start`. No click at the start. */
export function rise(t: number, time: number, start = 0) {
  if (t <= start) return 0;
  if (t >= start + time) return 1;
  return raisedCosine((t - start) / time);
}

/** Smooth S shaped fall from 1 to 0 between `start` and `end`. */
export function fall(t: number, start: number, end: number) {
  if (t <= start) return 1;
  if (t >= end) return 0;
  return 1 - raisedCosine((t - start) / (end - start));
}

/** Exponential decay with time constant `tau`, held at 1 until `start`. */
export function decay(t: number, tau: number, start = 0) {
  return t <= start ? 1 : Math.exp(-(t - start) / tau);
}

/** A struck sound: a quick smooth attack, then exponential decay. */
export function strike(t: number, attack: number, tau: number) {
  return rise(t, attack) * decay(t, tau, attack);
}

/** A soft swell that peaks at `peak` and is silent again at `end`. */
export function swell(t: number, peak: number, end: number) {
  return rise(t, peak) * fall(t, peak, end);
}

/** Fades both ends of a signal to exactly zero, in place, so a sprite never clicks at its edges. */
export function fadeEdges(signal: Signal, fadeIn: number, fadeOut: number): Signal {
  const inCount = Math.min(signal.length, Math.round(fadeIn * SAMPLE_RATE));
  const outCount = Math.min(signal.length, Math.round(fadeOut * SAMPLE_RATE));
  for (let i = 0; i < inCount; i++) signal[i] *= raisedCosine(i / inCount);
  for (let i = 0; i < outCount; i++) signal[signal.length - 1 - i] *= raisedCosine(i / outCount);
  return signal;
}
