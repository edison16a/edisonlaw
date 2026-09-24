import type { SpringState } from '../spiral/spring';

/**
 * Per-frame spiral values. The scene springs `value` toward `target` and every
 * card reads from it. Kept out of React state so nothing re-renders at 60
 * frames per second. The index has no ends: it counts on past the last
 * project and below zero, and the cards wrap round.
 */
export interface SpiralMotion extends SpringState {
  /** The whole card the spiral is heading for. Input moves it one card at a time. */
  target: number;
  /** Continuous card index on its way to the target. Everything in the scene reads from this. */
  value: number;
  /** Rate of change of `value`, in cards per second. */
  velocity: number;
  /** 0 to 1, how firmly the spiral rests on a card. The resting card comes forward as it grows. */
  settle: number;
  /** 0 to 1, the entrance. Cards rise into place as it grows. */
  reveal: number;
  /** Slot under the pointer, or null. */
  hoverSlot: number | null;
}

export const spiralMotion: SpiralMotion = {
  target: 0,
  value: 0,
  velocity: 0,
  settle: 0,
  reveal: 0,
  hoverSlot: null,
};

/** False until the spiral first opens. After that a remount keeps the card it was on. */
let placed = false;

/** The card the spiral opens on: `featured` the first time, then the card it was heading for. */
export function openingCard(featured: number) {
  return placed ? Math.round(spiralMotion.target) : featured;
}

/** Puts the spiral straight on card `index` with no travel, for when it mounts. The entrance plays again. */
export function placeSpiral(index: number) {
  placed = true;
  spiralMotion.target = index;
  spiralMotion.value = index;
  spiralMotion.velocity = 0;
  spiralMotion.settle = 0;
  spiralMotion.reveal = 0;
  spiralMotion.hoverSlot = null;
}
