import { drawIcon, type IconName } from '../../../draw/icons';
import { clipped, fillRect, fillRound, strokeRound, type Rect } from '../../../draw/shapes';
import { fitText, font, measure, text } from '../../../draw/text';
import { avatar } from '../../../draw/widgets';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../types';
import { COLUMNS, EDIT_COLUMN, ROWS } from './data';
import { LAB_SHEET_THEME as T } from './theme';

/** A spreadsheet in the style of Google Sheets, holding the lab's growth and imaging log. */

export const GRID_TOP = 134;
const ROW_HEIGHT = 24;
const HEADER_HEIGHT = 22;
const ROW_LABELS = 42;
const TABS_HEIGHT = 30;
/** Columns past the logged data, so the grid runs on under the viewer window. */
const EXTRA_COLUMNS = [96, 96, 96, 96, 96, 96];

function sheetsIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  fillRound(ctx, x, y, 22, 28, 3, T.sheets);
  fillRect(ctx, x + 5, y + 10, 12, 11, '#ffffff');
  fillRect(ctx, x + 10.5, y + 10, 1, 11, T.sheets);
  fillRect(ctx, x + 5, y + 15, 12, 1, T.sheets);
}

export function drawSheetChrome(ctx: CanvasRenderingContext2D, cellName: string, cellValue: string) {
  fillRect(ctx, 0, 0, SCREEN_WIDTH, GRID_TOP, T.chrome);
  sheetsIcon(ctx, 16, 10);
  text(ctx, 'IFSS lab notebook, summer 2024', 50, 18, { size: 16, family: 'sans', color: T.text });
  const menu = { size: 12.5, family: 'sans', color: T.text } as const;
  ['File', 'Edit', 'View', 'Insert', 'Format', 'Data', 'Tools', 'Extensions', 'Help'].reduce((x, item) => {
    text(ctx, item, x, 38, menu);
    return x + measure(ctx, item, menu) + 16;
  }, 50);
  fillRound(ctx, SCREEN_WIDTH - 140, 12, 84, 32, 16, T.select);
  text(ctx, 'Share', SCREEN_WIDTH - 98, 29, { size: 13, weight: 600, family: 'sans', color: '#0b1a33', align: 'center' });
  avatar(ctx, 'EL', SCREEN_WIDTH - 28, 28, 15, T.cardinal);

  // Toolbar pill.
  fillRound(ctx, 12, 58, SCREEN_WIDTH - 24, 34, 17, '#2d2d31');
  const tools: IconName[] = ['search', 'sync', 'download', 'grid', 'layers', 'chart', 'split'];
  tools.forEach((icon, index) => drawIcon(ctx, icon, 34 + index * 32, 75, 16, T.muted, 1.3));
  ['100%', 'Arial', '10'].reduce((x, label) => {
    text(ctx, label, x, 76, { size: 12.5, family: 'sans', color: T.text });
    return x + measure(ctx, label, { size: 12.5, family: 'sans' }) + 26;
  }, 272);
  ['B', 'I', 'S'].forEach((label, index) => {
    text(ctx, label, 420 + index * 28, 76, { size: 14, weight: index === 0 ? 700 : 400, italic: index === 1, family: 'sans', color: T.text, align: 'center' });
  });

  // Name box and formula bar.
  fillRect(ctx, 0, 100, SCREEN_WIDTH, 1, T.grid);
  text(ctx, cellName, 20, 117, { size: 12.5, family: 'sans', color: T.text });
  fillRect(ctx, 76, 104, 1, 26, T.grid);
  text(ctx, 'fx', 92, 117, { size: 13, italic: true, family: 'sans', color: T.faint });
  text(ctx, cellValue, 120, 117, { size: 13, family: 'sans', color: T.text });
  fillRect(ctx, 0, GRID_TOP - 1, SCREEN_WIDTH, 1, T.grid);
}

function odFill(value: string) {
  const od = Number(value);
  if (!value || Number.isNaN(od)) return null;
  const t = Math.min(1, od / 1.4);
  return `rgba(52,168,83,${0.12 + t * 0.55})`;
}

