'use client';

import type { Vec3 } from '../../layout';

const BLACK = '#1b1d24';
const WHITE = '#f1eee8';
const ORANGE = '#e38a2e';

interface PenguinProps {
  position: Vec3;
  rotationY?: number;
}

/** Small penguin figurine, egg shaped with a white belly, like the one in the reference. */
export function Penguin({ position, rotationY = 0 }: PenguinProps) {
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position-y={0.05} scale={[0.04, 0.052, 0.036]}>
        <sphereGeometry args={[1, 32, 20]} />
        <meshStandardMaterial color={BLACK} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.042, 0.012]} scale={[0.031, 0.04, 0.028]}>
        <sphereGeometry args={[1, 28, 18]} />
        <meshStandardMaterial color={WHITE} roughness={0.5} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.013, 0.074, 0.03]}>
            <sphereGeometry args={[0.0065, 12, 10]} />
            <meshStandardMaterial color={WHITE} roughness={0.3} />
          </mesh>
          <mesh position={[side * 0.013, 0.074, 0.036]}>
            <sphereGeometry args={[0.0035, 10, 8]} />
            <meshStandardMaterial color="#0a0a0c" roughness={0.2} />
          </mesh>
          <mesh position={[side * 0.038, 0.045, 0]} rotation-z={side * 0.35} scale={[0.008, 0.028, 0.018]}>
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial color={BLACK} roughness={0.4} />
          </mesh>
          <mesh position={[side * 0.014, 0.004, 0.018]} scale={[0.012, 0.005, 0.016]}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshStandardMaterial color={ORANGE} roughness={0.5} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.064, 0.04]} rotation-x={Math.PI / 2}>
        <coneGeometry args={[0.007, 0.016, 12]} />
        <meshStandardMaterial color={ORANGE} roughness={0.45} />
      </mesh>
    </group>
  );
}
