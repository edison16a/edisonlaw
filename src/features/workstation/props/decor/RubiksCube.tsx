'use client';

import { RoundedBox } from '@react-three/drei';
import { useLayoutEffect, useRef } from 'react';
import { Color, ExtrudeGeometry, InstancedMesh, MeshStandardMaterial, Object3D } from 'three';
import { seededRandom } from '@/lib/math';
import { roundedRectShape } from '../../geometry/shapes';
import type { Vec3 } from '../../layout';
import { useDisposable } from '../../useDisposable';

const SIZE = 0.056;
const CELL = SIZE / 3;
const STICKER = CELL * 0.82;
/** The top layer is turned part way, like a cube someone just put down mid solve. */
const TWIST = 0.28;
/** Gap between the turned top layer and the two layers under it. */
const SEAM = 0.0008;
const FACE_COLORS = ['#f2f2ee', '#f2c63a', '#d8433f', '#ef8a2e', '#3f74d8', '#3fae62'];
/** Outward normal and the two in plane axes of each face. */
const FACES: [number[], number[], number[]][] = [
  [[0, 1, 0], [1, 0, 0], [0, 0, 1]],
  [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
  [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  [[-1, 0, 0], [0, 1, 0], [0, 0, 1]],
  [[0, 0, 1], [1, 0, 0], [0, 1, 0]],
  [[0, 0, -1], [1, 0, 0], [0, 1, 0]],
];

interface Sticker {
  position: [number, number, number];
  normal: number[];
  color: string;
  top: boolean;
}

/** All 54 stickers, mostly solved with a few strays, each marked with whether it turns with the top layer. */
function layoutStickers(): Sticker[] {
  const random = seededRandom(9);
  const stickers: Sticker[] = [];
  FACES.forEach(([normal, u, v], face) => {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const offset = SIZE / 2;
        const position: [number, number, number] = [0, 1, 2].map((axis) => normal[axis] * offset + (u[axis] * i + v[axis] * j) * CELL) as [number, number, number];
        const colorIndex = random() < 0.3 ? Math.floor(random() * FACE_COLORS.length) : face;
        stickers.push({ position, normal, color: FACE_COLORS[colorIndex], top: position[1] > CELL / 2 + 0.0001 });
      }
    }
  });
  return stickers;
}

const STICKERS = layoutStickers();
const LOWER = STICKERS.filter((sticker) => !sticker.top);
const UPPER = STICKERS.filter((sticker) => sticker.top);

/** Lays each sticker flat on its face, looking out along the face normal, in its colour. */
function placeStickers(mesh: InstancedMesh, stickers: Sticker[]) {
  const dummy = new Object3D();
  const color = new Color();
  stickers.forEach(({ position, normal, color: hex }, index) => {
    dummy.position.set(...position);
    dummy.lookAt(position[0] + normal[0], position[1] + normal[1], position[2] + normal[2]);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
    mesh.setColorAt(index, color.set(hex));
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

/** A slightly scrambled Rubik's cube with its top layer turned: black body and 54 rounded stickers. */
export function RubiksCube({ position, rotationY = 0 }: { position: Vec3; rotationY?: number }) {
  const lower = useRef<InstancedMesh>(null);
  const upper = useRef<InstancedMesh>(null);
  const parts = useDisposable(() => ({
    sticker: new ExtrudeGeometry(roundedRectShape(STICKER - 0.0006, STICKER - 0.0006, 0.0022), {
      depth: 0.0004,
      bevelEnabled: true,
      bevelThickness: 0.0003,
      bevelSize: 0.0003,
      bevelSegments: 1,
      curveSegments: 3,
    }),
    body: new MeshStandardMaterial({ color: '#0d0d10', roughness: 0.45 }),
    stickerMaterial: new MeshStandardMaterial({ roughness: 0.3 }),
  }));
  useLayoutEffect(() => {
    if (lower.current) placeStickers(lower.current, LOWER);
    if (upper.current) placeStickers(upper.current, UPPER);
  }, []);

  const lowerHeight = CELL * 2 - SEAM / 2;
  const upperHeight = CELL - SEAM / 2;

  return (
    <group position={[position[0], position[1] + SIZE / 2, position[2]]} rotation-y={rotationY}>
      <RoundedBox args={[SIZE, lowerHeight, SIZE]} radius={0.0035} smoothness={3} material={parts.body} position-y={-SIZE / 2 + lowerHeight / 2} />
      <instancedMesh ref={lower} args={[parts.sticker, parts.stickerMaterial, LOWER.length]} />
      <group rotation-y={TWIST}>
        <RoundedBox args={[SIZE, upperHeight, SIZE]} radius={0.0035} smoothness={3} material={parts.body} position-y={SIZE / 2 - upperHeight / 2} />
        <instancedMesh ref={upper} args={[parts.sticker, parts.stickerMaterial, UPPER.length]} />
      </group>
    </group>
  );
}
