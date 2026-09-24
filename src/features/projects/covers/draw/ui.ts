import { fill } from './paint';
import { circle, pill } from './shapes';

/** Tiny interface marks: text that is not readable, window controls and simple glyphs. */

interface BarOptions {
  height: number;
  /** Space between words on a line. */
  gap: number;
  /** Distance from one line to the next. */
  leading: number;
  color: string;
}

/**
 * Lines of rounded bars that read as text without spelling anything.
 * `lines` holds the word widths for each line. Returns the bar boxes so callers can highlight some.
 */
export function textBars(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  lines: readonly (readonly number[])[],
  { height, gap, leading, color }: BarOptions,
) {
  const boxes: { x: number; y: number; w: number; h: number }[] = [];
  const path = new Path2D();
  lines.forEach((words, row) => {
    let cursor = x;
    words.forEach((width) => {
      const box = { x: cursor, y: y + row * leading, w: width, h: height };
      path.addPath(pill(box.x, box.y, box.w, box.h));
      boxes.push(box);
      cursor += width + gap;
    });
  });
  fill(ctx, path, color);
  return boxes;
}

/** The three little window buttons. */
export function windowDots(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, colors: readonly string[]) {
  colors.forEach((color, index) => fill(ctx, circle(x + index * radius * 3.2, y, radius), color));
}

/** Tick mark, sized by its overall width. Stroke it with round caps. */
export function checkGlyph(x: number, y: number, size: number) {
  const path = new Path2D();
  path.moveTo(x - size * 0.45, y + size * 0.02);
  path.lineTo(x - size * 0.12, y + size * 0.32);
  path.lineTo(x + size * 0.48, y - size * 0.3);
  return path;
}

/** Plus sign. Stroke it with round caps. */
export function plusGlyph(x: number, y: number, size: number) {
  const half = size / 2;
  const path = new Path2D();
  path.moveTo(x - half, y);
  path.lineTo(x + half, y);
  path.moveTo(x, y - half);
  path.lineTo(x, y + half);
  return path;
}

/** Chevron pointing right. Stroke it with round caps. */
export function chevronGlyph(x: number, y: number, size: number, direction: 1 | -1 = 1) {
  const half = size / 2;
  const path = new Path2D();
  path.moveTo(x - half * 0.5 * direction, y - half);
  path.lineTo(x + half * 0.5 * direction, y);
  path.lineTo(x - half * 0.5 * direction, y + half);
  return path;
}
