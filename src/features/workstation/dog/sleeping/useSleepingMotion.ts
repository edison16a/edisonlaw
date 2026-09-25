'use client';

import { useState } from 'react';
import { useIdle } from '../rig/useIdle';
import { applySleepPose, createSleepPose, sleepPose } from './pose';
import type { SleepingRig } from './rig';

/** Offsets the sleeping dog's rhythms from Edison's typing. */
export const SLEEP_SEED = 29;

/** Drives the sleeping dog's rig every frame (see useIdle). */
export function useSleepingMotion(rig: SleepingRig, animate: boolean) {
  const [pose] = useState(createSleepPose);
  useIdle(animate, (time, motion) => applySleepPose(rig, sleepPose(time, motion, SLEEP_SEED, pose)));
}
