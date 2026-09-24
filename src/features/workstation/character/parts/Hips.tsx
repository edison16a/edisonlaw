'use client';

import { loftGeometry, type LoftRing } from '../geometry/loft';
import { useGeometry } from '../geometry/useGeometry';
import { useCharacterMaterials } from '../MaterialsContext';

/** Seat of the trousers around the pelvis joint, from under the shirt down to a round bottom. */
const TROUSERS: LoftRing[] = [
  { y: -0.118, x: 0.02, front: 0.018, back: 0.02, z: -0.004 },
  { y: -0.108, x: 0.07, front: 0.052, back: 0.06, z: -0.004 },
  { y: -0.085, x: 0.118, front: 0.084, back: 0.095, z: -0.004 },
  { y: -0.045, x: 0.138, front: 0.1, back: 0.11 },
  { y: 0.0, x: 0.142, front: 0.104, back: 0.106 },
  { y: 0.07, x: 0.134, front: 0.1, back: 0.097 },
];

export function Hips() {
  const materials = useCharacterMaterials();
  const trousers = useGeometry(() => loftGeometry(TROUSERS, { radialSegments: 48, capBottom: true }));
  return <mesh geometry={trousers} material={materials.pants} castShadow receiveShadow />;
}
