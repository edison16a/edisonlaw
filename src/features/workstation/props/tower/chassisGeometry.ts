import { BoxGeometry, Path, ShapeGeometry, type BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { roundedRectShape } from '../../geometry/shapes';
import { GLASS_INNER_X, GLASS_INNER_Z, INNER_BOTTOM, INNER_TOP, TOWER } from './towerSpec';

const PANE_HEIGHT = INNER_TOP - INNER_BOTTOM;
const PANE_Y = (INNER_TOP + INNER_BOTTOM) / 2;
/** The front pane runs from the tray to the corner; the side pane from the rear edge to the front pane. */
const FRONT_PANE_WIDTH = TOWER.depth - TOWER.wall;
const SIDE_PANE_WIDTH = TOWER.length - TOWER.glass;
/** Width of the black print around the edge of each pane. */
const FRIT = 0.009;

function merge(parts: BufferGeometry[]) {
  const merged = mergeGeometries(parts);
  parts.forEach((part) => part.dispose());
  if (!merged) throw new Error('Tower parts could not be merged');
  return merged;
}

/**
 * Both panes of tempered glass in one mesh, so they always blend in the same order and never flicker
 * against each other. They butt together at the front corner without overlapping.
 */
export function createGlassGeometry() {
  const side = new BoxGeometry(SIDE_PANE_WIDTH, PANE_HEIGHT, TOWER.glass);
  side.translate(-TOWER.glass / 2, PANE_Y, GLASS_INNER_Z + TOWER.glass / 2);
  const front = new BoxGeometry(TOWER.glass, PANE_HEIGHT, FRONT_PANE_WIDTH);
  front.translate(GLASS_INNER_X + TOWER.glass / 2, PANE_Y, TOWER.wall / 2);
  return merge([side, front]);
}

/** A flat frame `width` by `height` with a rounded opening `border` in from every edge, facing +Z. */
function fritFrame(width: number, height: number, border: number) {
  const shape = roundedRectShape(width, height, 0.002);
  const opening = roundedRectShape(width - border * 2, height - border * 2, 0.004);
  shape.holes.push(new Path(opening.getPoints(4)));
  return new ShapeGeometry(shape, 4);
}

/**
 * The black ceramic print around the inside edge of both panes. It frames the glass so it reads
 * as glass, and hides where the panes meet the case.
 */
export function createFritGeometry() {
  const side = fritFrame(SIDE_PANE_WIDTH, PANE_HEIGHT, FRIT);
  side.translate(-TOWER.glass / 2, PANE_Y, GLASS_INNER_Z - 0.0004);
  const front = fritFrame(FRONT_PANE_WIDTH, PANE_HEIGHT, FRIT);
  front.rotateY(Math.PI / 2);
  front.translate(GLASS_INNER_X - 0.0004, PANE_Y, TOWER.wall / 2);
  return merge([side, front]);
}
