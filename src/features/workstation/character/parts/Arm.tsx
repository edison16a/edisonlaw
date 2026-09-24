'use client';

import type { ReactNode } from 'react';
import { BODY } from '../dimensions';
import { sleeveGeometry, taperedCapsule } from '../geometry/capsule';
import { useGeometry } from '../geometry/useGeometry';
import { useCharacterMaterials } from '../MaterialsContext';
import type { ArmRig } from '../rig/types';
import { Hand } from './Hand';

const ARM = { upperTop: 0.041, elbow: 0.035, wrist: 0.029, sleeve: 0.052, sleeveLength: 0.095 } as const;

interface ArmProps {
  arm: ArmRig;
  /** Anything held in this hand, placed in the hand bone's space. */
  children?: ReactNode;
}

/** Short sleeve, upper arm, forearm and hand along the arm's bones. */
export function Arm({ arm, children }: ArmProps) {
  const materials = useCharacterMaterials();
  const sleeve = useGeometry(() => sleeveGeometry(ARM.sleeve, ARM.sleeveLength, 1.03));
  const upper = useGeometry(() => taperedCapsule(ARM.upperTop, ARM.elbow, BODY.upperArm));
  const lower = useGeometry(() => taperedCapsule(ARM.elbow, ARM.wrist, BODY.forearm));

  return (
    <primitive object={arm.base}>
      <primitive object={arm.upper}>
        <mesh geometry={sleeve} material={materials.sleeve} castShadow receiveShadow />
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
