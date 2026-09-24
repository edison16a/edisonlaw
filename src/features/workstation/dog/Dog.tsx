'use client';

import { Suspense, use, useState } from 'react';
import { DogBody } from './DogBody';
import type { DogData } from './geometry/dogData';
import { loadDogData } from './geometry/loadDogData';
import { DogMaterialsProvider } from './MaterialsContext';
import { DOG_PLACEMENT } from './placement';
import { createDogRig } from './rig/createDogRig';
import { useDogMotion } from './rig/useDogMotion';
import { Shadow } from './parts/Shadow';

export interface DogProps {
  /** False freezes the idle animation, for reduced motion. */
  animate?: boolean;
}

/**
 * Edison's golden retriever, sculpted procedurally in the same soft clay style as him. It stands at his
 * left side with the top of its head under his hand at DOG_PAT_POINT (see layout.ts), wagging, panting
 * and leaning into the petting. In its own space it faces +Z; DOG_PLACEMENT puts it in the room.
 * The sculpt is built in a worker, and the dog appears as soon as it is ready without holding up the room.
 */
export function Dog({ animate = true }: DogProps) {
  return (
    <Suspense fallback={null}>
      <LoadedDog animate={animate} data={loadDogData()} />
    </Suspense>
  );
}

function LoadedDog({ animate, data: pending }: { animate: boolean; data: Promise<DogData> }) {
  const data = use(pending);
  const [rig] = useState(createDogRig);
  useDogMotion(rig, animate);

  return (
    <DogMaterialsProvider>
      <group name="dog" position={DOG_PLACEMENT.position} rotation-y={DOG_PLACEMENT.rotationY}>
        <Shadow />
        <DogBody rig={rig} data={data} />
      </group>
    </DogMaterialsProvider>
  );
}
