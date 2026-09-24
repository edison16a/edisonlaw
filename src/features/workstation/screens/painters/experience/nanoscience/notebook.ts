import { drawIcon, type IconName } from '../../../draw/icons';
import { circle, fillRect, fillRound, ring, strokeRound, type Rect } from '../../../draw/shapes';
import { toSpans, tokenize } from '../../../draw/syntax';
import { createGrid, drawSpans } from '../../../draw/terminal';
import { measure, text } from '../../../draw/text';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../../../draw/view';
import { SUMMARY } from './data';
import { LAB_THEME as T } from './theme';

/** JupyterLab chrome and the pieces of a notebook: prompts, code cells and a DataFrame. */

const MENU_HEIGHT = 24;
const TAB_HEIGHT = 26;
const TOOLBAR_HEIGHT = 26;
const TAB_TOP = MENU_HEIGHT;
const TOOLBAR_TOP = MENU_HEIGHT + TAB_HEIGHT;
export const BODY_TOP = TOOLBAR_TOP + TOOLBAR_HEIGHT;
const SIDE_WIDTH = 32;
export const CELL_X = 84;
const CELL_RIGHT = 14;
const CODE_SIZE = 12;
const CODE_LINE = 17;

function logo(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = T.jupyter;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y - 3, 7, 2.6, 0, Math.PI, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x, y + 3, 7, 2.6, 0, 0, Math.PI);
  ctx.stroke();
  circle(ctx, x + 7, y - 7, 1.3, '#9e9e9e');
  circle(ctx, x - 7, y + 7, 1.3, '#9e9e9e');
}

export function drawChrome(ctx: CanvasRenderingContext2D, busy: boolean) {
  fillRect(ctx, 0, 0, VIEW_WIDTH, BODY_TOP, T.chrome);
  logo(ctx, 16, MENU_HEIGHT / 2);
  const menuStyle = { size: 12, family: 'sans', color: T.text } as const;
  ['File', 'Edit', 'View', 'Run', 'Kernel', 'Tabs', 'Settings', 'Help'].reduce((x, item) => {
    text(ctx, item, x, MENU_HEIGHT / 2 + 1, menuStyle);
    return x + measure(ctx, item, menuStyle) + 16;
  }, 36);
  fillRect(ctx, 0, MENU_HEIGHT - 1, VIEW_WIDTH, 1, T.border);

  // Left side bar icons.
  fillRect(ctx, 0, MENU_HEIGHT, SIDE_WIDTH, VIEW_HEIGHT, T.chrome);
  fillRect(ctx, SIDE_WIDTH - 1, MENU_HEIGHT, 1, VIEW_HEIGHT, T.border);
  const icons: IconName[] = ['folder', 'play', 'layers', 'extensions'];
  icons.forEach((icon, index) => drawIcon(ctx, icon, SIDE_WIDTH / 2, MENU_HEIGHT + 22 + index * 34, 16, index === 0 ? T.text : T.muted, 1.4));

  // Tabs.
  fillRect(ctx, SIDE_WIDTH, TAB_TOP, 200, TAB_HEIGHT, T.background);
  fillRect(ctx, SIDE_WIDTH, TAB_TOP, 200, 2, T.accent);
  fillRound(ctx, SIDE_WIDTH + 12, TAB_TOP + 8, 10, 12, 2, T.jupyter);
  text(ctx, 'hydrogel_analysis.ipynb', SIDE_WIDTH + 28, TAB_TOP + 14, { size: 11.5, family: 'sans', color: T.text });
  text(ctx, 'zones_plate_scans.csv', SIDE_WIDTH + 216, TAB_TOP + 14, { size: 11.5, family: 'sans', color: T.muted });
  fillRect(ctx, SIDE_WIDTH, TOOLBAR_TOP - 1, VIEW_WIDTH, 1, T.border);

  // Notebook toolbar.
  fillRect(ctx, SIDE_WIDTH, TOOLBAR_TOP, VIEW_WIDTH, TOOLBAR_HEIGHT, T.background);
  const middle = TOOLBAR_TOP + TOOLBAR_HEIGHT / 2;
  const tools: IconName[] = ['download', 'close', 'files', 'play', 'grid', 'sync'];
  tools.forEach((icon, index) => drawIcon(ctx, icon, SIDE_WIDTH + 18 + index * 24, middle, 13, T.muted, 1.3));
  strokeRound(ctx, SIDE_WIDTH + 162, middle - 9, 52, 18, 3, T.border);
  text(ctx, 'Code', SIDE_WIDTH + 170, middle + 1, { size: 11, family: 'sans', color: T.text });
  const kernel = 'Python 3 (ipykernel)';
  text(ctx, kernel, VIEW_WIDTH - 36, middle + 1, { size: 11.5, family: 'sans', color: T.text, align: 'right' });
  if (busy) circle(ctx, VIEW_WIDTH - 20, middle, 6, T.muted);
  else ring(ctx, VIEW_WIDTH - 20, middle, 5.5, T.muted, 1.4);
  fillRect(ctx, SIDE_WIDTH, BODY_TOP - 1, VIEW_WIDTH, 1, T.border);
}

export function prompt(ctx: CanvasRenderingContext2D, label: string, y: number, color: string = T.muted) {
  text(ctx, label, CELL_X - 8, y, { size: 11, family: 'mono', color, align: 'right' });
}

/** A code cell. Returns the y just under it. */
export function codeCell(ctx: CanvasRenderingContext2D, source: string[], y: number, label: string, active: boolean) {
  const height = source.length * CODE_LINE + 12;
  const width = VIEW_WIDTH - CELL_X - CELL_RIGHT;
  if (active) fillRect(ctx, SIDE_WIDTH + 4, y - 3, 3, height + 6, T.accent);
  fillRound(ctx, CELL_X, y, width, height, 2, T.panel);
  strokeRound(ctx, CELL_X, y, width, height, 2, active ? '#424242' : '#2e2e2e');
  prompt(ctx, label, y + 14);
  const grid = createGrid(ctx, { x: CELL_X + 8, y: y + 6, w: width - 16, h: height }, CODE_SIZE, CODE_LINE);
  tokenize(source, 'tsx').forEach((tokens, row) => drawSpans(ctx, grid, 0, row, toSpans(tokens), T.text));
  return y + height;
}

export function dataFrame(ctx: CanvasRenderingContext2D, area: Rect) {
  const widths = [48, 72, 92, 88, 80, 96, 84];
  const rowHeight = 19;
  const headerHeight = 20;
  let x = area.x;
  const header = area.y;
  SUMMARY.columns.forEach((column, index) => {
    x += widths[index];
    text(ctx, column, x - 8, header + headerHeight / 2, { size: 11, weight: 700, family: 'sans', color: T.text, align: 'right' });
  });
  const width = widths.reduce((sum, value) => sum + value, 0);
  fillRect(ctx, area.x, header + headerHeight, width, 1, '#5a5a5a');
  SUMMARY.rows.forEach((row, rowIndex) => {
    const top = header + headerHeight + 1 + rowIndex * rowHeight;
    if (rowIndex % 2 === 0) fillRect(ctx, area.x, top, width, rowHeight, '#1c1c1c');
    let cellX = area.x;
    row.forEach((value, index) => {
      cellX += widths[index];
      text(ctx, value, cellX - 8, top + rowHeight / 2 + 1, {
        size: 11.5,
        weight: index === 0 ? 700 : 400,
        family: 'sans',
        color: T.text,
        align: 'right',
      });
    });
  });
}
