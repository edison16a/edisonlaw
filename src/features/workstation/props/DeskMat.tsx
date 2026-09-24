'use client';

import { RoundedBox } from '@react-three/drei';
import { DESK_MAT } from '../layout';

/** Felt mat under the keyboard and mouse. */
export function DeskMat() {
  const [x, top, z] = DESK_MAT.center;
  return (
    <RoundedBox
      args={[DESK_MAT.width, DESK_MAT.thickness, DESK_MAT.depth]}
      radius={0.0014}
      smoothness={2}
      position={[x, top - DESK_MAT.thickness / 2, z]}
    >
      <meshStandardMaterial color="#1d1e24" roughness={0.95} />
    </RoundedBox>
  );
}
