import type { Shape } from '../sdf/field';
import { bothSides, carve, CUT, ellipsoid, sided } from './sculpt';

/**
 * The nose leather in nose space: origin where it meets the muzzle, +Z out of the face, +Y up.
 * A broad rounded triangle with two lobes on top, comma shaped nostrils and a soft groove below.
 */
const leather = (blend: number) => ({ tone: 0, blend, part: 0 });

export function noseShapes(): Shape[] {
  return [
    ellipsoid([0, 0, 0.001], [0.0178, 0.0122, 0.011], leather(0)),
    ...bothSides((side) => [ellipsoid(sided([0.0086, 0.0036, 0.0028], side), [0.0104, 0.0095, 0.01], leather(0.0055))]),
    ellipsoid([0, -0.0072, 0.0018], [0.0072, 0.0064, 0.009], leather(0.0055)),
    ...bothSides((side) => [carve(ellipsoid(sided([0.0077, -0.0011, 0.0113], side), [0.0037, 0.0026, 0.005], CUT, [side * 0.35, 1, 0]), 0.0022)]),
    carve(ellipsoid([0, -0.0086, 0.0096], [0.0011, 0.0056, 0.0036], CUT), 0.0009),
  ];
}
