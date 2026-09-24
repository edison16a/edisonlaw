import { rgba } from '../../color';
import { dotGrid, sparkles } from '../../draw/decor';
import { linear, paintBackground } from '../../draw/gradients';
import { fill, stroke } from '../../draw/paint';
import { circle, polygon, roundRect } from '../../draw/shapes';
import type { Scene } from '../../types';
import { paintDish } from './dish';
import { paintFrame, paintToolhead } from './gantry';

/** AutoLab: a robotic gantry pipetting into a petri dish of neurons, on a bright mint bench. */

const BENCH_TOP = 522;

function paintRoom({ ctx, w, h }: Scene) {
  paintBackground(ctx, w, h, ['#e3fff4', '#b3f0dd', '#74d8c4'], 65);
  fill(ctx, circle(512, 300, 290), rgba('#ffffff', 0.4));
  fill(ctx, circle(512, 300, 200), rgba('#ffffff', 0.25));
  dotGrid(ctx, 250, 196, 6, 4, 22, 3.5, rgba('#0f6b62', 0.25));
  dotGrid(ctx, 670, 330, 6, 4, 22, 3.5, rgba('#0f6b62', 0.25));

  fill(ctx, roundRect(-20, BENCH_TOP, w + 40, h, 0), linear(ctx, 0, BENCH_TOP, 0, h, ['#2f9d92', '#1f7a72']));
  fill(ctx, roundRect(-20, BENCH_TOP, w + 40, 8, 0), rgba('#ffffff', 0.35));
}

/** Little X, Y and Z arrows in the corner of the bench. */
function paintAxes(ctx: CanvasRenderingContext2D) {
  const [ox, oy] = [104, 588];
  const axes: [number, number, string][] = [
    [46, 0, '#ff5d6c'],
    [30, -22, '#58e08c'],
    [0, -46, '#4a9bff'],
  ];
  axes.forEach(([dx, dy, color]) => {
    const line = new Path2D();
    line.moveTo(ox, oy);
    line.lineTo(ox + dx, oy + dy);
    stroke(ctx, line, color, 5);
    const angle = Math.atan2(dy, dx);
    const tip: [number, number] = [ox + dx + Math.cos(angle) * 8, oy + dy + Math.sin(angle) * 8];
    const side = (turn: number): [number, number] => [tip[0] - Math.cos(angle + turn) * 12, tip[1] - Math.sin(angle + turn) * 12];
    fill(ctx, polygon([tip, side(0.5), side(-0.5)]), color);
  });
  fill(ctx, circle(ox, oy, 5), '#ffffff');
}

export function paintAutolab(scene: Scene) {
  const { ctx, random } = scene;
  paintRoom(scene);
  paintFrame(ctx);
  paintDish(ctx, random);
  paintToolhead(ctx);
  paintAxes(ctx);
  sparkles(ctx, [
    { x: 272, y: 300, r: 20 },
    { x: 780, y: 404, r: 14 },
    { x: 700, y: 226, r: 10 },
  ]);
}
