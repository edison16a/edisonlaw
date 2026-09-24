/**
 * Maps page scroll inside the projects track to the continuous card index and back.
 * Pure, so it is unit tested.
 *
 * The track opens half a card before the first project, so the first view is
 * the spiral at rest between two cards. It closes on the last project, so that
 * card and its details scroll away with the stage instead of the spiral turning
 * on to a frame that looks like the opening one.
 */

export const TRACK = {
  /** Cards of travel before the first project. */
  intro: 0.5,
  /** Cards of travel after the last project. */
  outro: 0,
  /** Scroll distance per card, as a share of the viewport height. */
  perCardVh: 55,
} as const;

export interface TrackMetrics {
  /** Page scroll position where the track starts. */
  top: number;
  /** Page scroll distance for one card, in pixels. */
  perCard: number;
  count: number;
}

/** Cards of travel in the whole track. */
export function trackSpan(count: number) {
  return Math.max(0, count - 1) + TRACK.intro + TRACK.outro;
}

export function firstIndex() {
  return -TRACK.intro;
}

export function lastIndex(count: number) {
  return Math.max(0, count - 1) + TRACK.outro;
}

/** Continuous card index for a page scroll position, running on past both ends of the track. */
export function rawIndexFromScroll(scroll: number, metrics: TrackMetrics) {
  if (metrics.perCard <= 0) return firstIndex();
  return (scroll - metrics.top) / metrics.perCard - TRACK.intro;
}

/** Continuous card index for a page scroll position, held inside the track. */
export function indexFromScroll(scroll: number, metrics: TrackMetrics) {
  return Math.min(lastIndex(metrics.count), Math.max(firstIndex(), rawIndexFromScroll(scroll, metrics)));
}

/** Page scroll position that puts `index` in the focus slot. */
export function scrollFromIndex(index: number, metrics: TrackMetrics) {
  return metrics.top + (index + TRACK.intro) * metrics.perCard;
}

/** True while `index` sits between the first and the last project, where snapping applies. */
export function isInsideDeck(index: number, count: number) {
  return index >= 0 && index <= count - 1;
}
