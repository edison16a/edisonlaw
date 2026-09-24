import { cardBend } from './appearance';
import { CARD_HEIGHT, CARD_WIDTH, cardPose, createPose, SPIRAL, sweepOffset } from './geometry';
import { CAMERA, fitFov } from './lens';

/** A box on the stage in CSS pixels from its top left corner. */
export interface StageRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** The round arrow buttons beside the focused card, in CSS pixels. */
export const ARROW = {
  size: 48,
  /** Space between a button and the card's side. */
  gap: 20,
  /** Space kept between a button and the panel or the edge of the stage. */
  margin: 16,
} as const;

const pose = createPose();

/**
 * Where the focused card sits on a `width` by `height` stage once it has come
 * forward, with the picture slid `shift` pixels left and `lift` pixels up for
 * the panel. It follows the camera, the card's bend and the strand's sweep the
 * way the canvas draws them, in plain math so the page can place the arrows
 * and the screenshot row around the card without loading three.js.
 *
 * `left` and `right` are its sides halfway up, where the arrows sit, and
 * `top` and `bottom` its top and bottom edges. The settled card is a flat
 * rectangle, so these are its corners too.
 */
export function focusCardRect(width: number, height: number, shift: number, lift: number): StageRect {
  cardPose(0, 1, 0, pose);
  // Pixels per world unit at one unit from the camera.
  const focal = height / 2 / Math.tan((fitFov(width / height) * Math.PI) / 360);
  // A card that still curves would pull its sides back toward the axis.
  const curvature = cardBend(0, pose.focus) / SPIRAL.radius;
  const angle = (CARD_WIDTH / 2) * curvature;
  const curved = Math.abs(curvature) > 1e-6;
  const halfWidth = (curved ? Math.sin(angle) / curvature : CARD_WIDTH / 2) * pose.scale;
  const halfHeight = (CARD_HEIGHT / 2) * pose.scale;
  const sag = curved ? (Math.cos(angle) - 1) / curvature : 0;
  const depth = CAMERA.z - pose.z - sag * pose.scale;

  const toX = (x: number, y: number) => width / 2 + ((x + sweepOffset(y, pose.y, pose.focus)) / depth) * focal - shift;
  const toY = (y: number) => height / 2 - (y / depth) * focal - lift;
  return {
    left: toX(pose.x - halfWidth, pose.y),
    right: toX(pose.x + halfWidth, pose.y),
    top: toY(pose.y + halfHeight),
    bottom: toY(pose.y - halfHeight),
  };
}

/**
 * How far the scene slides left for a panel beside it that starts `panelLeft`
 * pixels from the left of the stage. It starts from `preferred`, and slides on
 * if the next arrow would run into the panel, as far as the previous arrow can
 * go and stay on the stage.
 */
export function shiftForPanel(width: number, height: number, panelLeft: number, preferred: number) {
  const card = focusCardRect(width, height, 0, 0);
  const reach = ARROW.gap + ARROW.size + ARROW.margin;
  const needed = card.right + reach - panelLeft;
  const furthest = card.left - reach;
  return Math.max(preferred, Math.min(needed, furthest));
}
