'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { blinkAt } from './blink';
import { applyBodyPose, createBodyPose, type BodyPose } from './bodyPose';
import { seatedPose } from './seatedPose';
import { standingPose } from './standingPose';
import type { Rig } from './types';

export type CharacterPose = 'seated' | 'standing';

interface MotionOptions {
  pose: CharacterPose;
  /** False holds a still pose, for reduced motion. */
  animate: boolean;
  /** Holds the clock at this many seconds. */
  frozenTime?: number;
  /** Keeps two characters in one scene from moving in step. */
  seed: number;
}

/**
 * Drives the rig every frame from the pose layers. Poses are pure functions of time, so this keeps
 * no animation state; a still pose is solved once and then left alone.
 */
export function useCharacterMotion(rig: Rig, { pose, animate, frozenTime, seed }: MotionOptions) {
  const scratch = useRef<BodyPose | null>(null);
  const held = useRef<{ pose: CharacterPose; time?: number } | null>(null);

  useFrame(({ clock }) => {
    const still = !animate || frozenTime !== undefined;
    if (still && held.current?.pose === pose && held.current.time === frozenTime) return;

    scratch.current ??= createBodyPose();
    const body = scratch.current;
    const t = frozenTime ?? clock.elapsedTime;
    const motion = animate ? 1 : 0;
    if (pose === 'seated') seatedPose(t, motion, seed, body);
    else standingPose(t, motion, seed, body);
    body.blink = animate ? blinkAt(t, seed) : 0;
    applyBodyPose(rig, body);
    held.current = still ? { pose, time: frozenTime } : null;
  });
}
