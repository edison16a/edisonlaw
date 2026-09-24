/** Seeded randomness, so every build of the sprite is byte for byte the same. */

export type Random = () => number;

/** mulberry32: tiny, fast and good enough for audio noise. */
export function createRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const between = (random: Random, min: number, max: number) => min + (max - min) * random();

/** Normally distributed value with the given spread (Box Muller transform). */
export function gaussian(random: Random, spread = 1) {
  const u = Math.max(random(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random()) * spread;
}

/** Nudges a value by a random factor within plus or minus `amount` (0.1 is 10 percent). */
export const vary = (random: Random, value: number, amount: number) => value * (1 + (random() * 2 - 1) * amount);
