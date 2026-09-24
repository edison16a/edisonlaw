'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { BufferGeometry, Group, Material } from 'three';
import type { Vec3 } from '../../layout';

/** Rotor speed in radians per second. Slow enough to read as spinning without strobing. */
const SPIN = 7.5;

/** Geometry and materials shared by every fan in the case. */
export interface FanParts {
  frame: BufferGeometry;
  blades: BufferGeometry;
  ring: BufferGeometry;
  hub: BufferGeometry;
  frameMaterial: Material;
  hubMaterial: Material;
  ringMaterial: Material;
  bladeMaterial: Material;
}

interface FanProps {
  parts: FanParts;
  position: Vec3;
  rotation?: Vec3;
  spinning: boolean;
}

/** One ARGB fan: dark frame, glowing ring and translucent blades lit by the ring. Faces +Z. */
export function Fan({ parts, position, rotation = [0, 0, 0], spinning }: FanProps) {
  const rotor = useRef<Group>(null);

  useFrame((_, delta) => {
    if (spinning && rotor.current) rotor.current.rotation.z -= SPIN * Math.min(delta, 0.1);
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={parts.frame} material={parts.frameMaterial} />
      <mesh geometry={parts.ring} material={parts.ringMaterial} />
      <group ref={rotor}>
        <mesh geometry={parts.blades} material={parts.bladeMaterial} />
        <mesh geometry={parts.hub} material={parts.hubMaterial} />
      </group>
    </group>
  );
}
