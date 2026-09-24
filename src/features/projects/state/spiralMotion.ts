import type { SpringState } from '../spiral/spring';

/**
 * Per-frame spiral values. The scroll hooks write `target`, the scene driver
 * damps `index` toward it, and every card reads `index` each frame.
 * Kept out of React state so nothing re-renders at 60 frames per second.
 */
export interface SpiralMotion extends SpringState {
  /** Continuous card index the scroll position asks for. */
  target: number;
  /** Damped continuous card index. Everything in the scene reads from this. */
  value: number;
  /** Rate of change of `value`, in cards per second. */
  velocity: number;
  /** True while the visitor drags the stage. */
  dragging: boolean;
}

export const spiralMotion: SpiralMotion = {
  target: 0,
  value: 0,
  velocity: 0,
  dragging: false,
};

/** Jumps straight to `index` with no travel, for example when the spiral mounts. */
export function resetSpiralMotion(index: number) {
  spiralMotion.target = index;
  spiralMotion.value = index;
  spiralMotion.velocity = 0;
  spiralMotion.dragging = false;
}
