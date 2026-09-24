import { INTRO_INDEX } from '../spiral/loop';
import type { SpringState } from '../spiral/spring';

/**
 * Per-frame spiral values. The scene damps `value` toward `target` and every
 * card reads from it. Kept out of React state so nothing re-renders at 60
 * frames per second. The index has no ends: it counts on past the last
 * project and below zero, and the cards wrap round.
 */
export interface SpiralMotion extends SpringState {
  /** Continuous card index that input asks for. */
  target: number;
  /** Damped continuous card index. Everything in the scene reads from this. */
  value: number;
  /** Rate of change of `value`, in cards per second. */
  velocity: number;
  /** True while the visitor drags the stage. */
  dragging: boolean;
  /** 0 to 1, how firmly the spiral rests on a card. */
  settle: number;
  /** 0 to 1, how far the spiral has moved aside to make room for the detail panel. */
  engaged: number;
  /** 0 to 1, the entrance. Cards rise into place as it grows. */
  reveal: number;
  /** Slot under the pointer, or null. */
  hoverSlot: number | null;
  /**
   * Index of the centred opening pose, or null once the visitor has moved on
   * to a card. The intro only happens once per visit.
   */
  introAt: number | null;
}

export const spiralMotion: SpiralMotion = {
  target: INTRO_INDEX,
  value: INTRO_INDEX,
  velocity: 0,
  dragging: false,
  settle: 0,
  engaged: 0,
  reveal: 0,
  hoverSlot: null,
  introAt: INTRO_INDEX,
};

/**
 * Jumps straight to `index` with no travel, for example when the spiral
 * mounts. The entrance plays again, and the intro stays over once it is.
 */
export function resetSpiralMotion(index: number) {
  spiralMotion.target = index;
  spiralMotion.value = index;
  spiralMotion.velocity = 0;
  spiralMotion.dragging = false;
  spiralMotion.settle = 0;
  spiralMotion.reveal = 0;
  spiralMotion.hoverSlot = null;
}
