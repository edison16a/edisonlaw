'use client';

import { useState } from 'react';
import type { DogRig } from './createDogRig';
import { applyDogPose, createDogPose, dogPose } from './dogPose';
import { useIdle } from './useIdle';

/** Offsets the dog's rhythms from Edison's. */
const SEED = 53;

/** Drives the sitting dog's rig every frame (see useIdle). */
export function useDogMotion(rig: DogRig, animate: boolean) {
  const [pose] = useState(createDogPose);
  useIdle(animate, (time, motion) => applyDogPose(rig, dogPose(time, motion, SEED, pose)));
}
