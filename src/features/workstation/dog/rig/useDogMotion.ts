'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { DogRig } from './createDogRig';
import { applyDogPose, createDogPose, dogPose, type DogPose } from './dogPose';

/** Offsets the dog's rhythms from Edison's. */
const SEED = 53;

/** Longest step the idle clock takes in one frame, so a stall or a return to the tab never jumps the pose. */
const MAX_STEP = 0.1;

/**
 * Drives the dog's rig every frame. The pose is a pure function of time; the only state kept is the
 * dog's own clock, which adds up frame times instead of reading the canvas clock, because the canvas
 * resets its clock to zero whenever the stage pauses and resumes and the idle would snap back to its
 * first pose. A still pose is solved once and then left alone.
 */
export function useDogMotion(rig: DogRig, animate: boolean) {
  const scratch = useRef<DogPose | null>(null);
  const held = useRef(false);
  const time = useRef(0);

  useFrame((_, delta) => {
    if (!animate && held.current) return;
    if (animate) time.current += Math.min(delta, MAX_STEP);
    scratch.current ??= createDogPose();
    applyDogPose(rig, dogPose(time.current, animate ? 1 : 0, SEED, scratch.current));
    held.current = !animate;
  });
}
