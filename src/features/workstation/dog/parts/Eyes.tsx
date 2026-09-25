'use client';

import { SphereGeometry } from 'three';
import { useDisposable } from '../../useDisposable';
import { mergeParts } from '../../character/geometry/merge';
import { EYE_RADII, PUPIL, type FaceLayout } from '../anatomy/face';
import { useDogMaterials } from '../MaterialsContext';
import type { DogSkeleton } from '../rig/skeleton';

/** Catch lights, placed the same on both eyes as if lit from one window. */
const SHINES = [
  { x: 0.0042, y: 0.0048, radius: 0.0036 },
  { x: -0.0045, y: -0.0052, radius: 0.0017 },
] as const;

/** Where a catch light sits on the front of the glossy eye. */
function shineDepth(x: number, y: number) {
  const [rx, ry, rz] = EYE_RADII;
  const eye = rz * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2 - (y / ry) ** 2));
  const [px, py, pz] = PUPIL.radii;
  const pupil = PUPIL.forward + pz * Math.sqrt(Math.max(0, 1 - (x / px) ** 2 - (y / py) ** 2));
  return Math.max(eye, pupil) - 0.0006;
}

function shineGeometry() {
  return mergeParts(
    SHINES.map(({ x, y, radius }) => new SphereGeometry(1, 12, 8).scale(radius, radius, radius * 0.35).translate(x, y, shineDepth(x, y))),
  );
}

/** Big, dark brown, glossy eyes with near black pupils and white catch lights, seated on the skull. Head space. */
export function Eyes({ rig, face }: { rig: DogSkeleton; face: FaceLayout }) {
  const materials = useDogMaterials();
  const eye = useDisposable(() => new SphereGeometry(1, 28, 20));
  const shine = useDisposable(shineGeometry);
  return (
    <>
      {rig.eyes.map((group, index) => (
        <primitive key={group.name} object={group} position={face.eyes[index].position} quaternion={face.eyes[index].quaternion}>
          <mesh geometry={eye} material={materials.eye} scale={EYE_RADII} />
          <mesh geometry={eye} material={materials.pupil} scale={PUPIL.radii} position-z={PUPIL.forward} />
          <mesh geometry={shine} material={materials.eyeShine} />
        </primitive>
      ))}
    </>
  );
}
