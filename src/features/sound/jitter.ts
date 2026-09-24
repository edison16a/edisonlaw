import { clamp } from '@/lib/math';
import { PITCH_JITTER, RATE_RANGE } from './config';

/** Playback rate with a small random pitch spread, so a sound repeated fast never sounds robotic. */
export function jitterRate(rate = 1, amount = PITCH_JITTER, random: () => number = Math.random) {
  const [min, max] = RATE_RANGE;
  return clamp(rate * (1 + (random() * 2 - 1) * amount), min, max);
}
