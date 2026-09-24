import { fillRound, strokeRound, type Rect } from '../../../draw/shapes';
import { text } from '../../../draw/text';
import { OPTAGON_THEME as T } from './theme';

/** Dashboard card with an optional title in its top left corner. */
export function card(ctx: CanvasRenderingContext2D, rect: Rect, title?: string) {
  fillRound(ctx, rect.x, rect.y, rect.w, rect.h, 8, T.panel);
  strokeRound(ctx, rect.x, rect.y, rect.w, rect.h, 8, T.panelBorder);
  if (title) text(ctx, title, rect.x + 14, rect.y + 20, { size: 13, weight: 600, family: 'sans', color: T.text });
}
