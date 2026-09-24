import { fillRect, fillRound, strokeRound } from '../../draw/shapes';
import { text, textRun } from '../../draw/text';
import type { Suggest } from './playback';
import { drawSymbolIcon } from './tabs';
import { VSCODE_THEME as T } from './theme';

/** The IntelliSense list, with the typed part of each name in blue and details on the first row. */

const ROW = 22;
const WIDTH = 360;
const MAX_ROWS = 6;
const DETAIL = 'setScalar(scalar: number): Vector3';

/** Height of the list for `suggest`, so the editor can decide where it fits. */
export function suggestHeight(suggest: Suggest) {
  return Math.min(suggest.items.length, MAX_ROWS) * ROW + 2;
}

export function drawSuggest(ctx: CanvasRenderingContext2D, suggest: Suggest, x: number, y: number, fontSize: number) {
  const rows = Math.min(suggest.items.length, MAX_ROWS);
  const height = suggestHeight(suggest);
  fillRound(ctx, x, y, WIDTH, height, 4, T.widget);
  strokeRound(ctx, x, y, WIDTH, height, 4, T.widgetBorder);

  suggest.items.slice(0, rows).forEach((item, index) => {
    const top = y + 1 + index * ROW;
    const middle = top + ROW / 2;
    if (index === 0) {
      fillRect(ctx, x + 1, top, WIDTH - 2, ROW, T.suggestSelected);
      text(ctx, DETAIL, x + WIDTH - 12, middle + 1, { size: fontSize - 1, family: 'mono', color: '#a0a0a0', align: 'right' });
    }
    drawSymbolIcon(ctx, x + 14, middle);
    const matched = item.slice(0, suggest.partial.length);
    const rest = item.slice(suggest.partial.length);
    const after = textRun(ctx, matched, x + 28, middle + 1, { size: fontSize, weight: 700, color: T.suggestMatch });
    textRun(ctx, rest, after, middle + 1, { size: fontSize, color: index === 0 ? T.bright : T.text });
  });
}
