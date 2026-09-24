'use client';

import type { ReactNode } from 'react';
import { BODY } from './dimensions';
import { Arm } from './parts/Arm';
import { Face } from './parts/Face';
import { Hair } from './parts/Hair';
import { Head } from './parts/Head';
import { Hips } from './parts/Hips';
import { Leg } from './parts/Leg';
import { Neck } from './parts/Neck';
import { Torso } from './parts/Torso';
import type { Rig } from './rig/types';

interface CharacterBodyProps {
  rig: Rig;
  /** Held in his right hand, in the hand bone's space. */
  rightHand?: ReactNode;
}

/** Every visible part, nested on the rig's bones: pelvis, spine, chest, neck, head and the limbs. */
export function CharacterBody({ rig, rightHand }: CharacterBodyProps) {
  return (
    <primitive object={rig.pelvis}>
      <Hips />
      <Leg leg={rig.legs.left} />
      <Leg leg={rig.legs.right} />
      <primitive object={rig.spine}>
        <primitive object={rig.chest}>
          <Torso />
          <Arm arm={rig.arms.left} />
          <Arm arm={rig.arms.right}>{rightHand}</Arm>
          <primitive object={rig.neck}>
            <Neck />
            <primitive object={rig.head}>
              <group position={[0, BODY.headCenter.y, BODY.headCenter.z]}>
                <Head />
                <Face rig={rig} />
                <Hair />
              </group>
            </primitive>
          </primitive>
        </primitive>
      </primitive>
    </primitive>
  );
}
