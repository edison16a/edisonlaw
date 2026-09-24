'use client';

import { useMemo } from 'react';
import { CatmullRomCurve3, SphereGeometry, type Vector3 } from 'three';
import { surfaceFrame, surfacePoint } from '../geometry/headShape';
import { mergeParts } from '../geometry/merge';
import { strokeTaper, sweepGeometry } from '../geometry/sweep';
import { useGeometry } from '../geometry/useGeometry';
import { useCharacterMaterials } from '../MaterialsContext';
import type { Rig } from '../rig/types';

/** Face layout on the skull, angles in degrees (crown angle, turn angle toward his left). */
const EYE = { theta: 97, phi: 23.5, lift: -0.0035, radius: [0.028, 0.035, 0.013] as const };
/** Catch lights, placed the same on both eyes as if lit from one window. */
const SHINES = [
  { x: 0.0085, y: 0.013, radius: 0.0082 },
  { x: -0.0085, y: -0.0125, radius: 0.0042 },
] as const;
const BROW: [number, number][] = [
  [81.2, 14],
  [79.8, 19.5],
  [80.6, 25.5],
];
const MOUTH: [number, number][] = [
  [120.4, -7.5],
  [122.4, -2.5],
  [122.4, 2.5],
  [120.4, 7.5],
];
const NOSE = { theta: 109, lift: -0.0045, radius: [0.013, 0.01, 0.009] as const };

const outward = (point: Vector3, out: Vector3) => out.copy(point).normalize();

function strokeGeometry(points: [number, number][], side: number, lift: number, halfWidth: number, halfThickness: number) {
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

/** Glossy black eyes with catch lights, small soft brows, a hint of a nose and a small smile. */
export function Face({ rig }: { rig: Rig }) {
  const materials = useCharacterMaterials();
  const sphere = useGeometry(() => new SphereGeometry(1, 28, 18));
  const shine = useGeometry(shineGeometry);
  const brows = useGeometry(() => mergeParts([1, -1].map((side) => strokeGeometry(BROW, side, 0.0024, 0.0046, 0.0026))));
  const mouth = useGeometry(() => strokeGeometry(MOUTH, 1, 0.0006, 0.0034, 0.0022));
  const eyeFrames = useMemo(() => [1, -1].map((side) => surfaceFrame(EYE.theta, side * EYE.phi, EYE.lift)), []);
  const nose = useMemo(() => surfaceFrame(NOSE.theta, 0, NOSE.lift), []);

  return (
    <group>
      {rig.eyes.map((eye, index) => (
        <primitive key={eye.name} object={eye} position={eyeFrames[index].position} quaternion={eyeFrames[index].quaternion}>
          <mesh geometry={sphere} material={materials.eye} scale={EYE.radius} />
          <primitive object={rig.shines[index]}>
            <mesh geometry={shine} material={materials.eyeShine} />
          </primitive>
        </primitive>
      ))}
      <mesh geometry={brows} material={materials.brow} />
      <mesh geometry={sphere} material={materials.body} position={nose.position} quaternion={nose.quaternion} scale={NOSE.radius} />
      <mesh geometry={mouth} material={materials.lips} />
    </group>
  );
}
