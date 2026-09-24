'use client';

import { MOUSE } from '../layout';
import { getMaterials } from '../materials/materials';

/** Rounded, pebble-like mouse with a dark scroll wheel. */
export function Mouse() {
  const materials = getMaterials();
  const [x, y, z] = MOUSE.position;

  return (
    <group position={[x, y - 0.005, z]} rotation-y={0.12}>
      {/* The top half of a squashed sphere makes the shell. */}
      <mesh scale={[0.032, 0.021, 0.054]}>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#d6d6db" roughness={0.35} clearcoat={0.5} clearcoatRoughness={0.3} />
      </mesh>
      <mesh material={materials.darkPlastic} position={[0, 0.018, -0.022]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.0055, 0.0055, 0.004, 16]} />
      </mesh>
    </group>
  );
}
