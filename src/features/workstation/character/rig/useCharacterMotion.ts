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
  /** Offsets the idle motion so each pose has its own rhythm. */
  seed: number;
}

/**
 * Drives the rig every frame from the pose layers. Poses are pure functions of time, so this keeps
 * no animation state; a still pose is solved once and then left alone.
 */
export function useCharacterMotion(rig: Rig, { pose, animate, seed }: MotionOptions) {
  const scratch = useRef<BodyPose | null>(null);
  /** The pose last solved as a still, so it is not solved again every frame. */
  const held = useRef<CharacterPose | null>(null);

  useFrame(({ clock }) => {
    if (!animate && held.current === pose) return;

    scratch.current ??= createBodyPose();
    const body = scratch.current;
    const t = clock.elapsedTime;
    const motion = animate ? 1 : 0;
    if (pose === 'seated') seatedPose(t, motion, seed, body);
    else standingPose(t, motion, seed, body);
    body.blink = animate ? blinkAt(t, seed) : 0;
    applyBodyPose(rig, body);
    held.current = animate ? null : pose;
  });
}
