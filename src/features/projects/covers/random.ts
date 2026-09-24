import type { Random } from './types';

/** Uniform value between `min` and `max`. */
export const range = (random: Random, min: number, max: number) => min + (max - min) * random();

/** Symmetric offset in [-amount, amount]. */
export const jitter = (random: Random, amount: number) => (random() * 2 - 1) * amount;

export const chance = (random: Random, probability: number) => random() < probability;

export const pick = <T>(random: Random, items: readonly T[]): T => items[Math.floor(random() * items.length)];
