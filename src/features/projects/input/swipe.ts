/** Sideways travel, in pixels, that counts as a swipe. */
const SWIPE_DISTANCE = 40;
/** How much more sideways than up or down a swipe has to be, so scrolling the page never turns the spiral. */
const SIDEWAYS = 1.3;

/**
 * The step a finger that travelled `dx` by `dy` pixels asks for: 1 for the
 * next project after a swipe to the left, -1 for the previous one after a
 * swipe to the right, or null for a tap or a scroll. Pure, so it is unit tested.
 */
export function swipeStep(dx: number, dy: number): 1 | -1 | null {
  if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy) * SIDEWAYS) return null;
  return dx < 0 ? 1 : -1;
}
