import { smoothstep } from '@/lib/math';

/**
 * How a card looks at a given distance from the focus slot. Pure curves, read every frame.
 * `offset` is the card's distance from the continuous index, in cards.
 * `settle` is 1 while the spiral rests on a card, which pushes everything else back.
 */

/** 0 is sharp, 1 is the widest blur. The cards beside the slot stay almost sharp. */
export function cardBlur(offset: number, settle: number) {
  const distance = Math.abs(offset);
  const depth = smoothstep(0.45, 3.2, distance);
  const backdrop = settle * 0.55 * smoothstep(0.25, 0.9, distance);
  return Math.min(1, depth + backdrop);
}

/** Brightness multiplier: full in the slot, a little dimmer along the strand. */
export function cardBrightness(offset: number, settle: number) {
  const distance = Math.abs(offset);
  const strand = 1 - 0.16 * smoothstep(0.4, 1.6, distance);
  const backdrop = 1 - settle * 0.4 * smoothstep(0.25, 0.9, distance);
  return strand * backdrop;
}

/**
 * Length of the motion streak along the strand, in texture widths, signed by
 * the direction of travel. `velocity` is in cards per second.
 */
export function cardStreak(velocity: number) {
  const speed = Math.min(1, Math.abs(velocity) / 9);
  return Math.sign(velocity) * 0.09 * speed * (2 - speed);
}

/**
 * How closely a card hugs the cylinder: 1 follows it exactly. Speed bends it a
 * touch further and a card relaxes almost flat while it is in focus.
 */
export function cardBend(velocity: number, focus: number) {
  const speed = Math.min(1, Math.abs(velocity) / 8);
  return (1 + 0.45 * speed) * (1 - 0.8 * focus);
}

/** How far the middle of a card bows along the strand with speed, in world units. */
export function cardBow(velocity: number) {
  const clamped = Math.max(-10, Math.min(10, velocity));
  return clamped * 0.016;
}
