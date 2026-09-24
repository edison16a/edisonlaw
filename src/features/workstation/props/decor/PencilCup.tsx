'use client';

import { DoubleSide } from 'three';
import type { Vec3 } from '../../layout';

/** Pencils: colour, lean around X, lean around Z, length. */
const PENCILS: [string, number, number, number][] = [
  ['#5a8fd6', 0.12, 0.18, 0.15],
  ['#d6575b', -0.1, -0.14, 0.14],
  ['#e0b84a', 0.16, -0.04, 0.13],
];

/** Rounded pencil cup with three coloured pencils. */
export function PencilCup({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position-y={0.045}>
        <cylinderGeometry args={[0.032, 0.029, 0.09, 28, 1, true]} />
        <meshStandardMaterial color="#c9b79c" roughness={0.6} side={DoubleSide} />
      </mesh>
      <mesh position-y={0.004}>
        <cylinderGeometry args={[0.029, 0.029, 0.008, 28]} />
        <meshStandardMaterial color="#c9b79c" roughness={0.6} />
      </mesh>
      {PENCILS.map(([color, leanX, leanZ, length]) => (
        <group key={color} position-y={0.01} rotation={[leanX, 0, leanZ]}>
          <mesh position-y={length / 2}>
            <cylinderGeometry args={[0.0045, 0.0045, length, 6]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          <mesh position-y={length + 0.009}>
            <coneGeometry args={[0.0045, 0.018, 6]} />
            <meshStandardMaterial color="#e8cfa6" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
