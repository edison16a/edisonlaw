'use client';

import { RoundedBox } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { TubeGeometry, Vector3 } from 'three';
import { roundedPath } from '../geometry/roundedPath';
import { CHAIR, type Vec3 } from '../layout';
import { getMaterials } from '../materials/materials';
import type { StageVariant } from '../types';

const TUBE_RADIUS = 0.011;
const FRAME_HALF_WIDTH = 0.19;
const SEAT = { width: 0.44, depth: 0.42, thickness: 0.035 };
const BACK = { width: 0.42, height: 0.34, thickness: 0.03, tilt: 0.16 };

/** Where the chair sits in each variant. In `about` Edison stands, so it is pushed back and turned aside. */
const CHAIR_POSES: Record<StageVariant, { position: Vec3; rotationY: number }> = {
  work: { position: CHAIR.position, rotationY: 0 },
  about: { position: [-0.3, 0, 1.02], rotationY: 0.65 },
};

/**
 * One side of the cantilever frame in chair space (front is -Z): up behind the back,
 * forward under the seat, down to the floor at the front and back along the floor.
 */
function sideFrame(x: number) {
  const top = CHAIR.seatHeight - SEAT.thickness;
  return roundedPath(
    [
      new Vector3(x, top + 0.34, 0.25),
      new Vector3(x, top, 0.2),
      new Vector3(x, top, -0.15),
      new Vector3(x, 0.012, -0.21),
      new Vector3(x, 0.012, 0.27),
    ],
    0.07,
  );
}

/** White shell seat and back on a grey tubular cantilever frame, like the reference. */
export function Chair({ variant }: { variant: StageVariant }) {
  const materials = getMaterials();
  const pose = CHAIR_POSES[variant];

  const frame = useMemo(
    () => [-1, 1].map((side) => new TubeGeometry(sideFrame(side * FRAME_HALF_WIDTH), 96, TUBE_RADIUS, 10)),
    [],
  );
  useEffect(() => () => frame.forEach((geometry) => geometry.dispose()), [frame]);

  const seatY = CHAIR.seatHeight - SEAT.thickness / 2;

  return (
    <group position={pose.position} rotation-y={pose.rotationY}>
      <RoundedBox
        args={[SEAT.width, SEAT.thickness, SEAT.depth]}
        radius={0.016}
        smoothness={4}
        material={materials.whitePlastic}
        position={[0, seatY, 0]}
      />
      <RoundedBox
        args={[BACK.width, BACK.height, BACK.thickness]}
        radius={0.014}
        smoothness={4}
        material={materials.whitePlastic}
        position={[0, CHAIR.seatHeight + 0.26, 0.255]}
        rotation-x={-BACK.tilt}
      />
      {frame.map((geometry, index) => (
        <mesh key={index} geometry={geometry} material={materials.brushedMetal} />
      ))}
      {/* Cross bars: one under the seat, one joining the floor runners. */}
      <mesh material={materials.brushedMetal} position={[0, CHAIR.seatHeight - SEAT.thickness, -0.1]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[TUBE_RADIUS, TUBE_RADIUS, FRAME_HALF_WIDTH * 2, 10]} />
      </mesh>
      <mesh material={materials.brushedMetal} position={[0, 0.012, 0.27]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[TUBE_RADIUS, TUBE_RADIUS, FRAME_HALF_WIDTH * 2, 10]} />
      </mesh>
    </group>
  );
}
