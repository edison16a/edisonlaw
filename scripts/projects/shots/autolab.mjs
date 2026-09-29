/**
 * AutoLab: Edison's 3D render of the robot, the printer based motion stage with the pipette, the
 * imaging unit, media and waste bottles and the control boards, in its clear enclosure, centred on
 * the render's own near black backdrop.
 * Source: Edison's own render (see lib/private.mjs), 1406 x 1154 on rgb(19, 18, 21).
 */
import { CARD_HEIGHT } from '../lib/encode.mjs';
import { dataUrl, shell } from '../lib/layouts/base.mjs';
import { readSource } from '../lib/private.mjs';

/** The robot inside the render, with a few pixels to spare on every side, in its pixels. */
const ROBOT = { x: 28, y: 92, width: 1284, height: 1008 };
const SOURCE = { width: 1406, height: 1154 };
/** The render's backdrop, so the card around the robot runs on without a seam. */
const BACKDROP = 'rgb(19, 18, 21)';
/** The robot's height on the card: 88%, leaving 12% to share above and below. */
const HEIGHT = CARD_HEIGHT * 0.88;
/** Raised by this share of the card, so it sits a little above centre: 2% above it and 10% below. */
const LIFT = CARD_HEIGHT * 0.04;

export async function capture({ compose }) {
  const src = dataUrl(await readSource('autolab-render.webp'));
  const k = HEIGHT / ROBOT.height;
  const css = `
body { display: grid; place-items: center; }
.frame { position: relative; overflow: hidden; width: ${ROBOT.width * k}px; height: ${HEIGHT}px; transform: translateY(${-LIFT}px); }
.frame img { position: absolute; left: ${-ROBOT.x * k}px; top: ${-ROBOT.y * k}px;
  width: ${SOURCE.width * k}px; height: ${SOURCE.height * k}px; }`;
  const html = shell({ background: BACKDROP, css, body: `<div class="frame"><img src="${src}"></div>` });
  return { png: await compose(html), quality: 0.92 };
}
