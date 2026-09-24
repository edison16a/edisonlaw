import type { Vec3 } from '../../layout';
import { PART_COUNT, TONE } from '../dimensions';
import { Field, type Shape } from '../sdf/field';
import { FACE, headForms } from './head';
import { cone, ellipsoid, flatLock } from './sculpt';

/**
 * A drop ear in ear space, built for the left side and mirrored for the right: origin on the skull where
 * the ear hangs from, +X out of the head, +Y up, +Z toward the nose. The leather folds over a soft ridge
 * at the top and hangs as a curved flap that follows the side of the head a hair off the cheek, down to
 * the line of the jaw, with long feathered fur along its back edge and round its tip.
 */
export const EAR = {
  /** Hinge on the left side of the skull, in head space. */
  root: FACE.earRoot,
  /** Resting hang as YXZ Euler angles. The flap is shaped to the head, so it rests without a turn. */
  rest: [0, 0, 0] as Vec3,
} as const;

/** The flap wraps a cylinder around the head's upright axis, which sits this far inside the root. */
const AXIS = { x: -FACE.earRoot[0], z: 0.004 };
const DEG = Math.PI / 180;

/** Half the thickness of the flap. */
const THICKNESS = 0.007;
/** Gap between the inner face of the flap and the head it hangs against. */
const GAP = 0.006;

/** Retrievers' ears are a shade deeper and redder than the coat around them. */
const LEATHER = 0.08;

const leather = (blend: number) => ({ tone: LEATHER, blend, part: 0 });

/** A point on the wrap at angle `phi` (degrees, positive toward the nose), `radius` from the axis. */
function onWrap(phi: number, y: number, radius: number): Vec3 {
  return [AXIS.x + radius * Math.cos(phi * DEG), y, AXIS.z + radius * Math.sin(phi * DEG)];
}

/**
 * How far from the axis the middle of the flap sits at `phi` and height `y`, so its inner face clears
 * the head by GAP: marched outward from inside the head until the head is far enough away.
 */
function hugRadius(head: Field, phi: number, y: number) {
  const [rx, ry, rz] = EAR.root;
  const clearance = THICKNESS + GAP;
  let radius = 0.03;
  for (let step = 0; step < 200; step++) {
    const [x, py, z] = onWrap(phi, y, radius);
    const distance = head.distance(x + rx, py + ry, z + rz);
    if (distance >= clearance - 1e-5) break;
    radius += Math.max(0.0003, clearance - distance);
  }
  return radius;
}

/** Rows of the flap from the fold down: height, half height, and the angle and half width of each column. */
const FLAP: { y: number; halfHeight: number; columns: [number, number][] }[] = [
  { y: -0.024, halfHeight: 0.022, columns: [[-20, 0.021], [0, 0.023], [17, 0.017]] },
  { y: -0.05, halfHeight: 0.022, columns: [[-19, 0.02], [0, 0.023], [16, 0.016]] },
  { y: -0.074, halfHeight: 0.022, columns: [[-17, 0.018], [1, 0.021], [15, 0.013]] },
  { y: -0.094, halfHeight: 0.018, columns: [[-12, 0.016], [3, 0.017]] },
];

/** Locks of feathering on the outside of the ear, root to tip as angle round the wrap and height. */
const FEATHERS: { path: [number, number][]; width: number }[] = [
  {
    path: [
      [-26, -0.03],
      [-30, -0.075],
      [-24, -0.112],
    ],
    width: 0.013,
  },
  {
    path: [
      [-12, -0.05],
      [-13, -0.085],
      [-9, -0.116],
    ],
    width: 0.013,
  },
  {
    path: [
      [2, -0.055],
      [2, -0.088],
      [3, -0.114],
    ],
    width: 0.012,
  },
];

/** Below this height the ear hangs free of the head, so the feathering keeps the flap's last curve. */
const FREE_BELOW = -0.1;

/** A thin curved piece of the flap, square to the wrap at its angle. */
function panel(center: Vec3, phi: number, halfHeight: number, halfWidth: number, blend: number): Shape {
  const tangent: Vec3 = [-Math.sin(phi * DEG), 0, Math.cos(phi * DEG)];
  return ellipsoid(center, [THICKNESS, halfHeight, halfWidth], leather(blend), [0, 1, 0], tangent);
}

export function earShapes(): Shape[] {
  const head = new Field(headForms(), PART_COUNT);
  const at = (phi: number, y: number, out = 0) => onWrap(phi, y, hugRadius(head, phi, Math.max(y, FREE_BELOW)) + out);
  const feather = (points: [number, number][], width: number, tones: [number, number]): Shape[] =>
    flatLock({
      path: points.map(([phi, y]) => at(phi, y, THICKNESS * 0.5)),
      width,
      flatness: 0.6,
      facing: [Math.cos(points[1][0] * DEG), 0, Math.sin(points[1][0] * DEG)],
      tones,
      blend: 0.008,
      part: 0,
      segments: 5,
    });
  return [
    // The fold at the top, where the leather leaves the skull and turns down.
    cone(onWrap(-30, 0.0, 0.066), onWrap(0, 0.004, 0.069), 0.0092, 0.0102, leather(0)),
    cone(onWrap(0, 0.004, 0.069), onWrap(20, 0.0, 0.067), 0.0102, 0.0092, leather(0.007)),
    // The flap: three columns round the head and four rows down, each hugging the head where it hangs,
    // closing in a round tip.
    ...FLAP.flatMap(({ y, halfHeight, columns }) =>
      columns.map(([phi, halfWidth]) => panel(at(phi, y), phi, halfHeight, halfWidth, 0.01)),
    ),
    panel(at(-1, -0.108), -1, 0.016, 0.017, 0.009),
    // Feathering: soft locks down the outside of the flap and along its back edge, lighter toward their
    // ends like a retriever's ears. They end on the flap, so no tip hangs free.
    ...FEATHERS.flatMap(({ path, width }) => feather(path, width, [TONE.saddle + 0.1, TONE.light - 0.04])),
  ];
}
