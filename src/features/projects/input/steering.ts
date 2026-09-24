import { stepTarget } from '../spiral/loop';
import { spiralMotion } from '../state/spiralMotion';
import { wakeSpiral } from '../state/spiralWake';

/**
 * Moves the spiral from input: the wheel, swipes, the arrow keys, the step
 * buttons and clicks on any card. There is one spiral per page, so like the
 * spiral motion this works on module state.
 */

/** Sends the spiral to card `index` on its looping index. */
export function moveSpiralTo(index: number) {
  spiralMotion.target = index;
  wakeSpiral();
}

/** Turns the spiral one project on (1) or back (-1). Quick presses queue up. */
export function stepSpiral(direction: 1 | -1) {
  moveSpiralTo(stepTarget(spiralMotion.target, spiralMotion.value, direction));
}
