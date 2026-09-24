'use client';

import { RoundedBox } from '@react-three/drei';
import { DESK } from '../layout';
import { useRgbMaterial } from '../lighting/useRgbMaterial';
import { getMaterials } from '../materials/materials';

const LEG = { top: 0.027, bottom: 0.017, insetX: 0.13, insetZ: 0.1, splay: 0.035 };

/** Pale rounded desktop on four tapered wooden legs, with an RGB strip washing the wall behind. */
export function Desk() {
  const materials = getMaterials();
  const strip = useRgbMaterial({ hueOffset: 0.06, intensity: 2.4 });
  const [x, topY, z] = DESK.center;
  const legHeight = topY - DESK.thickness;
  const halfW = DESK.width / 2 - LEG.insetX;
  const halfD = DESK.depth / 2 - LEG.insetZ;
  const backZ = z - DESK.depth / 2;

  return (
    <group>
      <RoundedBox
        args={[DESK.width, DESK.thickness, DESK.depth]}
        radius={0.018}
        smoothness={4}
        material={materials.deskTop}
        position={[x, topY - DESK.thickness / 2, z]}
      />
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh
            key={`${sx}${sz}`}
            material={materials.lightWood}
            position={[x + sx * halfW, legHeight / 2, z + sz * halfD]}
            rotation={[sz * LEG.splay, 0, -sx * LEG.splay]}
          >
            <cylinderGeometry args={[LEG.top, LEG.bottom, legHeight, 20]} />
          </mesh>
        )),
      )}
      {/* LED strip on the back edge, facing the wall. */}
      <mesh material={strip} position={[x, topY - DESK.thickness - 0.006, backZ + 0.02]}>
        <boxGeometry args={[DESK.width - 0.3, 0.008, 0.012]} />
      </mesh>
    </group>
  );
}
