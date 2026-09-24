'use client';

import { RoundedBox } from '@react-three/drei';
import { useLayoutEffect, useRef } from 'react';
import { Color, InstancedMesh, Object3D } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { seededRandom } from '@/lib/math';
import type { Vec3 } from '../../layout';
import { useDisposable } from '../../useDisposable';

const SIZE = 0.056;
const CELL = SIZE / 3;
const STICKER = CELL * 0.84;
const FACE_COLORS = ['#f2f2ee', '#f2c63a', '#d8433f', '#ef8a2e', '#3f74d8', '#3fae62'];
/** Outward normal and the two in-plane axes of each face. */
const FACES: [number[], number[], number[]][] = [
  [[0, 1, 0], [1, 0, 0], [0, 0, 1]],
  [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
  [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  [[-1, 0, 0], [0, 1, 0], [0, 0, 1]],
  [[0, 0, 1], [1, 0, 0], [0, 1, 0]],
  [[0, 0, -1], [1, 0, 0], [0, 1, 0]],
];

/** A slightly scrambled Rubik's cube: one black body and 54 instanced stickers. */
export function RubiksCube({ position, rotationY = 0 }: { position: Vec3; rotationY?: number }) {
  const stickers = useRef<InstancedMesh>(null);
  const geometry = useDisposable(() => new RoundedBoxGeometry(STICKER, STICKER, 0.0016, 2, 0.0007));

  useLayoutEffect(() => {
    const mesh = stickers.current;
    if (!mesh) return;
    const random = seededRandom(9);
    const dummy = new Object3D();
    const color = new Color();
    let index = 0;
    FACES.forEach(([normal, u, v], face) => {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const offset = SIZE / 2 + 0.0006;
          dummy.position.set(
            normal[0] * offset + (u[0] * i + v[0] * j) * CELL,
            normal[1] * offset + (u[1] * i + v[1] * j) * CELL,
            normal[2] * offset + (u[2] * i + v[2] * j) * CELL,
          );
          dummy.lookAt(dummy.position.x + normal[0], dummy.position.y + normal[1], dummy.position.z + normal[2]);
          dummy.updateMatrix();
          mesh.setMatrixAt(index, dummy.matrix);
          // Mostly solved faces with a few stray stickers.
          const colorIndex = random() < 0.3 ? Math.floor(random() * FACE_COLORS.length) : face;
          mesh.setColorAt(index, color.set(FACE_COLORS[colorIndex]));
          index += 1;
        }
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  return (
    <group position={[position[0], position[1] + SIZE / 2, position[2]]} rotation-y={rotationY}>
      <RoundedBox args={[SIZE, SIZE, SIZE]} radius={0.004} smoothness={3}>
        <meshStandardMaterial color="#0d0d10" roughness={0.5} />
      </RoundedBox>
      <instancedMesh ref={stickers} args={[geometry, undefined, 54]}>
        <meshStandardMaterial roughness={0.35} />
      </instancedMesh>
    </group>
  );
}
