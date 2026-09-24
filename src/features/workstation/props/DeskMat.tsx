'use client';

import { RoundedBox } from '@react-three/drei';
import { DESK } from '../layout';

const MAT = { width: 0.84, depth: 0.27, thickness: 0.003 };

/** Felt mat under the keyboard and mouse. */
export function DeskMat() {
  return (
    <RoundedBox
      args={[MAT.width, MAT.thickness, MAT.depth]}
      radius={0.0014}
      smoothness={2}
      position={[0.1, DESK.height + MAT.thickness / 2, -0.1]}
    >
      <meshStandardMaterial color="#1d1e24" roughness={0.95} />
    </RoundedBox>
  );
}
