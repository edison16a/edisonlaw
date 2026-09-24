'use client';

import { BODY } from '../dimensions';
import { sleeveGeometry, taperedCapsule } from '../geometry/capsule';
import { useGeometry } from '../geometry/useGeometry';
import { useCharacterMaterials } from '../MaterialsContext';
import type { LimbRig } from '../rig/types';
import { Shoe } from './Shoe';

const LEG = { hip: 0.071, knee: 0.062, hemFlare: 1.05, trouserLength: 0.2, sock: 0.036 } as const;

/** Black trouser leg, a glimpse of sock and a sneaker along the leg's bones. */
export function Leg({ leg }: { leg: LimbRig }) {
  const materials = useCharacterMaterials();
  const thigh = useGeometry(() => taperedCapsule(LEG.hip, LEG.knee, BODY.thigh));
  const shin = useGeometry(() => sleeveGeometry(LEG.knee, LEG.trouserLength, LEG.hemFlare));
  const sock = useGeometry(() => taperedCapsule(LEG.sock * 1.1, LEG.sock, BODY.shin, 16));

  return (
    <primitive object={leg.base}>
      <primitive object={leg.upper}>
        <mesh geometry={thigh} material={materials.pants} castShadow receiveShadow />
        <primitive object={leg.lower}>
          <mesh geometry={shin} material={materials.pants} castShadow receiveShadow />
          <mesh geometry={sock} material={materials.sock} />
          <primitive object={leg.end}>
            <group scale={[1.12, 1, 1.14]}>
              <Shoe />
            </group>
          </primitive>
        </primitive>
      </primitive>
    </primitive>
  );
}
