'use client';

import { TorusGeometry } from 'three';
import { loftGeometry, type LoftRing } from '../geometry/loft';
import { useGeometry } from '../geometry/useGeometry';
import { useCharacterMaterials } from '../MaterialsContext';

/** T-shirt body from the hem up to the neck hole, in the chest's space. Listed bottom to top. */
const SHIRT: LoftRing[] = [
  { y: -0.222, x: 0.153, front: 0.117, back: 0.106 },
  { y: -0.211, x: 0.155, front: 0.119, back: 0.107 },
  { y: -0.16, x: 0.151, front: 0.115, back: 0.102 },
  { y: -0.08, x: 0.146, front: 0.112, back: 0.097 },
  { y: 0, x: 0.148, front: 0.113, back: 0.096 },
  { y: 0.065, x: 0.151, front: 0.113, back: 0.095 },
  { y: 0.115, x: 0.148, front: 0.106, back: 0.092 },
  { y: 0.155, x: 0.134, front: 0.092, back: 0.084 },
  { y: 0.183, x: 0.106, front: 0.074, back: 0.07 },
  { y: 0.2, x: 0.075, front: 0.06, back: 0.056 },
  { y: 0.208, x: 0.058, front: 0.052, back: 0.049 },
];

const COLLAR = { y: 0.205, radius: 0.053, tube: 0.0085, depth: 0.93 } as const;

/** The shirt with its chest print and a ribbed collar. */
export function Torso() {
  const materials = useCharacterMaterials();
  const shirt = useGeometry(() => loftGeometry(SHIRT, { radialSegments: 72 }));
  const collar = useGeometry(() => new TorusGeometry(COLLAR.radius, COLLAR.tube, 12, 48));

  return (
    <group>
      <mesh geometry={shirt} material={materials.shirt} castShadow receiveShadow />
      <mesh
        geometry={collar}
        material={materials.shirtRib}
        position={[0, COLLAR.y, 0.001]}
        rotation={[Math.PI / 2 - 0.08, 0, 0]}
        scale={[1.05, COLLAR.depth, 1]}
      />
    </group>
  );
}
