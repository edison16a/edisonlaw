'use client';

import { RoundedBox } from '@react-three/drei';
import { MAC_MINI } from '../layout';
import { getMaterials } from '../materials/materials';

/** Aluminium Mac mini on a dark foot, with a tiny white status light on the front. */
export function MacMini() {
  const materials = getMaterials();
  const [x, y, z] = MAC_MINI.position;
  const [width, height, depth] = MAC_MINI.size;
  const foot = 0.004;

  return (
    <group position={[x, y, z]} rotation-y={0.18}>
      <mesh material={materials.blackMatte} position-y={foot / 2}>
        <cylinderGeometry args={[width * 0.42, width * 0.42, foot, 32]} />
      </mesh>
      <RoundedBox
        args={[width, height, depth]}
        radius={0.014}
        smoothness={4}
        material={materials.aluminium}
        position-y={foot + height / 2}
      />
      <mesh position={[width * 0.38, foot + height * 0.32, depth / 2 + 0.0004]}>
        <circleGeometry args={[0.0016, 12]} />
        <meshBasicMaterial color={[3, 3, 3]} toneMapped={false} />
      </mesh>
    </group>
  );
}
