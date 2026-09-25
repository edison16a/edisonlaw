'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

/** Longest step the idle clock takes in one frame, so a stall or a return to the tab never jumps the pose. */
const MAX_STEP = 0.1;

/**
 * Drives a pose every frame from the dog's own clock. The pose is a pure function of time, so the only
 * state kept is the clock, which adds up frame times instead of reading the canvas clock: the canvas
 * resets its clock to zero whenever the stage pauses and resumes, and the idle would snap back to its
 * first pose. `apply` gets the time and how much motion to play, 1 or 0; a still pose is solved once and
 * then left alone.
 */
export function useIdle(animate: boolean, apply: (time: number, motion: number) => void) {
  const held = useRef(false);
  const time = useRef(0);

  useFrame((_, delta) => {
    if (!animate && held.current) return;
    if (animate) time.current += Math.min(delta, MAX_STEP);
    apply(time.current, animate ? 1 : 0);
    held.current = !animate;
  });
}
