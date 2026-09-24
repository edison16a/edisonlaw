/** Small numeric helpers shared by the scenes and the scroll logic. */

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Maps `value` from one range to another, clamped to the output range. */
export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  if (inMax === inMin) return outMin;
  const t = clamp((value - inMin) / (inMax - inMin));
  return lerp(outMin, outMax, t);
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Frame rate independent exponential smoothing.
 * `lambda` is how quickly `current` catches up with `target`, roughly 1/seconds.
 */
export function damp(current: number, target: number, lambda: number, delta: number) {
  return lerp(current, target, 1 - Math.exp(-lambda * delta));
}

/** Wraps `value` into [min, max). */
export function wrap(value: number, min: number, max: number) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

/** Deterministic pseudo random generator (mulberry32) for seeded visuals. */
export function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable 32 bit hash of a string, handy as a seed. */
export function hashString(text: string) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
