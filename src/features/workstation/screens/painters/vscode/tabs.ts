import { drawGlyph } from '../../draw/glyphs';
import { drawIcon } from '../../draw/icons';
import { circle, fillRect, type Rect } from '../../draw/shapes';
import { measure, text } from '../../draw/text';
import { drawFileIcon } from './fileIcon';
import { FILE_PATH } from './source';
import { VSCODE_THEME as T } from './theme';

/** Editor tabs and the breadcrumb bar under them. */

export const TABS_HEIGHT = 35;
export const BREADCRUMB_HEIGHT = 22;

const TABS = [
  { name: 'SpiralCard.tsx', active: true, modified: true },
  { name: 'useSpiralMotion.ts', modified: true },
  { name: 'card.frag' },
];

/** Purple cube VS Code uses for methods and functions. */
export function drawSymbolIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - 6);
  ctx.lineTo(x + 5.5, y - 3);
  ctx.lineTo(x + 5.5, y + 3.5);
  ctx.lineTo(x, y + 6.5);
  ctx.lineTo(x - 5.5, y + 3.5);
  ctx.lineTo(x - 5.5, y - 3);
  ctx.closePath();
  ctx.moveTo(x - 5.5, y - 3);
  ctx.lineTo(x, y);
  ctx.lineTo(x + 5.5, y - 3);
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 6.5);
  ctx.strokeStyle = '#b180d7';
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

export function drawTabs(ctx: CanvasRenderingContext2D, area: Rect, dirty: boolean) {
  fillRect(ctx, area.x, area.y, area.w, TABS_HEIGHT, T.chrome);
  fillRect(ctx, area.x, area.y + TABS_HEIGHT - 1, area.w, 1, T.border);
  const style = { size: 13, family: 'sans' } as const;
  const middle = area.y + TABS_HEIGHT / 2;
  let x = area.x;
  for (const tab of TABS) {
    const width = 64 + measure(ctx, tab.name, style);
    if (tab.active) {
      fillRect(ctx, x, area.y, width, TABS_HEIGHT, T.editor);
      fillRect(ctx, x, area.y, width, 1, T.accent);
    }
    fillRect(ctx, x + width - 1, area.y, 1, TABS_HEIGHT, T.border);
    drawFileIcon(ctx, tab.name, x + 20, middle);
    const color = tab.modified ? T.modified : tab.active ? T.bright : T.muted;
    text(ctx, tab.name, x + 34, middle + 1, { ...style, color: tab.active && !tab.modified ? T.bright : color });
    if (tab.active) {
      if (dirty) circle(ctx, x + width - 20, middle, 4, T.bright);
      else drawIcon(ctx, 'close', x + width - 20, middle, 16, T.text, 1.3);
    }
    x += width;
  }
  drawIcon(ctx, 'split', area.x + area.w - 52, middle, 16, T.icon, 1.2);
  drawIcon(ctx, 'more', area.x + area.w - 24, middle, 16, T.icon);
}

export function drawBreadcrumbs(ctx: CanvasRenderingContext2D, area: Rect) {
  const y = area.y + TABS_HEIGHT;
  fillRect(ctx, area.x, y, area.w, BREADCRUMB_HEIGHT, T.editor);
  const middle = y + BREADCRUMB_HEIGHT / 2;
  const style = { size: 12.5, family: 'sans', color: '#a9a9a9' } as const;
  let x = area.x + 16;
  const parts = [...FILE_PATH, 'SpiralCard'];
  parts.forEach((part, index) => {
    if (part.endsWith('.tsx')) {
      drawFileIcon(ctx, part, x + 7, middle);
      x += 18;
    } else if (index === parts.length - 1) {
      drawSymbolIcon(ctx, x + 6, middle);
      x += 18;
    }
    text(ctx, part, x, middle + 1, style);
    x += measure(ctx, part, style) + 6;
    if (index < parts.length - 1) {
      drawGlyph(ctx, 'chevron', x + 4, middle, 12, '#8b8b8b');
      x += 14;
    }
  });
}
