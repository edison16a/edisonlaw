'use client';

import { TorusGeometry } from 'three';
import { useDisposable } from '../../useDisposable';
import { loftGeometry, type LoftRing } from '../geometry/loft';
import { useCharacterMaterials } from '../MaterialsContext';

/** T-shirt body from the hem up to the neck hole, in the chest's space. Listed bottom to top. */
const SHIRT: LoftRing[] = [
  { y: -0.222, x: 0.159, front: 0.12, back: 0.116 },
  { y: -0.211, x: 0.161, front: 0.121, back: 0.117 },
  { y: -0.16, x: 0.153, front: 0.116, back: 0.106 },
  { y: -0.08, x: 0.146, front: 0.112, back: 0.097 },
  { y: 0, x: 0.148, front: 0.113, back: 0.096 },
  { y: 0.065, x: 0.151, front: 0.113, back: 0.095 },
  { y: 0.1, x: 0.153, front: 0.109, back: 0.094 },
  { y: 0.128, x: 0.168, front: 0.102, back: 0.091 },
  { y: 0.152, x: 0.19, front: 0.094, back: 0.087 },
  { y: 0.172, x: 0.193, front: 0.087, back: 0.082 },
  { y: 0.188, x: 0.178, front: 0.079, back: 0.075 },
  { y: 0.2, x: 0.146, front: 0.069, back: 0.066 },
  { y: 0.207, x: 0.11, front: 0.061, back: 0.058 },
  { y: 0.211, x: 0.078, front: 0.055, back: 0.052 },
  { y: 0.213, x: 0.058, front: 0.051, back: 0.048 },
];

const COLLAR = { y: 0.209, radius: 0.053, tube: 0.0085, depth: 0.93 } as const;

/** The plain shirt and its ribbed collar. */
export function Torso() {
  const materials = useCharacterMaterials();
  const shirt = useDisposable(() => loftGeometry(SHIRT, { radialSegments: 80, smooth: 3 }));
  const collar = useDisposable(() => new TorusGeometry(COLLAR.radius, COLLAR.tube, 10, 40));

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
