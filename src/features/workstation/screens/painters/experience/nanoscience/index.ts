import { loopTime } from '../../../anim/timeline';
import { fillRect } from '../../../draw/shapes';
import { SCREEN_HEIGHT, SCREEN_WIDTH, type PainterFactory } from '../../../types';
import { plate, stressStrain, zoneBars } from './figure';
import { BODY_TOP, CELL_X, codeCell, dataFrame, drawChrome } from './notebook';
import { LAB_THEME as T } from './theme';

const LOOP = 11;
/** Seconds the summary cell runs before its table appears. */
const RUNNING = 1.8;

const FIGURE_SOURCE = [
  'fig, axes = plt.subplots(1, 3, figsize=(15, 4.2))',
  'plot_stress_strain(gels, ax=axes[0])',
  "show_plate(plates['E. coli'], zones, ax=axes[1])",
  'plot_zones(zones, ax=axes[2])',
];
const SUMMARY_SOURCE = ["summary = summarize(gels, zones).set_index('sample')", 'summary'];

/** A JupyterLab notebook analysing silver nanoparticle hydrogels for wound care. */
export const nanoscience: PainterFactory = () => ({
  stillTime: RUNNING + 1,
  frameKey: (time) => String(loopTime(time, LOOP) < RUNNING),
  paint(ctx, time) {
    const running = loopTime(time, LOOP) < RUNNING;
    fillRect(ctx, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, T.background);
    drawChrome(ctx, running);

    const figureTop = codeCell(ctx, FIGURE_SOURCE, BODY_TOP + 10, '[13]:', false) + 34;
    stressStrain(ctx, { x: CELL_X + 66, y: figureTop, w: 300, h: 214 });
    plate(ctx, { x: CELL_X + 440, y: figureTop, w: 250, h: 214 });
    zoneBars(ctx, { x: CELL_X + 790, y: figureTop, w: 300, h: 214 });

    const summaryTop = figureTop + 262;
    const tableTop = codeCell(ctx, SUMMARY_SOURCE, summaryTop, running ? '[*]:' : '[14]:', true) + 10;
    if (!running) dataFrame(ctx, { x: CELL_X + 4, y: tableTop, w: 800, h: 160 });
  },
});
