'use client';

import { RoundedBox } from '@react-three/drei';
import type { Vec3 } from '../../layout';

const BOX = { width: 0.11, height: 0.13, depth: 0.1 };

/** Little retro speaker: warm orange box with a round grey driver, as in the reference. */
export function Speaker({ position, rotationY = 0 }: { position: Vec3; rotationY?: number }) {
  const face = BOX.depth / 2;
  return (
    <group position={[position[0], position[1] + BOX.height / 2, position[2]]} rotation-y={rotationY}>
      <RoundedBox args={[BOX.width, BOX.height, BOX.depth]} radius={0.014} smoothness={4}>
        <meshStandardMaterial color="#c56f2c" roughness={0.5} />
      </RoundedBox>
      <mesh position-z={face + 0.0005}>
        <circleGeometry args={[0.037, 32]} />
        <meshStandardMaterial color="#e8e2d8" roughness={0.6} />
      </mesh>
      <mesh position-z={face + 0.004} scale={[1, 1, 0.35]}>
        <sphereGeometry args={[0.028, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2b2c31" roughness={0.45} />
      </mesh>
    </group>
  );
}
