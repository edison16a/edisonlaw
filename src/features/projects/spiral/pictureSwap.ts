/**
 * A card's crossfade from the picture it shows to another, used when a
 * screenshot is picked under the focused card and when the card goes back to
 * its thumbnail. Generic, so it is unit tested with plain values. The frame
 * loop mutates it in place, so nothing is allocated.
 */
export interface PictureSwap<T> {
  /** The picture shown in full, under any crossfade. Null until the first one arrives. */
  current: T | null;
  /** The picture fading in over it, or null. */
  next: T | null;
  /** 0 to 1, how far `next` has faded in. */
  blend: number;
}

export function createSwap<T>(): PictureSwap<T> {
  return { current: null, next: null, blend: 0 };
}

/** Starts a crossfade to `picture`. A card with nothing to show yet takes it at once. */
export function requestSwap<T>(swap: PictureSwap<T>, picture: T) {
  if ((swap.next ?? swap.current) === picture) return;
  if (swap.current === null) {
    swap.current = picture;
  } else if (swap.next === null) {
    swap.next = picture;
    swap.blend = 0;
  } else if (picture === swap.current) {
    // Turning back mid fade plays the same fade in reverse, so nothing jumps.
    swap.current = swap.next;
    swap.next = picture;
    swap.blend = 1 - swap.blend;
  } else {
    // A third picture fades in over whichever of the two shows more.
    if (swap.blend >= 0.5) swap.current = swap.next;
    swap.next = picture;
    swap.blend = 0;
  }
}

/** Advances the crossfade by `delta` of its `duration`, in seconds. Returns true while it still runs. */
export function stepSwap<T>(swap: PictureSwap<T>, delta: number, duration: number) {
  if (swap.next === null) return false;
  swap.blend = duration > 0 ? swap.blend + delta / duration : 1;
  if (swap.blend < 1) return true;
  swap.current = swap.next;
  swap.next = null;
  swap.blend = 0;
  return false;
}
