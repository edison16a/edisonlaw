import { loopTime } from '../../../anim/timeline';
import { fillRect } from '../../../draw/shapes';
import { VIEW_HEIGHT, VIEW_WIDTH, zoomIn } from '../../../draw/view';
import type { PainterFactory } from '../../../types';
import { plate, stressStrain, zoneBars } from './figure';
import { BODY_TOP, CELL_X, codeCell, dataFrame, drawChrome } from './notebook';
import { LAB_THEME as T } from './theme';

const LOOP = 11;
/** Seconds the summary cell runs before its table appears. */
const RUNNING = 1.8;

const FIGURE_SOURCE = ['fig, axes = plt.subplots(1, 3, figsize=(15, 4.2))', "plot_panels(gels, plates['E. coli'], zones, axes)"];
const SUMMARY_SOURCE = ["summarize(gels, zones).set_index('sample')"];
/** Height of each figure panel, and the room its titles and axis labels take around it. */
const FIGURE_HEIGHT = 118;

/** A JupyterLab notebook analysing silver nanoparticle hydrogels for wound care, zoomed in. */
export const nanoscience: PainterFactory = () => ({
  stillTime: RUNNING + 1,
  frameKey: (time) => String(loopTime(time, LOOP) < RUNNING),
  paint(ctx, time) {
    const running = loopTime(time, LOOP) < RUNNING;
    zoomIn(ctx);
    fillRect(ctx, 0, 0, VIEW_WIDTH, VIEW_HEIGHT, T.background);
    drawChrome(ctx, running);

    const figureTop = codeCell(ctx, FIGURE_SOURCE, BODY_TOP + 8, '[13]:', false) + 24;
    stressStrain(ctx, { x: CELL_X + 44, y: figureTop, w: 180, h: FIGURE_HEIGHT });
    plate(ctx, { x: CELL_X + 262, y: figureTop, w: 150, h: FIGURE_HEIGHT });
    zoneBars(ctx, { x: CELL_X + 484, y: figureTop, w: 180, h: FIGURE_HEIGHT });

    const summaryTop = figureTop + FIGURE_HEIGHT + 36;
    const tableTop = codeCell(ctx, SUMMARY_SOURCE, summaryTop, running ? '[*]:' : '[14]:', true) + 6;
    if (!running) dataFrame(ctx, { x: CELL_X + 4, y: tableTop, w: 560, h: 96 });
  },
});
