import { cardBend } from './appearance';
import { CARD_HEIGHT, CARD_WIDTH, cardPose, createPose, SPIRAL, sweepOffset } from './geometry';
import { CAMERA, viewFov } from './lens';

/** A box on the stage in CSS pixels from its top left corner. */
export interface StageRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** Space the focused card keeps from the panel beside it and from the stage's left edge, in CSS pixels. */
export const CLEARANCE = {
  panel: 48,
  edge: 24,
} as const;

const pose = createPose();

/**
 * Where the focused card sits on a `width` by `height` stage once it has come
 * forward, with the picture slid `shift` pixels left and `lift` pixels up for
 * the panel, and shrunk to `zoom` of its size. It follows the camera, the card's bend and the strand's sweep the
 * way the canvas draws them, in plain math so the page can place the
 * screenshot row and the step buttons around the card without loading three.js.
 *
 * `left` and `right` are its sides halfway up, and `top` and `bottom` its top
 * and bottom edges. The settled card is a flat rectangle, so these are its
 * corners too.
 */
export function focusCardRect(width: number, height: number, shift: number, lift: number, zoom = 1): StageRect {
  cardPose(0, 1, 0, pose);
  // Pixels per world unit at one unit from the camera.
  const focal = height / 2 / Math.tan((viewFov(width / height, zoom) * Math.PI) / 360);
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
 * if the focused card would come too close to the panel, as far as the card
 * can go and keep clear of the stage's left edge.
 */
export function shiftForPanel(width: number, height: number, panelLeft: number, preferred: number) {
  const card = focusCardRect(width, height, 0, 0);
  const needed = card.right + CLEARANCE.panel - panelLeft;
  const furthest = card.left - CLEARANCE.edge;
  return Math.max(preferred, Math.min(needed, furthest));
}

/** Room the focused card keeps from the top of the stage, and from a panel stacked below it, in CSS pixels. */
export const STACKED_CLEARANCE = {
  top: 24,
  panel: 24,
} as const;

/** Smallest the scene shrinks to. The stage only stacks the panel where there is room for this much. */
export const MIN_ZOOM = 0.5;

export interface StackedFit {
  /** How far the scene rises, in CSS pixels. */
  lift: number;
  /** How far the scene shrinks, 1 for not at all. */
  zoom: number;
}

/**
 * Where the scene sits on a `width` by `height` stage whose panel is stacked
 * below the spiral, starting `panelTop` pixels down the stage. The focused
 * card keeps clear of the top of the stage, and together with `below` pixels
 * under it for the screenshot row, which depends on the card's width, of the
 * panel. It stays at `preferredLift` and full size whenever that fits, rises
 * no further than it must, and shrinks only when rising is not enough.
 */
export function fitAbovePanel(
  width: number,
  height: number,
  panelTop: number,
  preferredLift: number,
  below: (cardWidth: number) => number,
): StackedFit {
  const card = focusCardRect(width, height, 0, 0);
  // The lens scales the picture about the middle of the stage, so measure the card from there.
  const middle = height / 2;
  const above = middle - card.top;
  const under = card.bottom - middle;
  const room = panelTop - STACKED_CLEARANCE.panel - STACKED_CLEARANCE.top;
  const needs = (zoom: number) => (above + under) * zoom + below((card.right - card.left) * zoom);

  let zoom = 1;
  if (needs(1) > room) {
    let low = MIN_ZOOM;
    let high = 1;
    for (let step = 0; step < 20; step++) {
      const mid = (low + high) / 2;
      if (needs(mid) <= room) low = mid;
      else high = mid;
    }
    zoom = low;
  }
  // The highest lift keeps the card's top clear of the stage top, the lowest the row clear of the panel.
  const highest = middle - above * zoom - STACKED_CLEARANCE.top;
  const lowest = middle + under * zoom + below((card.right - card.left) * zoom) - (panelTop - STACKED_CLEARANCE.panel);
  return { lift: Math.min(highest, Math.max(lowest, preferredLift)), zoom };
}
