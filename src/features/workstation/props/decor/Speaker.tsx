'use client';

import { RoundedBox } from '@react-three/drei';
import { LatheGeometry, MeshStandardMaterial, Vector2 } from 'three';
import type { Vec3 } from '../../layout';
import { useDisposable } from '../../useDisposable';

const BOX = { width: 0.11, height: 0.13, depth: 0.1 };

/** Driver cone from the rim in to the dust cap and over its dome, facing +Y before it is turned. */
const DRIVER: [number, number][] = [
  [0.029, 0],
  [0.027, -0.001],
  [0.013, -0.0055],
  [0.0115, -0.005],
  [0.009, -0.0018],
  [0.005, -0.0004],
  [0, 0],
];

/** Little retro speaker: warm orange box, a pale face ring and a dark driver with a dust cap, as in the reference. */
export function Speaker({ position, rotationY = 0 }: { position: Vec3; rotationY?: number }) {
  const parts = useDisposable(() => ({
    driver: new LatheGeometry(DRIVER.map(([r, y]) => new Vector2(r, y)), 40),
    body: new MeshStandardMaterial({ color: '#c56f2c', roughness: 0.46 }),
    face: new MeshStandardMaterial({ color: '#e8e2d8', roughness: 0.55 }),
    cone: new MeshStandardMaterial({ color: '#26272c', roughness: 0.6 }),
    trim: new MeshStandardMaterial({ color: '#8d8f96', metalness: 0.85, roughness: 0.3 }),
    knob: new MeshStandardMaterial({ color: '#2b2c31', roughness: 0.4 }),
  }));
  const face = BOX.depth / 2;

  return (
    <group position={[position[0], position[1] + BOX.height / 2, position[2]]} rotation-y={rotationY}>
      <RoundedBox args={[BOX.width, BOX.height, BOX.depth]} radius={0.016} smoothness={5} material={parts.body} />
      <mesh material={parts.face} position={[0, -0.006, face + 0.0005]}>
        <circleGeometry args={[0.038, 48]} />
      </mesh>
      <mesh material={parts.trim} position={[0, -0.006, face + 0.0012]}>
        <torusGeometry args={[0.0305, 0.0016, 10, 48]} />
      </mesh>
      <mesh geometry={parts.driver} material={parts.cone} position={[0, -0.006, face + 0.0062]} rotation-x={Math.PI / 2} />
      {/* Volume knob on top, and a small power light on the face. */}
      <mesh material={parts.knob} position={[BOX.width * 0.22, BOX.height / 2 + 0.004, -BOX.depth * 0.12]}>
        <cylinderGeometry args={[0.009, 0.0095, 0.008, 24]} />
      </mesh>
      <mesh position={[BOX.width * 0.32, BOX.height * 0.36, face + 0.0003]}>
        <circleGeometry args={[0.0018, 12]} />
        <meshBasicMaterial color={[2.2, 1.5, 0.8]} toneMapped={false} />
      </mesh>
    </group>
  );
}
