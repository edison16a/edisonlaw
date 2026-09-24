'use client';

import { useMemo } from 'react';
import { PlaneGeometry } from 'three';
import { ROOM } from '../layout';
import { getMaterials } from '../materials/materials';

/** How far the room reaches past the desk, to the right and toward the camera. */
const RIGHT_X = 4.4;
const FRONT_Z = 4.2;
/** One repeat of the plank texture covers this many metres. */
const PLANK_TILE = 1.4;
const SKIRTING = { height: 0.07, depth: 0.014 };

function tiledPlane(width: number, height: number, tile: number) {
  const geometry = new PlaneGeometry(width, height);
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * width) / tile, (uv.getY(i) * height) / tile);
  return geometry;
}

/** Floor, back wall, left wall and skirting boards. The edges fade into the black page. */
export function Room() {
  const materials = getMaterials();
  const width = RIGHT_X - ROOM.leftWallX;
  const depth = FRONT_Z - ROOM.backWallZ;
  const midX = (RIGHT_X + ROOM.leftWallX) / 2;
  const midZ = (FRONT_Z + ROOM.backWallZ) / 2;
  const floorGeometry = useMemo(() => tiledPlane(width, depth, PLANK_TILE), [width, depth]);

  return (
    <group>
      <mesh geometry={floorGeometry} material={materials.floor} rotation-x={-Math.PI / 2} position={[midX, ROOM.floorY, midZ]} />
      <mesh material={materials.wall} position={[midX, ROOM.height / 2, ROOM.backWallZ]}>
        <planeGeometry args={[width, ROOM.height]} />
      </mesh>
      <mesh material={materials.wall} rotation-y={Math.PI / 2} position={[ROOM.leftWallX, ROOM.height / 2, midZ]}>
        <planeGeometry args={[depth, ROOM.height]} />
      </mesh>
      <mesh material={materials.skirting} position={[midX, SKIRTING.height / 2, ROOM.backWallZ + SKIRTING.depth / 2]}>
        <boxGeometry args={[width, SKIRTING.height, SKIRTING.depth]} />
      </mesh>
      <mesh material={materials.skirting} position={[ROOM.leftWallX + SKIRTING.depth / 2, SKIRTING.height / 2, midZ]}>
        <boxGeometry args={[SKIRTING.depth, SKIRTING.height, depth]} />
      </mesh>
    </group>
  );
}
