import { smoothstep } from '@/lib/math';

/**
 * How a card looks at a given distance from the focus slot. Pure curves, read every frame.
 * `offset` is the card's distance from the continuous index, in cards.
 * `settle` is 1 while the spiral rests on a card, which quietly steps everything else back.
 */

/**
 * Brightness multiplier: full in the slot and only a touch dimmer along the
 * strand, so every card stays easy to see while depth still reads.
 */
export function cardBrightness(offset: number, settle: number) {
  const distance = Math.abs(offset);
  const strand = 1 - 0.1 * smoothstep(0.5, 2.5, distance);
  const backdrop = 1 - settle * 0.16 * smoothstep(0.3, 1, distance);
  return strand * backdrop;
}

/**
 * How closely a card hugs the cylinder: 1 follows it exactly. Speed bends it a
 * touch further. `focus` runs from 0 on the strand to 1 once the card has
 * settled in the slot, where it eases out perfectly flat.
 */
export function cardBend(velocity: number, focus: number) {
  const speed = Math.min(1, Math.abs(velocity) / 8);
  return (1 + 0.45 * speed) * (1 - focus);
}

/**
 * How far the middle of a card bows along the strand with speed, in world
 * units, the way the card is travelling. Cards move toward their own left as
 * the index grows, so the bow runs against the velocity's sign. A card
 * settling in focus straightens out.
 */
export function cardBow(velocity: number, focus: number) {
  const clamped = Math.max(-10, Math.min(10, velocity));
  return clamped * -0.016 * (1 - focus);
}
