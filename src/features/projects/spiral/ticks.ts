import { sound } from '@/features/sound';
import { detentCrossed } from './detents';

/** Ticks closer together than this merge into one, so fast spins stay soft. */
const MIN_GAP_MS = 30;

let lastTickAt = -Infinity;

/**
 * Plays a soft detent tick each time a new card turns into the focus slot:
 * once per card, one after another on a long turn, like a wheel clicking past
 * its notches. Pitch rises with speed.
 */
export function tickDetents(previous: number, next: number, velocity: number, now: number) {
  if (detentCrossed(previous, next) === null || now - lastTickAt < MIN_GAP_MS) return;
  lastTickAt = now;
  const speed = Math.min(1, Math.abs(velocity) / 8);
  sound.play('tick', { rate: 0.9 + 0.6 * speed, volume: 0.8 });
}
