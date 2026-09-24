/**
 * Deterministic timing for procedural motion. Everything is a pure function of time and a seed,
 * so a frozen time always gives the same pose and nothing needs per frame state.
 */

/** Hash of an integer and a seed into [0, 1). */
export function hash01(index: number, seed: number) {
  let h = Math.imul(index ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(seed + 0x632be5ab, 0xc2b2ae35);
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Slow breathing cycle in [-1, 1], about 14 breaths a minute. */
export const breathAt = (t: number) => Math.sin((t * Math.PI * 2) / 4.3);

/** Quintic ease with zero velocity and acceleration at both ends. */
export function smootherstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** Smooth value noise in [-1, 1], about one wobble per unit of `t`. */
export function noise(t: number, seed: number) {
  const index = Math.floor(t);
  const f = t - index;
  const u = f * f * (3 - 2 * f);
  const a = hash01(index, seed);
  const b = hash01(index + 1, seed);
  return (a + (b - a) * u) * 2 - 1;
}

export interface Recurring {
  /** Average seconds between events. Each slot of this length holds at most one event. */
  period: number;
  /** Seconds each event lasts, including easing in and out. */
  duration: number;
  /** Seconds to ease in and to ease out. */
  ease: number;
  /** Share of slots that actually hold an event. */
  chance?: number;
}

export interface Occurrence {
  /** 0 when idle, 1 while the event is fully on. */
  weight: number;
  /** 0 to 1 through the current event. */
  progress: number;
  /** Stable random number for the current event, to pick variants. */
  roll: number;
  /** Slot number of the current event. */
  index: number;
}

export const createOccurrence = (): Occurrence => ({ weight: 0, progress: 0, roll: 0, index: 0 });

/** Evaluates a recurring event at time `t` for a given seed, writing into `out`. */
export function occurrence(t: number, { period, duration, ease, chance = 1 }: Recurring, seed: number, out: Occurrence) {
  const index = Math.floor(t / period);
  const start = index * period + hash01(index, seed) * Math.max(0, period - duration);
  const local = t - start;
  out.index = index;
  out.roll = hash01(index, seed + 101);
  out.progress = Math.min(1, Math.max(0, local / duration));
  const active = hash01(index, seed + 202) < chance && local >= 0 && local <= duration;
  out.weight = active ? smootherstep(0, ease, local) * (1 - smootherstep(duration - ease, duration, local)) : 0;
  return out;
}
