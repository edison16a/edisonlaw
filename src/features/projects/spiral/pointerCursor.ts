import type { CardRuntime } from './cardFrame';
import { FOCUS } from './geometry';

/** Faster than this, in cards per second, the card under a resting pointer changes too quickly to point at. */
const POINT_SPEED = 1.5;

export interface PointerCursor {
  /** The pointer moved onto a card facing the camera. */
  enter: (card: CardRuntime) => void;
  /** The pointer left the card. */
  leave: (card: CardRuntime) => void;
  /** Call once per frame. Writes the cursor onto the canvas only when it changes. */
  update: (velocity: number, canvas: HTMLElement) => void;
}

/**
 * The pointer cursor over the cards beside the focused one, the only hint
 * that a click turns the spiral to them. Cards never react to the pointer
 * themselves, and hovering re-renders nothing. Nothing tests the pointer
 * again while the cards move under it, so a fast turn forgets the card until
 * the pointer moves.
 */
export function createPointerCursor(): PointerCursor {
  let pointed: CardRuntime | null = null;
  let showing = false;

  return {
    enter: (card) => {
      pointed = card;
    },
    leave: (card) => {
      if (pointed === card) pointed = null;
    },
    update: (velocity, canvas) => {
      if (Math.abs(velocity) > POINT_SPEED) pointed = null;
      const clickable = pointed !== null && Math.abs(pointed.offset) >= FOCUS.reach;
      if (clickable === showing) return;
      showing = clickable;
      canvas.style.cursor = clickable ? 'pointer' : '';
    },
  };
}
