import { clamp } from '@/lib/math';

/**
 * How the screenshot row under the focused card is sized, in CSS pixels. The
 * row builds its styles from these, and the stage leaves room for it with
 * rowSpace.
 */
export const ROW = {
  /** Space between the card and the row, as a share of the window height, kept between the two sizes after it. */
  gapShare: 0.024,
  gapMin: 16,
  gapMax: 28,
  /** Width of each picture, as a share of the card's width, kept between the two sizes after it. */
  thumbShare: 0.125,
  thumbMin: 52,
  thumbMax: 88,
  /** Width over height of each picture. */
  aspect: 1.6,
} as const;

/** Height the row and the space above it take under a card `cardWidth` wide, in a window `viewportHeight` tall. */
export function rowSpace(cardWidth: number, viewportHeight: number) {
  const gap = clamp(viewportHeight * ROW.gapShare, ROW.gapMin, ROW.gapMax);
  const thumb = clamp(cardWidth * ROW.thumbShare, ROW.thumbMin, ROW.thumbMax);
  return gap + thumb / ROW.aspect;
}
