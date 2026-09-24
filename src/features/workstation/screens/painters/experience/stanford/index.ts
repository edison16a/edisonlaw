import { step } from '../../../anim/timeline';
import { SCREEN_HEIGHT, type PainterFactory } from '../../../types';
import { EDIT_COLUMN, ROWS } from './data';
import { drawViewer, renderMicrograph } from './microscope';
import { drawGrid, drawSheetChrome, drawSheetTabs } from './sheet';

/** Seconds the selection rests on each cell as it walks down the OD600 column. */
const DWELL = 1.4;
const CURSOR_PATH: [number, number][] = [
  [212, 150],
  [236, 132],
  [262, 160],
  [240, 186],
];

/** Stanford lab notebook: a growth and imaging log beside a fluorescence micrograph. */
export const stanford: PainterFactory = () => {
  let micrograph: HTMLCanvasElement | null = null;

  return {
    stillTime: DWELL * 5,
    frameKey: (time) => String(step(time, 1 / DWELL)),
    paint(ctx, time) {
      const tick = step(time, 1 / DWELL);
      const row = 1 + (tick % ROWS.length);
      const cellName = `${String.fromCharCode(65 + EDIT_COLUMN)}${row + 1}`;
      const value = ROWS[row - 1][EDIT_COLUMN];
      drawSheetChrome(ctx, cellName, value || `=AVERAGE(${cellName.replace(/\d+/, '2')}:${cellName.replace(/\d+/, String(ROWS.length + 1))})`);
      drawGrid(ctx, row);
      drawSheetTabs(ctx);
      micrograph ??= renderMicrograph();
      drawViewer(ctx, { x: 764, y: 148, w: 500, h: SCREEN_HEIGHT - 148 - 46 }, micrograph, CURSOR_PATH[tick % CURSOR_PATH.length]);
    },
    dispose() {
      if (micrograph) micrograph.width = 0;
      micrograph = null;
    },
  };
};
