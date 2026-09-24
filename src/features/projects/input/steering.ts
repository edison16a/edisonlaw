import { snapTarget } from '../spiral/detents';
import { spiralMotion } from '../state/spiralMotion';
import { useSpiralStore } from '../state/spiralStore';
import { wakeSpiral } from '../state/spiralWake';

/**
 * Moves the spiral's target from input. There is one spiral per page, so like
 * the spiral motion this keeps its state at module level. The page never
 * scrolls for any of it.
 */

/** Quiet time after the last wheel or trackpad input before the spiral settles on a card. */
const IDLE_MS = 150;
/** Furthest a wheel can run the target ahead of the cards, so a hard fling stays readable. */
const MAX_LEAD = 3.5;

let timer = 0;
/** The card locked in place when the current gesture began. Nudging away from it commits to the neighbour. */
let anchor: number | null = null;
let inGesture = false;

/** The card the spiral rests on, or null while it moves. */
function lockedCard() {
  return spiralMotion.settle > 0.5 ? Math.round(spiralMotion.value) : null;
}

function aim(index: number) {
  spiralMotion.target = index;
  useSpiralStore.getState().markScrolled();
  wakeSpiral();
}

function settle() {
  inGesture = false;
  if (spiralMotion.dragging) return;
  aim(snapTarget(spiralMotion.target, anchor));
}

/**
 * Turns the spiral by `cards` for a wheel or trackpad, then settles on a card
 * once the input stops. The lead only limits travel in the direction of the
 * input, so it never pulls the spiral back.
 */
export function spinBy(cards: number) {
  if (cards === 0) return;
  if (!inGesture) anchor = lockedCard();
  inGesture = true;
  const { target, value } = spiralMotion;
  const next = target + cards;
  aim(cards > 0 ? Math.min(next, Math.max(target, value + MAX_LEAD)) : Math.max(next, Math.min(target, value - MAX_LEAD)));
  window.clearTimeout(timer);
  timer = window.setTimeout(settle, IDLE_MS);
}

/** Sends the spiral straight to `index`, for keys, clicks and drags. */
export function spinTo(index: number) {
  stopSpin();
  aim(index);
}

/** Forgets any settle still waiting, for a drag that takes over or a stage that goes away. */
export function stopSpin() {
  window.clearTimeout(timer);
  inGesture = false;
}
