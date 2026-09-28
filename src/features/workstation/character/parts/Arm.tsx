'use client';

import type { ReactNode } from 'react';
import { useDisposable } from '../../useDisposable';
import { BODY } from '../dimensions';
import { sleeveGeometry, taperedCapsule } from '../geometry/capsule';
import { useCharacterMaterials } from '../MaterialsContext';
import type { ArmRig } from '../rig/types';
import { Hand } from './Hand';

const ARM = { upperTop: 0.058, elbow: 0.046, wrist: 0.035, sleeve: 0.074, sleeveCap: 0.065, sleeveLength: 0.15 } as const;

interface ArmProps {
  arm: ArmRig;
  /** Anything held in this hand, placed in the hand bone's space. */
  children?: ReactNode;
}

/** Short sleeve, upper arm, forearm and hand along the arm's bones. */
export function Arm({ arm, children }: ArmProps) {
  const materials = useCharacterMaterials();
  const sleeve = useDisposable(() => sleeveGeometry(ARM.sleeve, ARM.sleeveLength, 1.05, 40, ARM.sleeveCap));
  const upper = useDisposable(() => taperedCapsule(ARM.upperTop, ARM.elbow, BODY.upperArm, 32));
  const lower = useDisposable(() => taperedCapsule(ARM.elbow, ARM.wrist, BODY.forearm, 32));

  return (
    <primitive object={arm.base}>
      <primitive object={arm.upper}>
        <mesh geometry={sleeve} material={materials.shirt} castShadow receiveShadow />
        <mesh geometry={upper} material={materials.body} castShadow />
        <primitive object={arm.lower}>
          <mesh geometry={lower} material={materials.body} castShadow />
          <primitive object={arm.end}>
            <Hand arm={arm} />
            {children}
          </primitive>
        </primitive>
      </primitive>
    </primitive>
  );
}
