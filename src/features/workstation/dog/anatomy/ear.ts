import type { Vec3 } from '../../layout';
import { TONE } from '../dimensions';
import type { Shape } from '../sdf/field';
import { FACE } from './head';
import { cone, ellipsoid, flatLock } from './sculpt';

/**
 * A floppy retriever ear in ear space, built for the left side and mirrored for the right:
 * origin on the skull where the ear hangs from, +X out of the head, +Y up, +Z toward the nose.
 * The leather folds over a soft ridge at the top and hangs as a curved flap that wraps the side of
 * the head, down to the jaw line, with feathered fur along its back edge.
 */
export const EAR = {
  /** Hinge on the left side of the skull, in head space. */
  root: FACE.earRoot,
  /** Resting hang as YXZ Euler angles, a touch of outward flare. */
  rest: [0, 0, 0.03] as Vec3,
} as const;

/** The flap wraps a cylinder around the head's upright axis, which sits this far inside the root. */
const AXIS = { x: -FACE.earRoot[0], z: 0.004 };
const DEG = Math.PI / 180;

/** A point on the wrap at angle `phi` (degrees, positive toward the nose), `radius` from the axis. */
function onWrap(phi: number, y: number, radius: number): Vec3 {
  return [AXIS.x + radius * Math.cos(phi * DEG), y, AXIS.z + radius * Math.sin(phi * DEG)];
}

/** Retrievers' ears are a shade deeper than the coat around them. */
const LEATHER = 0.16;

const leather = (blend: number) => ({ tone: LEATHER, blend, part: 0 });

/** A thin curved piece of the flap, square to the wrap at its angle. */
function panel(phi: number, y: number, radius: number, halfHeight: number, halfWidth: number, blend: number): Shape {
  const tangent: Vec3 = [-Math.sin(phi * DEG), 0, Math.cos(phi * DEG)];
  return ellipsoid(onWrap(phi, y, radius), [0.0088, halfHeight, halfWidth], leather(blend), [0, 1, 0], tangent);
}

export function earShapes(): Shape[] {
  const feather = (path: Vec3[], phi: number, width: number) =>
    flatLock({
      path,
      width,
      flatness: 0.6,
      facing: [Math.cos(phi * DEG), 0, Math.sin(phi * DEG)],
      tones: [TONE.coat, TONE.light],
      blend: 0.01,
      part: 0,
      segments: 5,
    });
  return [
    // The fold at the top, where the leather leaves the skull and turns down.
    cone(onWrap(-30, 0.0, 0.094), onWrap(0, 0.004, 0.097), 0.011, 0.012, leather(0)),
    cone(onWrap(0, 0.004, 0.097), onWrap(28, 0.0, 0.094), 0.012, 0.011, leather(0.008)),
    // The flap: three columns round the head, two rows down, closing in a round tip.
    panel(-22, -0.032, 0.106, 0.036, 0.024, 0.016),
    panel(0, -0.034, 0.108, 0.038, 0.026, 0.016),
    panel(22, -0.032, 0.106, 0.034, 0.022, 0.016),
    panel(-18, -0.082, 0.111, 0.04, 0.02, 0.02),
    panel(2, -0.086, 0.113, 0.042, 0.024, 0.02),
    panel(20, -0.078, 0.11, 0.034, 0.016, 0.02),
    panel(0, -0.122, 0.113, 0.02, 0.02, 0.014),
    // Feathering along the back edge and round the tip.
    ...feather([onWrap(-26, -0.03, 0.108), onWrap(-31, -0.08, 0.113), onWrap(-24, -0.126, 0.114)], -28, 0.012),
    ...feather([onWrap(-8, -0.104, 0.114), onWrap(-9, -0.134, 0.115), onWrap(-3, -0.15, 0.114)], -6, 0.012),
  ];
}
