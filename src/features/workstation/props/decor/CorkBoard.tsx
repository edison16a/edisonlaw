'use client';

import { LatheGeometry, MeshStandardMaterial, PlaneGeometry, Vector2 } from 'three';
import { createFrameRingGeometry } from '../../geometry/frameRing';
import { ROOM, type Vec3 } from '../../layout';
import { createCorkTexture, createNoteTexture } from '../../materials/canvasTextures';
import { getMaterials } from '../../materials/materials';
import { useDisposable } from '../../useDisposable';

const BOARD = { width: 0.92, height: 0.6, border: 0.038, depth: 0.03 };
/** The cork sits this far in front of the wall, recessed inside the frame. */
const CORK_Z = 0.012;

/** Notes pinned to the board: x, y, size, tilt, paper, ink. */
const NOTES: [number, number, number, number, string, string][] = [
  [-0.24, 0.07, 0.2, 0.08, '#dfe8f5', '#51607a'],
  [-0.03, 0.1, 0.17, -0.05, '#f1ede2', '#6a5f52'],
  [0.23, -0.07, 0.21, -0.1, '#f4f1ea', '#5d6470'],
];

/** Push pin profile from the needle tip to the top of the head, as radius and height pairs. */
const PIN: [number, number][] = [
  [0, -0.006],
  [0.0007, -0.0055],
  [0.0007, 0],
  [0.0055, 0],
  [0.0048, 0.003],
  [0.0048, 0.007],
  [0.0105, 0.009],
  [0.0112, 0.013],
  [0.0102, 0.0155],
  [0.006, 0.0168],
  [0, 0.017],
];

/** A sheet of paper pinned at the top whose lower edge curls a little away from the board. */
function createNoteGeometry(size: number, curl: number) {
  const geometry = new PlaneGeometry(size, size * 1.1, 6, 8);
  const position = geometry.attributes.position;
  const halfHeight = (size * 1.1) / 2;
  for (let i = 0; i < position.count; i++) {
    const fromTop = (halfHeight - position.getY(i)) / (size * 1.1);
    const across = position.getX(i) / size + 0.5;
    position.setZ(i, curl * fromTop * fromTop * (0.55 + 0.45 * across));
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** Framed cork board with pinned notes, like the one in the reference. */
export function CorkBoard({ position }: { position: Vec3 }) {
  const materials = getMaterials();
  const parts = useDisposable(() => {
    const cork = createCorkTexture();
    return {
      frame: createFrameRingGeometry({ ...BOARD, radius: 0.028, bevel: 0.007 }),
      cork: new MeshStandardMaterial({ map: cork, bumpMap: cork, bumpScale: 0.6, roughness: 0.95 }),
      notes: NOTES.map(([, , size, , paper, ink], index) => ({
        geometry: createNoteGeometry(size, 0.008 + index * 0.003),
        material: new MeshStandardMaterial({ map: createNoteTexture(paper, ink, 21 + index), roughness: 0.85 }),
      })),
      pin: new LatheGeometry(PIN.map(([r, y]) => new Vector2(r, y)), 24),
      pinMaterial: new MeshStandardMaterial({ color: '#c9474f', roughness: 0.28 }),
    };
  });

  const [x, y] = position;

  return (
    <group position={[x, y, ROOM.backWallZ]}>
      <mesh geometry={parts.frame} material={materials.lightWood} />
      <mesh material={parts.cork} position-z={CORK_Z}>
        <planeGeometry args={[BOARD.width - BOARD.border * 2 + 0.01, BOARD.height - BOARD.border * 2 + 0.01]} />
      </mesh>
      {NOTES.map(([nx, ny, size, tilt], index) => (
        <group key={index} position={[nx, ny, CORK_Z + 0.0015 + index * 0.0012]} rotation-z={tilt}>
          <mesh geometry={parts.notes[index].geometry} material={parts.notes[index].material} />
          <mesh geometry={parts.pin} material={parts.pinMaterial} position={[0, size * 0.42, 0.0008]} rotation-x={Math.PI / 2} />
        </group>
      ))}
    </group>
  );
}
