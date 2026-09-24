'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { DogRig } from './createDogRig';
import { applyDogPose, createDogPose, dogPose, type DogPose } from './dogPose';

/** Offsets the dog's rhythms from Edison's. */
const SEED = 53;

/**
 * Drives the dog's rig every frame. The pose is a pure function of time, so this keeps no animation
 * state; a still pose is solved once and then left alone.
 */
export function useDogMotion(rig: DogRig, animate: boolean) {
  const scratch = useRef<DogPose | null>(null);
  const held = useRef(false);

  useFrame(({ clock }) => {
    if (!animate && held.current) return;
    scratch.current ??= createDogPose();
    applyDogPose(rig, dogPose(clock.elapsedTime, animate ? 1 : 0, SEED, scratch.current));
    held.current = !animate;
  });
}
