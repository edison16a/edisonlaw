import { drawIcon, type IconName } from '../../../draw/icons';
import { circle, fillRect, fillRound, ring, strokeRound, type Rect } from '../../../draw/shapes';
import { toSpans, tokenize } from '../../../draw/syntax';
import { createGrid, drawSpans } from '../../../draw/terminal';
import { measure, text } from '../../../draw/text';
import { SCREEN_WIDTH } from '../../../types';
import { SUMMARY } from './data';
import { LAB_THEME as T } from './theme';

/** JupyterLab chrome and the pieces of a notebook: prompts, code cells and a DataFrame. */

export const MENU_HEIGHT = 30;
export const TAB_TOP = MENU_HEIGHT;
export const TOOLBAR_TOP = MENU_HEIGHT + 32;
export const BODY_TOP = TOOLBAR_TOP + 32;
export const SIDE_WIDTH = 40;
export const CELL_X = 118;

function logo(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = T.jupyter;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(x, y - 4, 8, 3, 0, Math.PI, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 8, 3, 0, 0, Math.PI);
  ctx.stroke();
  circle(ctx, x + 8, y - 8, 1.5, '#9e9e9e');
  circle(ctx, x - 8, y + 8, 1.5, '#9e9e9e');
}

export function drawChrome(ctx: CanvasRenderingContext2D, busy: boolean) {
  fillRect(ctx, 0, 0, SCREEN_WIDTH, BODY_TOP, T.chrome);
  logo(ctx, 20, MENU_HEIGHT / 2);
  const menuStyle = { size: 13, family: 'sans', color: T.text } as const;
  ['File', 'Edit', 'View', 'Run', 'Kernel', 'Tabs', 'Settings', 'Help'].reduce((x, item) => {
    text(ctx, item, x, MENU_HEIGHT / 2 + 1, menuStyle);
    return x + measure(ctx, item, menuStyle) + 22;
  }, 46);
  fillRect(ctx, 0, MENU_HEIGHT - 1, SCREEN_WIDTH, 1, T.border);

  // Left side bar icons.
  fillRect(ctx, 0, MENU_HEIGHT, SIDE_WIDTH, 720, T.chrome);
  fillRect(ctx, SIDE_WIDTH - 1, MENU_HEIGHT, 1, 720, T.border);
  const icons: IconName[] = ['folder', 'play', 'layers', 'extensions'];
  icons.forEach((icon, index) => drawIcon(ctx, icon, SIDE_WIDTH / 2, MENU_HEIGHT + 26 + index * 40, 18, index === 0 ? T.text : T.muted, 1.4));

  // Tabs.
  fillRect(ctx, SIDE_WIDTH, TAB_TOP, 250, 32, T.background);
  fillRect(ctx, SIDE_WIDTH, TAB_TOP, 250, 2, T.accent);
  fillRound(ctx, SIDE_WIDTH + 14, TAB_TOP + 10, 12, 14, 2, T.jupyter);
  text(ctx, 'hydrogel_analysis.ipynb', SIDE_WIDTH + 34, TAB_TOP + 17, { size: 12.5, family: 'sans', color: T.text });
  text(ctx, 'zones_plate_scans.csv', SIDE_WIDTH + 274, TAB_TOP + 17, { size: 12.5, family: 'sans', color: T.muted });
  fillRect(ctx, SIDE_WIDTH, TOOLBAR_TOP - 1, SCREEN_WIDTH, 1, T.border);

  // Notebook toolbar.
  fillRect(ctx, SIDE_WIDTH, TOOLBAR_TOP, SCREEN_WIDTH, 32, T.background);
  const tools: IconName[] = ['download', 'close', 'files', 'play', 'grid', 'sync'];
  tools.forEach((icon, index) => drawIcon(ctx, icon, SIDE_WIDTH + 24 + index * 30, TOOLBAR_TOP + 16, 15, T.muted, 1.3));
  strokeRound(ctx, SIDE_WIDTH + 206, TOOLBAR_TOP + 6, 64, 20, 3, T.border);
  text(ctx, 'Code', SIDE_WIDTH + 216, TOOLBAR_TOP + 17, { size: 12, family: 'sans', color: T.text });
  const kernel = 'Python 3 (ipykernel)';
  text(ctx, kernel, SCREEN_WIDTH - 44, TOOLBAR_TOP + 17, { size: 12.5, family: 'sans', color: T.text, align: 'right' });
  if (busy) circle(ctx, SCREEN_WIDTH - 24, TOOLBAR_TOP + 16, 7, T.muted);
  else ring(ctx, SCREEN_WIDTH - 24, TOOLBAR_TOP + 16, 6.5, T.muted, 1.5);
  fillRect(ctx, SIDE_WIDTH, BODY_TOP - 1, SCREEN_WIDTH, 1, T.border);
}

export function prompt(ctx: CanvasRenderingContext2D, label: string, y: number, color: string = T.muted) {
  text(ctx, label, CELL_X - 10, y, { size: 13, family: 'mono', color, align: 'right' });
}

/** A code cell. Returns the y just under it. */
export function codeCell(ctx: CanvasRenderingContext2D, source: string[], y: number, label: string, active: boolean) {
  const height = source.length * 19 + 14;
  if (active) fillRect(ctx, SIDE_WIDTH + 10, y - 4, 3, height + 8, T.accent);
  fillRound(ctx, CELL_X, y, SCREEN_WIDTH - CELL_X - 24, height, 2, T.panel);
  strokeRound(ctx, CELL_X, y, SCREEN_WIDTH - CELL_X - 24, height, 2, active ? '#424242' : '#2e2e2e');
  prompt(ctx, label, y + 16);
  const grid = createGrid(ctx, { x: CELL_X + 10, y: y + 7, w: 1000, h: height }, 13, 19);
  tokenize(source, 'tsx').forEach((tokens, row) => drawSpans(ctx, grid, 0, row, toSpans(tokens), T.text));
  return y + height;
}

export function dataFrame(ctx: CanvasRenderingContext2D, area: Rect) {
  const widths = [60, 96, 118, 118, 104, 120, 104];
  const rowHeight = 26;
  let x = area.x;
  const header = area.y;
  SUMMARY.columns.forEach((column, index) => {
    x += widths[index];
    text(ctx, column, x - 10, header + 13, { size: 12.5, weight: 700, family: 'sans', color: T.text, align: 'right' });
  });
  const width = widths.reduce((sum, value) => sum + value, 0);
  fillRect(ctx, area.x, header + 26, width, 1, '#5a5a5a');
  SUMMARY.rows.forEach((row, rowIndex) => {
    const top = header + 27 + rowIndex * rowHeight;
    if (rowIndex % 2 === 0) fillRect(ctx, area.x, top, width, rowHeight, '#1c1c1c');
    let cellX = area.x;
    row.forEach((value, index) => {
      cellX += widths[index];
      text(ctx, value, cellX - 10, top + rowHeight / 2 + 1, {
        size: 12.5,
        weight: index === 0 ? 700 : 400,
        family: 'sans',
        color: T.text,
        align: 'right',
      });
    });
  });
}
