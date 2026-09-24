'use client';

import { RoundedBox } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { ROOM, type Vec3 } from '../../layout';
import { createCorkTexture, createNoteTexture } from '../../materials/canvasTextures';
import { getMaterials } from '../../materials/materials';

const BOARD = { width: 0.92, height: 0.6, frame: 0.035, depth: 0.03 };

/** Notes pinned to the board: x, y, size, tilt, paper, ink. */
const NOTES: [number, number, number, number, string, string][] = [
  [-0.24, 0.07, 0.2, 0.08, '#dfe8f5', '#51607a'],
  [-0.03, 0.1, 0.17, -0.05, '#f1ede2', '#6a5f52'],
  [0.23, -0.07, 0.21, -0.1, '#f4f1ea', '#5d6470'],
];

/** Framed cork board with pinned notes, like the one in the reference. */
export function CorkBoard({ position }: { position: Vec3 }) {
  const materials = getMaterials();
  const textures = useMemo(
    () => ({
      cork: createCorkTexture(),
      notes: NOTES.map(([, , , , paper, ink], index) => createNoteTexture(paper, ink, 21 + index)),
    }),
    [],
  );
  useEffect(
    () => () => {
      textures.cork.dispose();
      textures.notes.forEach((texture) => texture.dispose());
    },
    [textures],
  );

  const [x, y] = position;
  const face = BOARD.depth / 2;

  return (
    <group position={[x, y, ROOM.backWallZ + BOARD.depth / 2]}>
      <RoundedBox args={[BOARD.width, BOARD.height, BOARD.depth]} radius={0.014} smoothness={3} material={materials.lightWood} />
      <mesh position-z={face + 0.001}>
        <planeGeometry args={[BOARD.width - BOARD.frame * 2, BOARD.height - BOARD.frame * 2]} />
        <meshStandardMaterial map={textures.cork} roughness={0.95} />
      </mesh>
      {NOTES.map(([nx, ny, size, tilt], index) => (
        <group key={index} position={[nx, ny, face + 0.004 + index * 0.001]} rotation-z={tilt}>
          <mesh>
            <planeGeometry args={[size, size * 1.1]} />
            <meshStandardMaterial map={textures.notes[index]} roughness={0.85} />
          </mesh>
          <mesh position={[0, size * 0.42, 0.008]}>
            <sphereGeometry args={[0.013, 16, 12]} />
            <meshStandardMaterial color="#c9474f" roughness={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
