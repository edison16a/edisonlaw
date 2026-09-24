'use client';

import { SphereGeometry } from 'three';
import { HAND } from '../dimensions';
import { taperedCapsule } from '../geometry/capsule';
import { useGeometry } from '../geometry/useGeometry';
import { useCharacterMaterials } from '../MaterialsContext';
import type { ArmRig } from '../rig/types';

function useFingerGeometries() {
  const index = useGeometry(() => taperedCapsule(HAND.fingerRadius, HAND.fingerRadius * 0.94, HAND.fingerLengths[0], 10));
  const middle = useGeometry(() => taperedCapsule(HAND.fingerRadius, HAND.fingerRadius * 0.94, HAND.fingerLengths[1], 10));
  const ring = useGeometry(() => taperedCapsule(HAND.fingerRadius, HAND.fingerRadius * 0.94, HAND.fingerLengths[2], 10));
  const little = useGeometry(() => taperedCapsule(HAND.fingerRadius * 0.92, HAND.fingerRadius * 0.86, HAND.fingerLengths[3], 10));
  return [index, middle, ring, little];
}

/** A soft chibi hand: a rounded palm, four stubby fingers and a thumb, in the hand bone's space. */
export function Hand({ arm }: { arm: ArmRig }) {
  const materials = useCharacterMaterials();
  const palm = useGeometry(() => new SphereGeometry(1, 20, 14));
  const thumb = useGeometry(() => taperedCapsule(HAND.fingerRadius * 1.12, HAND.fingerRadius, HAND.thumbLength, 10));
  const fingers = useFingerGeometries();

  return (
    <group>
      <mesh
        geometry={palm}
        material={materials.body}
        position={[0, -HAND.palmLength * 0.54, 0]}
        scale={[HAND.palmWidth / 2, HAND.palmLength * 0.62, HAND.palmThickness / 2]}
        castShadow
      />
      {arm.fingers.map((knuckle, index) => (
        <primitive key={knuckle.name} object={knuckle}>
          <mesh geometry={fingers[index]} material={materials.body} />
        </primitive>
      ))}
      <primitive object={arm.thumb}>
        <mesh geometry={thumb} material={materials.body} />
      </primitive>
    </group>
  );
}
