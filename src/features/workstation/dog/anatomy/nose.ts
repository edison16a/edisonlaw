import type { Shape } from '../sdf/field';
import { bothSides, carve, CUT, ellipsoid, sided } from './sculpt';

/**
 * The nose leather in nose space: origin where it meets the muzzle, +Z out of the face, +Y up.
 * A broad rounded triangle with two lobes on top, comma shaped nostrils and a soft groove below.
 */
const leather = (blend: number) => ({ tone: 0, blend, part: 0 });

export function noseShapes(): Shape[] {
  return [
    ellipsoid([0, 0, 0.001], [0.0195, 0.0135, 0.012], leather(0)),
    ...bothSides((side) => [ellipsoid(sided([0.0095, 0.004, 0.003], side), [0.0115, 0.0105, 0.011], leather(0.006))]),
    ellipsoid([0, -0.008, 0.002], [0.008, 0.007, 0.01], leather(0.006)),
    ...bothSides((side) => [carve(ellipsoid(sided([0.0088, -0.0012, 0.0125], side), [0.0042, 0.0029, 0.0055], CUT, [side * 0.35, 1, 0]), 0.0016)]),
    carve(ellipsoid([0, -0.0095, 0.0105], [0.0012, 0.0062, 0.004], CUT), 0.001),
  ];
}
