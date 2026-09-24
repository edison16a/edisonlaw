import { drawIcon, type IconName } from '../../../draw/icons';
import { clipped, fillRect, fillRound, strokeRound, type Rect } from '../../../draw/shapes';
import { fitText, font, measure, text } from '../../../draw/text';
import { avatar } from '../../../draw/widgets';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../../../draw/view';
import { COLUMNS, EDIT_COLUMN, ROWS } from './data';
import { LAB_SHEET_THEME as T } from './theme';

/** A spreadsheet in the style of Google Sheets, holding the lab's growth and imaging log. */

const GRID_TOP = 96;
const ROW_HEIGHT = 20;
const HEADER_HEIGHT = 18;
const ROW_LABELS = 32;
export const TABS_HEIGHT = 26;
const CELL_TEXT = 11;
/** Columns past the logged data, so the grid runs on under the viewer window. */
const EXTRA_COLUMNS = [72, 72, 72, 72];

function sheetsIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  fillRound(ctx, x, y, 18, 23, 3, T.sheets);
  fillRect(ctx, x + 4, y + 8, 10, 9, '#ffffff');
  fillRect(ctx, x + 8.5, y + 8, 1, 9, T.sheets);
  fillRect(ctx, x + 4, y + 12, 10, 1, T.sheets);
}

export function drawSheetChrome(ctx: CanvasRenderingContext2D, cellName: string, cellValue: string) {
  fillRect(ctx, 0, 0, VIEW_WIDTH, GRID_TOP, T.chrome);
  sheetsIcon(ctx, 12, 8);
  text(ctx, 'IFSS lab notebook, summer 2024', 40, 15, { size: 16, family: 'sans', color: T.text });
  const menu = { size: 11, family: 'sans', color: T.text } as const;
  ['File', 'Edit', 'View', 'Insert', 'Format', 'Data', 'Tools', 'Help'].reduce((x, item) => {
    text(ctx, item, x, 32, menu);
    return x + measure(ctx, item, menu) + 12;
  }, 40);
  fillRound(ctx, VIEW_WIDTH - 110, 10, 66, 26, 13, T.select);
  text(ctx, 'Share', VIEW_WIDTH - 77, 24, { size: 12, weight: 600, family: 'sans', color: '#0b1a33', align: 'center' });
  avatar(ctx, 'EL', VIEW_WIDTH - 22, 23, 12, T.cardinal);

  // Toolbar pill.
  fillRound(ctx, 10, 44, VIEW_WIDTH - 20, 24, 12, '#2d2d31');
  const tools: IconName[] = ['search', 'sync', 'download', 'grid', 'layers', 'chart'];
  tools.forEach((icon, index) => drawIcon(ctx, icon, 26 + index * 24, 56, 13, T.muted, 1.3));
  ['100%', 'Arial', '10'].reduce((x, label) => {
    text(ctx, label, x, 57, { size: 11, family: 'sans', color: T.text });
    return x + measure(ctx, label, { size: 11, family: 'sans' }) + 18;
  }, 178);
  ['B', 'I', 'S'].forEach((label, index) => {
    text(ctx, label, 290 + index * 20, 57, { size: 12, weight: index === 0 ? 700 : 400, italic: index === 1, family: 'sans', color: T.text, align: 'center' });
  });

  // Name box and formula bar.
  fillRect(ctx, 0, 72, VIEW_WIDTH, 1, T.grid);
  text(ctx, cellName, 14, 84, { size: 11, family: 'sans', color: T.text });
  fillRect(ctx, 54, 75, 1, 18, T.grid);
  text(ctx, 'fx', 66, 84, { size: 11.5, italic: true, family: 'sans', color: T.faint });
  text(ctx, cellValue, 88, 84, { size: 11.5, family: 'sans', color: T.text });
  fillRect(ctx, 0, GRID_TOP - 1, VIEW_WIDTH, 1, T.grid);
}

function odFill(value: string) {
  const od = Number(value);
  if (!value || Number.isNaN(od)) return null;
  const t = Math.min(1, od / 1.4);
  return `rgba(52,168,83,${0.12 + t * 0.55})`;
}

