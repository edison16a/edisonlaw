'use client';

import { RoundedBox } from '@react-three/drei';
import { SEATED_FOOT_REST } from '../character/placement';
import { getMaterials } from '../materials/materials';

const WIDTH = 0.42;
const DEPTH = 0.24;
const PLATE = 0.03;

/**
 * Under-desk footrest for the seated pose. His legs are too short to reach the floor from the chair,
 * so his sneakers rest on this plate, whose top sits at SEATED_FOOT_REST height.
 */
export function Footrest() {
  const materials = getMaterials();
  const { left, right } = SEATED_FOOT_REST;
  const x = (left[0] + right[0]) / 2;
  const top = left[1];
  const z = left[2];
  const legHeight = top - PLATE;

  return (
    <group position={[x, 0, z]}>
      <RoundedBox
        args={[WIDTH, PLATE, DEPTH]}
        radius={0.01}
        smoothness={3}
        material={materials.rubber}
        position-y={top - PLATE / 2}
      />
      {[-1, 1].map((side) => (
        <RoundedBox
          key={side}
          args={[0.028, legHeight, DEPTH * 0.86]}
          radius={0.008}
          smoothness={3}
          material={materials.darkPlastic}
          position={[side * (WIDTH / 2 - 0.03), legHeight / 2, 0]}
        />
      ))}
    </group>
  );
}
