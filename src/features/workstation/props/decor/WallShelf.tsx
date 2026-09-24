'use client';

import { RoundedBox } from '@react-three/drei';
import { ROOM, type Vec3 } from '../../layout';
import { getMaterials } from '../../materials/materials';

const SHELF = { width: 0.52, depth: 0.15, thickness: 0.026 };

/** Books standing on the shelf: x offset, width, height, colour, lean. */
const BOOKS: [number, number, number, string, number][] = [
  [-0.21, 0.034, 0.2, '#4b5d82', 0],
  [-0.172, 0.04, 0.23, '#b77b2c', 0],
  [-0.128, 0.03, 0.18, '#8c919b', 0],
  [-0.088, 0.036, 0.2, '#99503a', -0.2],
];

interface WallShelfProps {
  position: Vec3;
}

/** Floating wooden shelf with books, a little potted cactus and a warm moon lamp. */
export function WallShelf({ position }: WallShelfProps) {
  const materials = getMaterials();
  const [x, y] = position;
  const z = ROOM.backWallZ + SHELF.depth / 2;
  const top = SHELF.thickness / 2;

  return (
    <group position={[x, y, z]}>
      <RoundedBox args={[SHELF.width, SHELF.thickness, SHELF.depth]} radius={0.008} smoothness={3} material={materials.lightWood} />
      {BOOKS.map(([bx, width, height, color, lean]) => (
        <RoundedBox
          key={bx}
          args={[width, height, 0.13]}
          radius={0.005}
          smoothness={2}
          position={[bx + (lean ? 0.03 : 0), top + height / 2 - (lean ? 0.012 : 0), 0]}
          rotation-z={lean}
        >
          <meshStandardMaterial color={color} roughness={0.7} />
        </RoundedBox>
      ))}
      {/* Cactus in a round white pot. */}
      <group position={[0.06, top, 0.005]}>
        <mesh material={materials.whitePlastic} position-y={0.035}>
          <cylinderGeometry args={[0.042, 0.032, 0.07, 28]} />
        </mesh>
        <mesh position-y={0.1}>
          <capsuleGeometry args={[0.02, 0.05, 8, 16]} />
          <meshStandardMaterial color="#4f8a3a" roughness={0.6} />
        </mesh>
        <mesh position={[0.024, 0.11, 0]} rotation-z={-0.8}>
          <capsuleGeometry args={[0.011, 0.02, 6, 12]} />
          <meshStandardMaterial color="#4f8a3a" roughness={0.6} />
        </mesh>
      </group>
      {/* Moon lamp: the only warm light in the room. */}
      <group position={[0.19, top, 0.01]}>
        <mesh material={materials.lightWood} position-y={0.008}>
          <cylinderGeometry args={[0.03, 0.034, 0.016, 24]} />
        </mesh>
        <mesh position-y={0.06}>
          <sphereGeometry args={[0.045, 32, 16]} />
          <meshStandardMaterial color="#000000" emissive="#ffd7a1" emissiveIntensity={1.35} toneMapped={false} />
        </mesh>
        <pointLight color="#ffc98e" intensity={0.22} distance={2.2} decay={2} position={[0, 0.06, 0.08]} />
      </group>
    </group>
  );
}
