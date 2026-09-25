'use client';

import { useRef } from 'react';
import type { Group } from 'three';
import { DogBody } from './DogBody';
import type { DogData } from './geometry/dogData';
import { DogMaterialsProvider } from './MaterialsContext';
import { Shadow, type ShadowLayout } from './parts/Shadow';
import type { DogPlacement } from './placement';
import type { DogSkeleton } from './rig/skeleton';
import { useFadeIn } from './useFadeIn';

export interface DogModelProps {
  rig: DogSkeleton;
  data: DogData;
  placement: DogPlacement;
  shadow: ShadowLayout;
}

/**
 * One posed dog in the room: its own material set, its contact shadow and every part on its rig, moved
 * into place and faded in as soon as it mounts, without holding up the room.
 */
export function DogModel({ rig, data, placement, shadow }: DogModelProps) {
  const root = useRef<Group>(null);
  useFadeIn(root);

  return (
    <DogMaterialsProvider>
      <group ref={root} name="dog" position={placement.position} rotation-y={placement.rotationY}>
        <Shadow layout={shadow} />
        <DogBody rig={rig} data={data} />
      </group>
    </DogMaterialsProvider>
  );
}
