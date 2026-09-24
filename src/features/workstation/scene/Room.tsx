'use client';

import { ExtrudeGeometry, PlaneGeometry } from 'three';
import { roundedPolygonShape } from '../geometry/shapes';
import { ROOM } from '../layout';
import { getMaterials } from '../materials/materials';
import { useDisposable } from '../useDisposable';

/** How far the room reaches past the desk, to the right and toward the camera. */
const RIGHT_X = 4.4;
const FRONT_Z = 4.2;
/** One repeat of the plank texture covers this many metres. */
const PLANK_TILE = 1.4;
/** One repeat of the plaster covers this many metres. */
const PLASTER_TILE = 1.3;
const SKIRTING = { height: 0.07, depth: 0.014 };

function tiledPlane(width: number, height: number, tile: number) {
  const geometry = new PlaneGeometry(width, height);
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * width) / tile, (uv.getY(i) * height) / tile);
  return geometry;
}

/**
 * Skirting board of `length` standing on the floor against a wall: a flat face with a rounded top edge,
 * the way a moulded board is profiled. It stands out from the wall along +Z and runs from the origin along -X.
 */
function skirtingGeometry(length: number) {
  const { height, depth } = SKIRTING;
  const profile = roundedPolygonShape(
    [
      [0, 0],
      [depth, 0],
      [depth, height],
      [0, height],
    ],
    [0, 0.001, 0.009, 0],
  );
  const geometry = new ExtrudeGeometry(profile, { depth: length, bevelEnabled: false, curveSegments: 6 });
  // Turn the profile's X (out from the wall) onto +Z; the extrusion then runs along -X.
  geometry.rotateY(-Math.PI / 2);
  return geometry;
}

/** Floor, back wall, left wall and skirting boards. The edges fade into the black page. */
export function Room() {
  const materials = getMaterials();
  const width = RIGHT_X - ROOM.leftWallX;
  const depth = FRONT_Z - ROOM.backWallZ;
  const midX = (RIGHT_X + ROOM.leftWallX) / 2;
  const midZ = (FRONT_Z + ROOM.backWallZ) / 2;
  const parts = useDisposable(() => ({
    floor: tiledPlane(width, depth, PLANK_TILE),
    backWall: tiledPlane(width, ROOM.height, PLASTER_TILE),
    leftWall: tiledPlane(depth, ROOM.height, PLASTER_TILE),
    backSkirting: skirtingGeometry(width),
    leftSkirting: skirtingGeometry(depth - SKIRTING.depth),
  }));

  return (
    <group>
      <mesh geometry={parts.floor} material={materials.floor} rotation-x={-Math.PI / 2} position={[midX, ROOM.floorY, midZ]} />
      <mesh geometry={parts.backWall} material={materials.wall} position={[midX, ROOM.height / 2, ROOM.backWallZ]} />
      <mesh geometry={parts.leftWall} material={materials.wall} rotation-y={Math.PI / 2} position={[ROOM.leftWallX, ROOM.height / 2, midZ]} />
      <mesh geometry={parts.backSkirting} material={materials.skirting} position={[RIGHT_X, 0, ROOM.backWallZ]} />
      {/* Turned to stand out from the left wall; it starts where the back board ends, so the two only meet. */}
      <mesh
        geometry={parts.leftSkirting}
        material={materials.skirting}
        rotation-y={Math.PI / 2}
        position={[ROOM.leftWallX, 0, ROOM.backWallZ + SKIRTING.depth]}
      />
    </group>
  );
}
