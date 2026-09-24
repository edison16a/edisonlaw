import { fillRound, strokeRound, type Rect } from '../../../draw/shapes';
import { text } from '../../../draw/text';
import { OPTAGON_THEME as T } from './theme';

/** Dashboard card with an optional title in its top left corner. */
export function card(ctx: CanvasRenderingContext2D, rect: Rect, title?: string) {
  fillRound(ctx, rect.x, rect.y, rect.w, rect.h, 10, T.panel);
  strokeRound(ctx, rect.x, rect.y, rect.w, rect.h, 10, T.panelBorder);
  if (title) text(ctx, title, rect.x + 18, rect.y + 24, { size: 14, weight: 600, family: 'sans', color: T.text });
}
