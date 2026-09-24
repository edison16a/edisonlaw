import { rgba } from '../../color';
import { sparkles } from '../../draw/decor';
import { glow } from '../../draw/glow';
import { paintBackground } from '../../draw/gradients';
import { fill, stroke } from '../../draw/paint';
import { circle } from '../../draw/shapes';
import type { Scene } from '../../types';
import { paintTerminal } from './terminal';
import { ITERATIONS, paintTrajectories } from './trajectories';

/** WESTPA dashboard: branching weighted ensemble trajectories over a dark plot, with a terminal below. */

function paintPlot({ ctx, w, h }: Scene) {
  paintBackground(ctx, w, h, ['#062233', '#04141f', '#020a10'], 50);
  glow(ctx, 640, 260, 420, '#0f7c86', 0.4);
  glow(ctx, 900, 560, 280, '#3b2fd0', 0.25);
  fill(ctx, circle(620, 270, 250), rgba('#ffffff', 0.03));

  // Iteration boundaries and progress coordinate bins.
  const grid = new Path2D();
  for (let i = 0; i <= ITERATIONS.count; i++) {
    const x = ITERATIONS.x0 + i * ITERATIONS.step;
    grid.moveTo(x, 70);
    grid.lineTo(x, 500);
  }
  stroke(ctx, grid, rgba('#6fd6e8', 0.16), 1.5, { dash: [4, 8] });
  const bins = new Path2D();
  for (let y = 110; y <= 470; y += 60) {
    bins.moveTo(60, y);
    bins.lineTo(w - 60, y);
  }
  stroke(ctx, bins, rgba('#6fd6e8', 0.07), 1.5);
}

export function paintWestpaDashboard(scene: Scene) {
  const { ctx, random } = scene;
  paintPlot(scene);
  paintTrajectories(ctx, random);
  paintTerminal(ctx);
  sparkles(ctx, [
    { x: 520, y: 560, r: 18 },
    { x: 200, y: 130, r: 12 },
  ]);
}
