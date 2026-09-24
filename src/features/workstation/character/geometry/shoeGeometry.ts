import { Color } from 'three';
import { PALETTE } from '../materials';
import { loftGeometry, type LoftRing } from './loft';
import { mergeParts, paintSolid } from './merge';

/**
 * A clean chunky sneaker in the foot bone's space: the ankle joint is the origin, toes point +Z
 * and the sole touches y = -ankleHeight. White upper, pale sole and a dark stripe, coloured per vertex
 * so the whole shoe is one mesh.
 */
export function shoeGeometry(ankleHeight: number) {
  const floor = -ankleHeight;
  const z = 0.032;
  const upper: LoftRing[] = [
    { y: floor + 0.014, x: 0.041, front: 0.086, back: 0.058, z },
    { y: floor + 0.034, x: 0.043, front: 0.087, back: 0.059, z },
    { y: floor + 0.052, x: 0.041, front: 0.077, back: 0.057, z: z - 0.002 },
    { y: floor + 0.066, x: 0.037, front: 0.056, back: 0.053, z: z - 0.006 },
    { y: floor + 0.08, x: 0.033, front: 0.034, back: 0.046, z: z - 0.012 },
    { y: floor + 0.088, x: 0.028, front: 0.024, back: 0.036, z: z - 0.014 },
  ];
  const sole: LoftRing[] = [
    { y: floor, x: 0.042, front: 0.088, back: 0.058, z },
    { y: floor + 0.002, x: 0.0455, front: 0.0915, back: 0.0615, z },
    { y: floor + 0.014, x: 0.0458, front: 0.0918, back: 0.0618, z },
    { y: floor + 0.018, x: 0.0435, front: 0.0892, back: 0.0592, z },
  ];
  const stripe: LoftRing[] = [
    { y: floor + 0.018, x: 0.0437, front: 0.0893, back: 0.0595, z },
    { y: floor + 0.023, x: 0.0438, front: 0.0895, back: 0.0596, z },
  ];
  return mergeParts([
    paintSolid(loftGeometry(upper, { radialSegments: 40, capTop: true }), new Color(PALETTE.shoe)),
    paintSolid(loftGeometry(sole, { radialSegments: 40, capBottom: true }), new Color(PALETTE.sole)),
    paintSolid(loftGeometry(stripe, { radialSegments: 40 }), new Color(PALETTE.shoeAccent)),
  ]);
}
