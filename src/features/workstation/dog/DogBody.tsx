'use client';

import type { DogData } from './geometry/dogData';
import { Coat } from './parts/Coat';
import { Ear } from './parts/Ear';
import { Eyes } from './parts/Eyes';
import { Mouth } from './parts/Mouth';
import { Nose } from './parts/Nose';
import { Tongue } from './parts/Tongue';
import type { DogRig } from './rig/createDogRig';

/** Every part on the rig: the skinned coat, and the face parts and ears riding the head. */
export function DogBody({ rig, data }: { rig: DogRig; data: DogData }) {
  return (
    <primitive object={rig.root}>
      <Coat rig={rig} data={data.coat} />
      <primitive object={rig.head}>
        <group position={rig.headOrigin}>
          <Eyes rig={rig} face={data.face} />
          <Nose data={data.nose} frame={data.face.nose} />
          <Mouth />
        </group>
        <primitive object={rig.jaw}>
          <Tongue data={data.tongue} />
        </primitive>
        <primitive object={rig.ears[0]}>
          <Ear data={data.ear} side={1} />
        </primitive>
        <primitive object={rig.ears[1]}>
          <Ear data={data.ear} side={-1} />
        </primitive>
      </primitive>
    </primitive>
  );
}
