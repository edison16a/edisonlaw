import { lighten, rgba } from '../../color';
import { linear } from '../../draw/gradients';
import { fill, raised, stroke } from '../../draw/paint';
import { circle, polygon, roundRect } from '../../draw/shapes';
import { DISH } from './dish';

/** The X, Y and Z gantry: two posts, a beam, a sliding carriage, a camera and the pipette. */

const FRAME = '#1f2b3a';
const FRAME_LIGHT = '#34465c';
const CARRIAGE = '#ffc53d';
const MEDIUM = '#ff7396';

const SHADOW = { color: 'rgba(8, 48, 46, 0.3)' };

/** Slack cable from the carriage to the right post, the drag chain every gantry has. */
function paintCable(ctx: CanvasRenderingContext2D) {
  const cable = new Path2D();
  cable.moveTo(590, 150);
  cable.bezierCurveTo(660, 290, 800, 250, 850, 176);
  stroke(ctx, cable, '#141d28', 12);
  stroke(ctx, cable, rgba('#5c7089', 0.9), 6, { dash: [2, 9], cap: 'butt' });
}

/** Posts, beam, motors and the cable. Painted behind the dish. */
export function paintFrame(ctx: CanvasRenderingContext2D) {
  [140, 848].forEach((x) => {
    raised(ctx, roundRect(x, 140, 36, 390, 8), FRAME, SHADOW);
    fill(ctx, roundRect(x + 4, 150, 8, 370, 4), FRAME_LIGHT);
    fill(ctx, roundRect(x - 14, 516, 64, 16, 6), FRAME);
  });

  raised(ctx, roundRect(112, 96, 800, 52, 12), FRAME, SHADOW);
  fill(ctx, roundRect(122, 102, 780, 8, 4), FRAME_LIGHT);
  fill(ctx, roundRect(150, 124, 724, 6, 3), rgba('#000000', 0.35));

  [72, 892].forEach((x) => {
    raised(ctx, roundRect(x, 86, 60, 72, 10), '#141d28', SHADOW);
    fill(ctx, circle(x + 30, 122, 14), FRAME_LIGHT);
    fill(ctx, circle(x + 30, 122, 5), '#0b1118');
  });
  paintCable(ctx);
}

function paintCarriage(ctx: CanvasRenderingContext2D) {
  const { x } = DISH;
  raised(ctx, roundRect(x - 78, 78, 156, 92, 16), linear(ctx, 0, 78, 0, 170, [lighten(CARRIAGE, 0.25), CARRIAGE, '#f2a516']), SHADOW);
  fill(ctx, roundRect(x - 66, 86, 132, 8, 4), rgba('#ffffff', 0.45));
  [-52, 52].forEach((dx) => fill(ctx, circle(x + dx, 150, 6), rgba(FRAME, 0.7)));
  fill(ctx, circle(x + 40, 110, 6), '#3ee07a');

  // Z axis plate with its lead screw.
  raised(ctx, roundRect(x - 30, 160, 60, 104, 10), FRAME, SHADOW);
  const screw = new Path2D();
  for (let y = 172; y < 252; y += 10) {
    screw.moveTo(x - 8, y + 4);
    screw.lineTo(x + 8, y);
  }
  stroke(ctx, screw, FRAME_LIGHT, 3);

  // Camera beside the pipette with a soft cone of light onto the dish.
  raised(ctx, roundRect(x + 36, 186, 46, 44, 10), '#141d28', SHADOW);
  fill(ctx, circle(x + 59, 232, 14), FRAME_LIGHT);
  fill(ctx, circle(x + 59, 232, 7), '#7fe8ff');
  fill(ctx, polygon([[x + 48, 240], [x + 70, 240], [x + 150, 430], [x - 10, 430]]), rgba('#ffffff', 0.16));
}

function paintPipette(ctx: CanvasRenderingContext2D) {
  const { x } = DISH;
  raised(ctx, roundRect(x - 22, 232, 44, 108, 14), linear(ctx, x - 22, 0, x + 22, 0, ['#ffffff', '#e9f2fa', '#c9d6e4']), SHADOW);
  fill(ctx, roundRect(x - 22, 300, 44, 12, 0), '#3d8bff');
  const tip = polygon([[x - 14, 338], [x + 14, 338], [x + 3, 398], [x - 3, 398]]);
  fill(ctx, tip, rgba('#ffffff', 0.85));
  fill(ctx, polygon([[x - 8, 368], [x + 8, 368], [x + 3, 398], [x - 3, 398]]), MEDIUM);

  // Falling droplet.
  const drop = new Path2D();
  drop.moveTo(x, 408);
  drop.bezierCurveTo(x + 10, 422, x + 9, 434, x, 434);
  drop.bezierCurveTo(x - 9, 434, x - 10, 422, x, 408);
  fill(ctx, drop, MEDIUM);
  fill(ctx, circle(x - 3, 426, 2.5), rgba('#ffffff', 0.8));
}

/** Carriage, camera and pipette. Painted over the dish so the light cone falls on it. */
export function paintToolhead(ctx: CanvasRenderingContext2D) {
  paintCarriage(ctx);
  paintPipette(ctx);
}
