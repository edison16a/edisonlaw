'use client';

import { ExtrudeGeometry, Shape, SphereGeometry, TubeGeometry, Vector2, Vector3 } from 'three';
import { roundedPath } from '../geometry/roundedPath';
import { createSlabGeometry } from '../geometry/slab';
import { CHAIR } from '../layout';
import { getMaterials } from '../materials/materials';
import { useDisposable } from '../useDisposable';

const TUBE_RADIUS = 0.011;
const FRAME_HALF_WIDTH = 0.19;
const SEAT = { width: 0.44, depth: 0.42, thickness: 0.035 };
/** The backrest wraps around the sitter on a circle of this radius. */
const BACK = { width: 0.42, height: 0.34, thickness: 0.026, curve: 0.5, tilt: 0.16, lift: 0.26, z: 0.255 };
/** Height of the frame's tube centre under the seat, so the tube just meets the seat's underside. */
const UNDER_SEAT = CHAIR.seatHeight - SEAT.thickness - TUBE_RADIUS - 0.001;
const FLOOR = TUBE_RADIUS;
/** Where the uprights end, just behind the top of the backrest. */
const UPRIGHT_TOP = new Vector3(0, CHAIR.seatHeight + BACK.lift + BACK.height / 2 + 0.005, 0.276);

/**
 * The whole cantilever frame as one bent tube, in chair space (front is -Z): up the left upright, forward
 * under the seat, down to the floor, back along the floor, across the back, and the same on the right.
 */
function framePath() {
  const side = (x: number) => [
    new Vector3(x, UNDER_SEAT, 0.2),
    new Vector3(x, UNDER_SEAT, -0.15),
    new Vector3(x, FLOOR, -0.21),
    new Vector3(x, FLOOR, 0.27),
  ];
  const left = side(-FRAME_HALF_WIDTH);
  const right = side(FRAME_HALF_WIDTH).reverse();
  return roundedPath(
    [
      UPRIGHT_TOP.clone().setX(-FRAME_HALF_WIDTH),
      ...left,
      ...right,
      UPRIGHT_TOP.clone().setX(FRAME_HALF_WIDTH),
    ],
    0.07,
  );
}

/**
 * Plan of the backrest, in chair space with +Y pointing back: a band on a circle centred in front of it,
 * so its ends curve forward around the sitter, closed with round ends.
 */
function backrestShape() {
  const { width, thickness, curve } = BACK;
  const halfAngle = Math.asin((width - thickness) / 2 / curve);
  const r = thickness / 2;
  const at = (radius: number, angle: number) => new Vector2(radius * Math.sin(angle), radius * Math.cos(angle) - curve);
  const points: Vector2[] = [];
  const arcSteps = 32;
  const capSteps = 10;

  /** Half circle around the band's centre line at `angle`, from one face to the other, bulging along `side`. */
  const cap = (angle: number, side: 1 | -1, fromOuter: boolean) => {
    const centre = at(curve, angle);
    const normal = new Vector2(Math.sin(angle), Math.cos(angle));
    const tangent = new Vector2(Math.cos(angle), -Math.sin(angle)).multiplyScalar(side);
    for (let i = 1; i < capSteps; i++) {
      const beta = (Math.PI * i) / capSteps;
      const across = fromOuter ? Math.cos(beta) : -Math.cos(beta);
      points.push(centre.clone().addScaledVector(normal, r * across).addScaledVector(tangent, r * Math.sin(beta)));
    }
  };

  for (let i = 0; i <= arcSteps; i++) points.push(at(curve + r, -halfAngle + (2 * halfAngle * i) / arcSteps));
  cap(halfAngle, 1, true);
  for (let i = 0; i <= arcSteps; i++) points.push(at(curve - r, halfAngle - (2 * halfAngle * i) / arcSteps));
  cap(-halfAngle, -1, false);
  return new Shape(points);
}

/** White shell seat and curved back on a grey cantilever frame bent from one tube, like the reference. Work scene only. */
export function Chair() {
  const materials = getMaterials();
  const parts = useDisposable(() => {
    const bevel = 0.006;
    const back = new ExtrudeGeometry(backrestShape(), {
      depth: BACK.height - bevel * 2,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel * 0.6,
      bevelSegments: 4,
      curveSegments: 8,
    });
    // Stand the plan up: its Y becomes depth (+Z) and the extrusion becomes height, centred on the origin.
    back.rotateX(Math.PI / 2);
    back.translate(0, BACK.height / 2, 0);
    back.computeVertexNormals();
    return {
      seat: createSlabGeometry({ width: SEAT.width, depth: SEAT.depth, height: SEAT.thickness, radius: 0.07, bevel: 0.013, curveSegments: 14, bevelSegments: 5 }),
      back,
      frame: new TubeGeometry(framePath(), 320, TUBE_RADIUS, 14),
      cap: new SphereGeometry(TUBE_RADIUS, 14, 10),
    };
  });

  return (
    <group position={CHAIR.position}>
      <mesh geometry={parts.seat} material={materials.whitePlastic} position-y={CHAIR.seatHeight - SEAT.thickness} />
      <mesh
        geometry={parts.back}
        material={materials.whitePlastic}
        position={[0, CHAIR.seatHeight + BACK.lift, BACK.z]}
        rotation-x={-BACK.tilt}
      />
      <mesh geometry={parts.frame} material={materials.brushedMetal} />
      {[-1, 1].map((side) => (
        <mesh key={side} geometry={parts.cap} material={materials.brushedMetal} position={UPRIGHT_TOP.clone().setX(side * FRAME_HALF_WIDTH)} />
      ))}
      {/* Cross bar under the seat. */}
      <mesh material={materials.brushedMetal} position={[0, UNDER_SEAT, -0.1]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[TUBE_RADIUS * 0.8, TUBE_RADIUS * 0.8, FRAME_HALF_WIDTH * 2, 12]} />
      </mesh>
    </group>
  );
}