export function drawGrid(ctx: CanvasRenderingContext2D, selectedRow: number) {
  const bottom = VIEW_HEIGHT - TABS_HEIGHT;
  fillRect(ctx, 0, GRID_TOP, VIEW_WIDTH, bottom - GRID_TOP, T.background);
  const widths = [...COLUMNS.map((column) => column.width), ...EXTRA_COLUMNS];
  const lefts = widths.reduce<number[]>((acc, width, index) => [...acc, acc[index] + width], [ROW_LABELS]);
  const rowCount = Math.ceil((bottom - GRID_TOP - HEADER_HEIGHT) / ROW_HEIGHT);
  const bodyTop = GRID_TOP + HEADER_HEIGHT;

  // Column letters and row numbers.
  fillRect(ctx, 0, GRID_TOP, VIEW_WIDTH, HEADER_HEIGHT, T.header);
  fillRect(ctx, 0, GRID_TOP, ROW_LABELS, bottom - GRID_TOP, T.header);
  widths.forEach((width, index) => {
    const active = index === EDIT_COLUMN;
    if (active) fillRect(ctx, lefts[index], GRID_TOP, width, HEADER_HEIGHT, '#3c4a63');
    text(ctx, String.fromCharCode(65 + index), lefts[index] + width / 2, GRID_TOP + HEADER_HEIGHT / 2 + 1, { size: 10, family: 'sans', color: active ? T.select : T.muted, align: 'center' });
  });

  for (let row = 0; row < rowCount; row++) {
    const y = bodyTop + row * ROW_HEIGHT;
    const values = row === 0 ? COLUMNS.map((column) => column.label) : ROWS[row - 1];
    if (row === selectedRow) fillRect(ctx, 0, y, ROW_LABELS, ROW_HEIGHT, '#3c4a63');
    text(ctx, String(row + 1), ROW_LABELS / 2, y + ROW_HEIGHT / 2 + 1, { size: 10, family: 'sans', color: row === selectedRow ? T.select : T.muted, align: 'center' });
    if (row === 0) fillRect(ctx, ROW_LABELS, y, lefts[COLUMNS.length] - ROW_LABELS, ROW_HEIGHT, T.cardinal);
    values?.forEach((value, col) => {
      const rect: Rect = { x: lefts[col], y, w: widths[col], h: ROW_HEIGHT };
      const fill = row > 0 && col === EDIT_COLUMN ? odFill(value) : null;
      if (fill) fillRect(ctx, rect.x, rect.y, rect.w, rect.h, fill);
      const numeric = row > 0 && COLUMNS[col].numeric;
      clipped(ctx, rect, () => {
        ctx.font = font(CELL_TEXT, row === 0 ? 700 : 400, 'sans');
        const style = { size: CELL_TEXT, weight: row === 0 ? 700 : 400, family: 'sans', color: row === 0 ? '#ffffff' : T.text } as const;
        const shown = fitText(ctx, value, rect.w - 8);
        text(ctx, shown, numeric ? rect.x + rect.w - 5 : rect.x + 5, y + ROW_HEIGHT / 2 + 1, { ...style, align: numeric ? 'right' : 'left' });
      });
    });
  }

  // Grid lines, with the frozen header row drawn heavier.
  ctx.fillStyle = T.grid;
  lefts.forEach((x) => ctx.fillRect(x, GRID_TOP, 1, bottom - GRID_TOP));
  for (let row = 0; row <= rowCount; row++) ctx.fillRect(0, bodyTop + row * ROW_HEIGHT, VIEW_WIDTH, 1);
  fillRect(ctx, 0, bodyTop + ROW_HEIGHT - 1, VIEW_WIDTH, 2.5, '#4a4a52');

  const x = lefts[EDIT_COLUMN];
  const y = bodyTop + selectedRow * ROW_HEIGHT;
  strokeRound(ctx, x - 1, y - 1, widths[EDIT_COLUMN] + 2, ROW_HEIGHT + 2, 0, T.select, 2);
  fillRect(ctx, x + widths[EDIT_COLUMN] - 2.5, y + ROW_HEIGHT - 2.5, 5, 5, T.select);
}

export function drawSheetTabs(ctx: CanvasRenderingContext2D) {
  const top = VIEW_HEIGHT - TABS_HEIGHT;
  fillRect(ctx, 0, top, VIEW_WIDTH, TABS_HEIGHT, T.chrome);
  fillRect(ctx, 0, top, VIEW_WIDTH, 1, T.grid);
  text(ctx, '+', 17, top + TABS_HEIGHT / 2, { size: 16, family: 'sans', color: T.muted, align: 'center' });
  let x = 36;
  ['Growth log', 'Imaging', 'Plate reader'].forEach((label, index) => {
    const style = { size: 11, weight: index === 0 ? 600 : 400, family: 'sans', color: index === 0 ? T.select : T.muted } as const;
    const width = measure(ctx, label, style) + 22;
    if (index === 0) fillRound(ctx, x, top + 4, width, TABS_HEIGHT - 8, 5, '#2f3a4d');
    text(ctx, label, x + 11, top + TABS_HEIGHT / 2 + 1, style);
    x += width + 4;
  });
}
