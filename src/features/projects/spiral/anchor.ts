import { cardBend } from './appearance';
import { CARD_HEIGHT, CARD_WIDTH, cardPose, createPose, SPIRAL } from './geometry';
import { CAMERA, fitFov } from './lens';

/** A box on the stage in CSS pixels from its top left corner. */
export interface StageRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const pose = createPose();

/**
 * Where the focused card sits on a `width` by `height` stage once it has come
 * forward, with the picture slid `shift` pixels left and `lift` pixels up for
 * the panel. It follows the camera, the card's bend and the strand's sweep the
 * way the canvas draws them, in plain math so the page can place the arrows
 * beside the card without loading three.js.
 *
 * The sweep leans the card's sides a little, so `left` and `right` are its
 * sides halfway up, where the arrows sit, and `top` and `bottom` its highest
 * and lowest corners.
 */
export function focusCardRect(width: number, height: number, shift: number, lift: number): StageRect {
  cardPose(0, 1, 0, pose);
  // Pixels per world unit at one unit from the camera.
  const focal = height / 2 / Math.tan((fitFov(width / height) * Math.PI) / 360);
  // The settled card relaxes almost flat, so its sides fall back only a little.
  const curvature = cardBend(0, pose.focus) / SPIRAL.radius;
  const angle = (CARD_WIDTH / 2) * curvature;
  const halfWidth = (Math.sin(angle) / curvature) * pose.scale;
  const halfHeight = (CARD_HEIGHT / 2) * pose.scale;
  const depth = CAMERA.z - pose.z - ((Math.cos(angle) - 1) / curvature) * pose.scale;

  const toX = (x: number, y: number) => width / 2 + ((x + SPIRAL.sweep * y * y) / depth) * focal - shift;
  const toY = (y: number) => height / 2 - (y / depth) * focal - lift;
  return {
    left: toX(pose.x - halfWidth, pose.y),
    right: toX(pose.x + halfWidth, pose.y),
    top: toY(pose.y + halfHeight),
    bottom: toY(pose.y - halfHeight),
  };
}
