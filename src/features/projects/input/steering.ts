import { MAX_LEAD, stepTarget } from '../spiral/loop';
import { spiralMotion } from '../state/spiralMotion';
import { wakeSpiral } from '../state/spiralWake';

/**
 * Moves the spiral from input: the wheel, mouse drags, swipes, the arrow
 * keys, the step buttons and clicks on any card. There is one spiral per page, so like the
 * spiral motion this works on module state.
 */

/**
 * Sends the spiral to card `index` on its looping index. The scene plays the
 * move sound for every card it turns through on the way.
 */
export function moveSpiralTo(index: number) {
  spiralMotion.target = index;
  wakeSpiral();
}

/**
 * Turns the spiral `steps` projects on, or back when negative: one for a
 * press, and a few for wheel notches merged into one event. Quick presses
 * queue up, at most `maxLead` cards ahead of the card passing the slot.
 * Nothing steps while the mouse drags the spiral.
 */
export function stepSpiral(steps: number, maxLead = MAX_LEAD) {
  // While the mouse drags the spiral it goes where the mouse takes it.
  if (spiralMotion.held) return;
  const direction = steps > 0 ? 1 : -1;
  let target = spiralMotion.target;
  for (let step = 0; step < Math.abs(steps); step++) target = stepTarget(target, spiralMotion.value, direction, maxLead);
  moveSpiralTo(target);
}
