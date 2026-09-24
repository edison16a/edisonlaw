'use client';

import { useDisposable } from '../../useDisposable';
import { BODY } from '../dimensions';
import { sleeveGeometry, taperedCapsule } from '../geometry/capsule';
import { useCharacterMaterials } from '../MaterialsContext';
import type { LimbRig } from '../rig/types';
import { Shoe } from './Shoe';

/**
 * The shin starts a hair inside the end of the thigh with a flatter dome, so the leg runs on smoothly
 * through the knee without the two ever sharing a surface there, then flares to the hem.
 */
const LEG = {
  hip: 0.071,
  knee: 0.062,
  shin: { top: 0.0614, cap: 0.05, flare: 1.058 },
  trouserLength: 0.2,
  sock: { top: 0.04, ankle: 0.0305 },
} as const;

/** Black trouser leg, a glimpse of sock and a sneaker along the leg's bones. */
export function Leg({ leg }: { leg: LimbRig }) {
  const materials = useCharacterMaterials();
  const thigh = useDisposable(() => taperedCapsule(LEG.hip, LEG.knee, BODY.thigh));
  const shin = useDisposable(() => sleeveGeometry(LEG.shin.top, LEG.trouserLength, LEG.shin.flare, 36, LEG.shin.cap));
  const sock = useDisposable(() => taperedCapsule(LEG.sock.top, LEG.sock.ankle, BODY.shin, 20));

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
