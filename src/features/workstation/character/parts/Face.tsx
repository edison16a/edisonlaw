'use client';

import { useMemo } from 'react';
import { CatmullRomCurve3, SphereGeometry, type Vector3 } from 'three';
import { useDisposable } from '../../useDisposable';
import { surfaceFrame, surfacePoint } from '../geometry/headShape';
import { mergeParts } from '../geometry/merge';
import { addBlendShapes } from '../geometry/morph';
import { strokeTaper, sweepGeometry } from '../geometry/sweep';
import { useCharacterMaterials } from '../MaterialsContext';
import type { Rig } from '../rig/types';

/** Face layout on the skull, angles in degrees (crown angle, turn angle toward his left). */
const EYE = { theta: 97, phi: 23.5, lift: -0.0035, radius: [0.028, 0.035, 0.013] as const };
/** Catch lights, placed the same on both eyes as if lit from one window. */
const SHINES = [
  { x: 0.0085, y: 0.013, radius: 0.0082 },
  { x: -0.0085, y: -0.0125, radius: 0.0042 },
] as const;
type Stroke = [number, number][];

/** Left brow from its inner to its outer end, mirrored for the right. */
const BROW: Stroke = [
  [81.2, 14],
  [79.8, 19.5],
  [80.6, 25.5],
];
/** Brow blend shapes as angle offsets per control point: raised, and raised at the inner end. */
const BROW_LIFT: Stroke = [
  [-2.6, 0],
  [-2.6, 0],
  [-2.4, 0],
];
const BROW_INNER: Stroke = [
  [-3.2, -0.5],
  [-1.3, -0.2],
  [0.2, 0],
];

/** The resting smile, from his right to his left. */
const MOUTH: Stroke = [
  [120.4, -7.5],
  [122.4, -2.5],
  [122.4, 2.5],
  [120.4, 7.5],
];
/** A small flat "hmm", shorter and pulled toward his left, rising a little at that end. */
const MOUTH_HMM: Stroke = [
  [122.1, -2.6],
  [122.35, 0.6],
  [122.15, 3.6],
  [121.2, 6.4],
];
/** A wider, happier smile. */
const MOUTH_SMILE: Stroke = [
  [118.9, -9.4],
  [122.9, -3.1],
  [122.9, 3.1],
  [118.9, 9.4],
];

const outward = (point: Vector3, out: Vector3) => out.copy(point).normalize();

const shifted = (stroke: Stroke, offsets: Stroke): Stroke => stroke.map(([theta, phi], i) => [theta + offsets[i][0], phi + offsets[i][1]]);

function strokeGeometry(points: Stroke, side: number, lift: number, halfWidth: number, halfThickness: number) {
  const curve = new CatmullRomCurve3(points.map(([theta, phi]) => surfacePoint(theta, side * phi, lift)));
  const taper = strokeTaper(0.28);
  return sweepGeometry(curve, {
    segments: 20,
    radialSegments: 10,
    width: (s) => halfWidth * taper(s),
    thickness: (s) => halfThickness * taper(s),
    normalAt: outward,
    underside: 0.4,
  });
}

/** Where a catch light sits on the front of the glossy eye. */
function shineDepth(x: number, y: number) {
  const [rx, ry, rz] = EYE.radius;
  return rz * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2 - (y / ry) ** 2)) - 0.0012;
}

/** Both catch lights of one eye as a single flattened pair of dots, in the eye's space. */
function shineGeometry() {
  return mergeParts(
    SHINES.map(({ x, y, radius }) =>
      new SphereGeometry(1, 12, 8).scale(radius, radius, radius * 0.35).translate(x, y, shineDepth(x, y)),
    ),
  );
}

/** Both brows as one mesh, with blend shapes in the order of BROW_SHAPES. */
function browsGeometry() {
  const brow = (stroke: Stroke, side: number) => strokeGeometry(stroke, side, 0.0024, 0.0046, 0.0026);
  const lift = shifted(BROW, BROW_LIFT);
  const inner = shifted(BROW, BROW_INNER);
  return mergeParts(
    [1, -1].map((side) => {
      const own = (stroke: Stroke) => brow(stroke, side);
      const mine = side === 1;
      return addBlendShapes(brow(BROW, side), [
        mine ? own(lift) : null,
        mine ? null : own(lift),
        mine ? own(inner) : null,
        mine ? null : own(inner),
      ]);
    }),
  );
}

/** The mouth with blend shapes in the order of MOUTH_SHAPES. */
function mouthGeometry() {
  const mouth = (stroke: Stroke) => strokeGeometry(stroke, 1, 0.0006, 0.0034, 0.0022);
  return addBlendShapes(mouth(MOUTH), [mouth(MOUTH_HMM), mouth(MOUTH_SMILE)]);
}

/** Glossy black eyes with catch lights, small soft brows and a small smile. The nose is part of the head. */
export function Face({ rig }: { rig: Rig }) {
  const materials = useCharacterMaterials();
  const sphere = useDisposable(() => new SphereGeometry(1, 28, 18));
  const shine = useDisposable(shineGeometry);
  const brows = useDisposable(browsGeometry);
  const mouth = useDisposable(mouthGeometry);
  const eyeFrames = useMemo(() => [1, -1].map((side) => surfaceFrame(EYE.theta, side * EYE.phi, EYE.lift)), []);

  return (
    <group>
      {rig.eyes.map((eye, index) => (
        <primitive key={eye.name} object={eye} position={eyeFrames[index].position} quaternion={eyeFrames[index].quaternion}>
          <primitive object={rig.gazes[index]}>
            <mesh geometry={sphere} material={materials.eye} scale={EYE.radius} />
            <primitive object={rig.shines[index]}>
              <mesh geometry={shine} material={materials.eyeShine} />
            </primitive>
          </primitive>
        </primitive>
      ))}
      <mesh geometry={brows} material={materials.brow} morphTargetInfluences={rig.brows} />
      <mesh geometry={mouth} material={materials.lips} morphTargetInfluences={rig.mouth} />
    </group>
  );
}