export function drawGrid(ctx: CanvasRenderingContext2D, selectedRow: number) {
  const bottom = SCREEN_HEIGHT - TABS_HEIGHT;
  fillRect(ctx, 0, GRID_TOP, SCREEN_WIDTH, bottom - GRID_TOP, T.background);
  const widths = [...COLUMNS.map((column) => column.width), ...EXTRA_COLUMNS];
  const lefts = widths.reduce<number[]>((acc, width, index) => [...acc, acc[index] + width], [ROW_LABELS]);
  const rowCount = Math.ceil((bottom - GRID_TOP - HEADER_HEIGHT) / ROW_HEIGHT);
  const bodyTop = GRID_TOP + HEADER_HEIGHT;

  // Column letters and row numbers.
  fillRect(ctx, 0, GRID_TOP, SCREEN_WIDTH, HEADER_HEIGHT, T.header);
  fillRect(ctx, 0, GRID_TOP, ROW_LABELS, bottom - GRID_TOP, T.header);
  widths.forEach((width, index) => {
    const active = index === EDIT_COLUMN;
    if (active) fillRect(ctx, lefts[index], GRID_TOP, width, HEADER_HEIGHT, '#3c4a63');
    text(ctx, String.fromCharCode(65 + index), lefts[index] + width / 2, GRID_TOP + 12, { size: 11, family: 'sans', color: active ? T.select : T.muted, align: 'center' });
  });

  for (let row = 0; row < rowCount; row++) {
    const y = bodyTop + row * ROW_HEIGHT;
    const values = row === 0 ? COLUMNS.map((column) => column.label) : ROWS[row - 1];
    if (row === selectedRow) fillRect(ctx, 0, y, ROW_LABELS, ROW_HEIGHT, '#3c4a63');
    text(ctx, String(row + 1), ROW_LABELS / 2, y + 13, { size: 11, family: 'sans', color: row === selectedRow ? T.select : T.muted, align: 'center' });
    if (row === 0) fillRect(ctx, ROW_LABELS, y, lefts[COLUMNS.length] - ROW_LABELS, ROW_HEIGHT, T.cardinal);
    values?.forEach((value, col) => {
      const rect: Rect = { x: lefts[col], y, w: widths[col], h: ROW_HEIGHT };
      const fill = row > 0 && col === EDIT_COLUMN ? odFill(value) : null;
      if (fill) fillRect(ctx, rect.x, rect.y, rect.w, rect.h, fill);
      const numeric = row > 0 && COLUMNS[col].numeric;
      clipped(ctx, rect, () => {
        ctx.font = font(12.5, row === 0 ? 700 : 400, 'sans');
        const style = { size: 12.5, weight: row === 0 ? 700 : 400, family: 'sans', color: row === 0 ? '#ffffff' : T.text } as const;
        const shown = fitText(ctx, value, rect.w - 10);
        text(ctx, shown, numeric ? rect.x + rect.w - 6 : rect.x + 6, y + 13, { ...style, align: numeric ? 'right' : 'left' });
      });
    });
  }

  // Grid lines, with the frozen header row drawn heavier.
  ctx.fillStyle = T.grid;
  lefts.forEach((x) => ctx.fillRect(x, GRID_TOP, 1, bottom - GRID_TOP));
  for (let row = 0; row <= rowCount; row++) ctx.fillRect(0, bodyTop + row * ROW_HEIGHT, SCREEN_WIDTH, 1);
  fillRect(ctx, 0, bodyTop + ROW_HEIGHT - 1, SCREEN_WIDTH, 3, '#4a4a52');

  const x = lefts[EDIT_COLUMN];
  const y = bodyTop + selectedRow * ROW_HEIGHT;
  strokeRound(ctx, x - 1, y - 1, widths[EDIT_COLUMN] + 2, ROW_HEIGHT + 2, 0, T.select, 2);
  fillRect(ctx, x + widths[EDIT_COLUMN] - 3, y + ROW_HEIGHT - 3, 6, 6, T.select);
}

export function drawSheetTabs(ctx: CanvasRenderingContext2D) {
  const top = SCREEN_HEIGHT - TABS_HEIGHT;
  fillRect(ctx, 0, top, SCREEN_WIDTH, TABS_HEIGHT, T.chrome);
  fillRect(ctx, 0, top, SCREEN_WIDTH, 1, T.grid);
  text(ctx, '+', 22, top + 15, { size: 18, family: 'sans', color: T.muted, align: 'center' });
  let x = 52;
  ['Growth log', 'Imaging', 'Plate reader', 'Protocols'].forEach((label, index) => {
    const style = { size: 12.5, weight: index === 0 ? 600 : 400, family: 'sans', color: index === 0 ? T.select : T.muted } as const;
    const width = measure(ctx, label, style) + 28;
    if (index === 0) fillRound(ctx, x, top + 4, width, TABS_HEIGHT - 8, 6, '#2f3a4d');
    text(ctx, label, x + 14, top + 16, style);
    x += width + 6;
  });
}
