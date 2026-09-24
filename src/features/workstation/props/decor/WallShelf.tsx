'use client';

import { RoundedBox } from '@react-three/drei';
import { LatheGeometry, MeshStandardMaterial, Vector2 } from 'three';
import { createSlabGeometry } from '../../geometry/slab';
import { ROOM, type Vec3 } from '../../layout';
import { createMoonTexture, createSpineTexture } from '../../materials/canvasTextures';
import { getMaterials } from '../../materials/materials';
import { useDisposable } from '../../useDisposable';

const SHELF = { width: 0.52, depth: 0.15, thickness: 0.026 };
const BOOK_DEPTH = 0.13;
const BOARD = 0.0022;

/**
 * Books on the shelf: x of the bottom left corner, thickness, height, cover colour, foil colour and lean.
 * The last one pivots on that corner and leans left until it rests on the top corner of its neighbour.
 */
const BOOKS: [number, number, number, string, string, number][] = [
  [-0.227, 0.034, 0.2, '#4b5d82', '#d9c79a', 0],
  [-0.192, 0.04, 0.23, '#b77b2c', '#f3e3c0', 0],
  [-0.143, 0.03, 0.18, '#8c919b', '#2b2d33', 0],
  [-0.0765, 0.036, 0.2, '#99503a', '#e8d2a8', 0.2],
];

/** Cactus body profile, bottom to top, as radius and height pairs, before the ribs are pressed in. */
const CACTUS: [number, number][] = [
  [0, 0],
  [0.019, 0.002],
  [0.022, 0.03],
  [0.021, 0.06],
  [0.016, 0.082],
  [0.008, 0.093],
  [0, 0.096],
];
const POT: [number, number][] = [
  [0, 0],
  [0.03, 0],
  [0.033, 0.003],
  [0.04, 0.062],
  [0.043, 0.066],
  [0.043, 0.07],
  [0.037, 0.07],
  [0.035, 0.062],
];

/** A lathe with vertical ribs pressed around it, like a barrel cactus. */
function ribbedLathe(profile: [number, number][], ribs: number, depth: number) {
  const geometry = new LatheGeometry(profile.map(([r, y]) => new Vector2(r, y)), 48);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    const scale = 1 - depth * (0.5 - 0.5 * Math.cos(Math.atan2(z, x) * ribs));
    position.setX(i, x * scale);
    position.setZ(i, z * scale);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** One hardback: two boards, a cream page block set back from the spine, and a printed spine at the front. */
function Book({ width, height, cover, spine, pages }: { width: number; height: number; cover: MeshStandardMaterial; spine: MeshStandardMaterial; pages: MeshStandardMaterial }) {
  return (
    <group>
      {[-1, 1].map((side) => (
        <RoundedBox
          key={side}
          args={[BOARD, height, BOOK_DEPTH]}
          radius={0.0009}
          smoothness={2}
          material={cover}
          position={[side * (width / 2 - BOARD / 2), 0, 0]}
        />
      ))}
      <RoundedBox args={[width, height, 0.004]} radius={0.0018} smoothness={2} material={spine} position-z={BOOK_DEPTH / 2 - 0.002} />
      <mesh material={pages} position={[0, -0.0015, -0.002]}>
        <boxGeometry args={[width - BOARD * 2 - 0.0004, height - 0.007, BOOK_DEPTH - 0.008]} />
      </mesh>
    </group>
  );
}

interface WallShelfProps {
  position: Vec3;
}

/** Floating wooden shelf with hardbacks, a ribbed cactus in a white pot and a warm moon lamp. */
export function WallShelf({ position }: WallShelfProps) {
  const materials = getMaterials();
  const parts = useDisposable(() => ({
    shelf: createSlabGeometry({ width: SHELF.width, depth: SHELF.depth, height: SHELF.thickness, radius: 0.012, bevel: 0.004 }),
    covers: BOOKS.map(([, , , color]) => new MeshStandardMaterial({ color, roughness: 0.6 })),
    spines: BOOKS.map(([, , , color, foil], index) => new MeshStandardMaterial({ map: createSpineTexture(color, foil, 40 + index), roughness: 0.55 })),
    pages: new MeshStandardMaterial({ color: '#efe6d2', roughness: 0.85 }),
    cactus: ribbedLathe(CACTUS, 9, 0.16),
    arm: ribbedLathe(CACTUS.map(([r, y]) => [r * 0.55, y * 0.42]), 7, 0.16),
    cactusMaterial: new MeshStandardMaterial({ color: '#4f8a3a', roughness: 0.55 }),
    pot: new LatheGeometry(POT.map(([r, y]) => new Vector2(r, y)), 40),
    soil: new MeshStandardMaterial({ color: '#2a1d14', roughness: 1 }),
    moon: new MeshStandardMaterial({ color: '#000000', emissive: '#ffffff', emissiveMap: createMoonTexture(), emissiveIntensity: 1.05, toneMapped: false }),
  }));

  const [x, y] = position;
  const z = ROOM.backWallZ + SHELF.depth / 2;
  const top = SHELF.thickness;

  return (
    <group position={[x, y - SHELF.thickness / 2, z]}>
      <mesh geometry={parts.shelf} material={materials.lightWood} />
      {BOOKS.map(([left, width, height, , , lean], index) => (
        <group key={left} position={[left, top, 0]} rotation-z={lean}>
          <group position={[width / 2, height / 2, 0]}>
            <Book width={width} height={height} cover={parts.covers[index]} spine={parts.spines[index]} pages={parts.pages} />
          </group>
        </group>
      ))}
      {/* Cactus in a round white pot. */}
      <group position={[0.06, top, 0.005]}>
        <mesh geometry={parts.pot} material={materials.whitePlastic} />
        <mesh material={parts.soil} position-y={0.064} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.036, 28]} />
        </mesh>
        <mesh geometry={parts.cactus} material={parts.cactusMaterial} position-y={0.06} />
        <mesh geometry={parts.arm} material={parts.cactusMaterial} position={[0.017, 0.1, 0]} rotation-z={-0.75} />
      </group>
      {/* Moon lamp: the only warm light in the room. */}
      <group position={[0.19, top, 0.01]}>
        <mesh material={materials.lightWood} position-y={0.008}>
          <cylinderGeometry args={[0.03, 0.034, 0.016, 32]} />
        </mesh>
        <mesh material={parts.moon} position-y={0.06} rotation-y={0.6}>
          <sphereGeometry args={[0.045, 40, 24]} />
        </mesh>
        <pointLight color="#ffc98e" intensity={0.22} distance={2.2} decay={2} position={[0, 0.06, 0.08]} />
      </group>
    </group>
  );
}
