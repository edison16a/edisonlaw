import { step } from '../../../anim/timeline';
import { VIEW_HEIGHT, VIEW_WIDTH, zoomIn } from '../../../draw/view';
import { pixelScale } from '../../../resolution';
import type { PainterFactory } from '../../../types';
import { EDIT_COLUMN, ROWS } from './data';
import { drawViewer, renderMicrograph } from './microscope';
import { drawGrid, drawSheetChrome, drawSheetTabs, TABS_HEIGHT } from './sheet';

/** Seconds the selection rests on each cell as it walks down the OD600 column. */
const DWELL = 1.4;
const CURSOR_PATH: [number, number][] = [
  [212, 150],
  [236, 132],
  [262, 160],
  [240, 186],
];

/** The viewer window's place over the sheet, in the zoomed view. */
const VIEWER = { x: 466, y: 104, w: VIEW_WIDTH - 466 - 14 };

/** Stanford lab notebook, zoomed in: a growth and imaging log beside a fluorescence micrograph. */
export const stanford: PainterFactory = () => {
  let micrograph: HTMLCanvasElement | null = null;

  return {
    stillTime: DWELL * 5,
    frameKey: (time) => String(step(time, 1 / DWELL)),
    paint(ctx, time) {
      const tick = step(time, 1 / DWELL);
      const row = 1 + (tick % ROWS.length);
      const cellName = `${String.fromCharCode(65 + EDIT_COLUMN)}${row + 1}`;
      zoomIn(ctx);
      const value = ROWS[row - 1][EDIT_COLUMN];
      drawSheetChrome(ctx, cellName, value || `=AVERAGE(${cellName.replace(/\d+/, '2')}:${cellName.replace(/\d+/, String(ROWS.length + 1))})`);
      drawGrid(ctx, row);
      drawSheetTabs(ctx);
      micrograph ??= renderMicrograph(pixelScale(ctx));
      drawViewer(ctx, { ...VIEWER, h: VIEW_HEIGHT - VIEWER.y - TABS_HEIGHT - 12 }, micrograph, CURSOR_PATH[tick % CURSOR_PATH.length]);
    },
    dispose() {
      if (micrograph) micrograph.width = 0;
      micrograph = null;
    },
  };
};
