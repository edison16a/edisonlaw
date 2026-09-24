import { Vector3 } from 'three';
import type { Vec3 } from '../../layout';
import type { Shape } from '../sdf/field';
import { carve, CUT, ellipsoid } from './sculpt';
import { FACE } from './head';

/**
 * A soft pink tongue lying on the floor of the open mouth and curling out over the lower lip,
 * in jaw space (origin on the jaw hinge, axes as head space).
 */

/** Centre line in head space, from the back of the mouth to the rounded tip. */
const PATH: Vec3[] = [
  [0, -0.1705, 0.078],
  [0, -0.1715, 0.104],
  [0, -0.1735, 0.126],
  [0, -0.1805, 0.1395],
  [0, -0.1915, 0.1435],
];
/** Half width along the path. */
const WIDTH = [0.0125, 0.0145, 0.0152, 0.0142, 0.0118];
const THICKNESS = 0.0042;

const flesh = (blend: number) => ({ tone: 0, blend, part: 0 });

export function tongueShapes(): Shape[] {
  const hinge = new Vector3(...FACE.jawHinge);
  const points = PATH.map((p) => new Vector3(...p).sub(hinge));
  const shapes: Shape[] = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const along = b.clone().sub(a);
    const half = along.length() / 2;
    const forward = along.normalize();
    // The flat of the tongue faces up, square to its centre line.
    const up = new Vector3(0, 1, 0).addScaledVector(forward, -forward.y).normalize();
    const center = a.clone().add(b).multiplyScalar(0.5);
    shapes.push(
      ellipsoid(center.toArray(), [(WIDTH[i - 1] + WIDTH[i]) / 2, THICKNESS, half * 1.45], flesh(i === 1 ? 0 : 0.005), up.toArray(), forward.toArray()),
    );
  }
  // The groove down the middle.
  const groove = new Vector3(0, -0.1668, 0.118).sub(hinge);
  shapes.push(carve(ellipsoid(groove.toArray(), [0.0016, 0.0022, 0.02], CUT), 0.0015));
  return shapes;
}
