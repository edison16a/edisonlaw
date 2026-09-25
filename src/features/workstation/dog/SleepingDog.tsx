'use client';

import { Suspense, use, useState } from 'react';
import { DogModel } from './DogModel';
import type { DogData } from './geometry/dogData';
import { loadDogData } from './geometry/loadDogData';
import { SLEEPING_PLACEMENT, SLEEPING_SHADOW } from './sleeping/placement';
import { createSleepingRig } from './sleeping/rig';
import { useSleepingMotion } from './sleeping/useSleepingMotion';

export interface SleepingDogProps {
  /** False holds a calm sleeping pose, eyes shut, for reduced motion. */
  animate?: boolean;
}

/**
 * Edison's golden retriever asleep on the floor beside his chair while he works: the same dog as in the
 * about scene, curled up nose to tail like a donut with its tail wrapped round the front. It breathes
 * slowly, twitches in its sleep, now and then lifts its head to look up with sleepy eyes before settling
 * back, and now and then swishes its tail. Its sculpt is built in a worker, and it fades in when ready.
 */
export function SleepingDog({ animate = true }: SleepingDogProps) {
  return (
    <Suspense fallback={null}>
      <LoadedSleepingDog animate={animate} data={loadDogData('sleeping')} />
    </Suspense>
  );
}

function LoadedSleepingDog({ animate, data: pending }: { animate: boolean; data: Promise<DogData> }) {
  const data = use(pending);
  const [rig] = useState(createSleepingRig);
  useSleepingMotion(rig, animate);
  return <DogModel rig={rig} data={data} placement={SLEEPING_PLACEMENT} shadow={SLEEPING_SHADOW} />;
}
