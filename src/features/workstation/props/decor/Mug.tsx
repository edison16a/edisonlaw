'use client';

import { LatheGeometry, Vector2 } from 'three';
import type { Vec3 } from '../../layout';
import { getMaterials } from '../../materials/materials';
import { useDisposable } from '../../useDisposable';

/** Outer wall, lip and inner wall of the mug, bottom to top and back down. */
const PROFILE: [number, number][] = [
  [0, 0],
  [0.03, 0],
  [0.034, 0.006],
  [0.036, 0.085],
  [0.033, 0.088],
  [0.031, 0.084],
  [0.03, 0.012],
  [0, 0.012],
];

/** Coffee mug, half full. */
export function Mug({ position, rotationY = 0 }: { position: Vec3; rotationY?: number }) {
  const materials = getMaterials();
  const body = useDisposable(() => new LatheGeometry(PROFILE.map(([r, y]) => new Vector2(r, y)), 32));

  return (
    <group position={position} rotation-y={rotationY}>
      <mesh geometry={body} material={materials.whitePlastic} />
      <mesh position-y={0.062} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.0305, 24]} />
        <meshStandardMaterial color="#2a170c" roughness={0.2} />
      </mesh>
      {/* Half a torus turned to bulge outward on the +X side. */}
      <mesh material={materials.whitePlastic} position={[0.034, 0.046, 0]} rotation-z={-Math.PI / 2} scale={[1.15, 1, 1]}>
        <torusGeometry args={[0.019, 0.005, 10, 24, Math.PI]} />
      </mesh>
    </group>
  );
}
