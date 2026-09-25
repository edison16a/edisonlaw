/**
 * AutoLab: Edison's line drawing of the robot, a printer based motion stage with the pipette
 * housing, the imaging unit and the Neurotech@Berkeley panel, centred on white.
 * Source: Edison's own render (see lib/private.mjs), 1074 x 684 on white.
 */
import { CARD_HEIGHT } from '../lib/encode.mjs';
import { dataUrl, shell } from '../lib/layouts/base.mjs';
import { readSource } from '../lib/private.mjs';

/** The drawing inside the render, with 2 px to spare on every side, in its pixels. */
const DRAWING = { x: 232, y: 16, width: 507, height: 640 };
const SOURCE = { width: 1074, height: 684 };
/** The drawing's height on the card: 85%, so the margins above and below are 7.5% each. */
const HEIGHT = CARD_HEIGHT * 0.85;

export async function capture({ compose }) {
  const src = dataUrl(await readSource('autolab-robot.png'));
  const k = HEIGHT / DRAWING.height;
  // The render's backdrop is a hair off white in places, so it is lifted to pure white.
  const css = `
body { display: grid; place-items: center; }
.frame { position: relative; overflow: hidden; width: ${DRAWING.width * k}px; height: ${HEIGHT}px; }
.frame img { position: absolute; left: ${-DRAWING.x * k}px; top: ${-DRAWING.y * k}px;
  width: ${SOURCE.width * k}px; height: ${SOURCE.height * k}px; filter: brightness(1.033); }`;
  const html = shell({ background: '#ffffff', css, body: `<div class="frame"><img src="${src}"></div>` });
  return { png: await compose(html), quality: 0.92 };
}
