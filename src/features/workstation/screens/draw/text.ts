import { fontFamilies, type FontKind } from '../fonts';

export interface TextStyle {
  size: number;
  color: string;
  weight?: number;
  family?: FontKind;
  italic?: boolean;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
}

/** Canvas font shorthand for one of the site families. */
export function font(size: number, weight = 400, family: FontKind = 'mono', italic = false) {
  return `${italic ? 'italic ' : ''}${weight} ${size}px ${fontFamilies()[family]}`;
}

function applyText(ctx: CanvasRenderingContext2D, style: TextStyle) {
  ctx.font = font(style.size, style.weight, style.family, style.italic);
  ctx.fillStyle = style.color;
  ctx.textAlign = style.align ?? 'left';
  ctx.textBaseline = style.baseline ?? 'middle';
}

/** Draws one line of text. `y` is the vertical middle unless a baseline is given. */
export function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, style: TextStyle) {
  applyText(ctx, style);
  ctx.fillText(value, x, y);
}

/** Width of `value` in the given style. */
export function measure(ctx: CanvasRenderingContext2D, value: string, style: Omit<TextStyle, 'color'>) {
  ctx.font = font(style.size, style.weight, style.family, style.italic);
  return ctx.measureText(value).width;
}

/** Draws text and returns the x just past its end, for laying out runs of styled text. */
export function textRun(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, style: TextStyle) {
  text(ctx, value, x, y, style);
  return x + ctx.measureText(value).width;
}

/** Shortens `value` with an ellipsis until it fits `maxWidth`. Uses the current ctx font. */
export function fitText(ctx: CanvasRenderingContext2D, value: string, maxWidth: number) {
  if (ctx.measureText(value).width <= maxWidth) return value;
  let end = value.length;
  while (end > 1 && ctx.measureText(`${value.slice(0, end)}…`).width > maxWidth) end--;
  return `${value.slice(0, end)}…`;
}

/** Splits `value` into lines of at most `columns` characters, breaking between words. */
export function wrapWords(value: string, columns: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of value.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > columns && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}
