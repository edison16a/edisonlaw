'use client';

import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useRef, type RefObject } from 'react';
import type { Object3D } from 'three';
import { smoothstep } from '@/lib/math';
import { finishFade, setFade, startFade, type Fade } from './fade';

/** Seconds the dog takes to fade in once its sculpt is ready. */
const DURATION = 0.8;
/** Longest step the fade takes in one frame, so the hitch of compiling the dog's shaders never skips most of it. */
const MAX_STEP = 0.15;

/**
 * Fades the model under `root` in when it mounts, instead of popping in when its worker finishes.
 * With an on demand frame loop it asks for frames until the fade is done.
 */
export function useFadeIn(root: RefObject<Object3D | null>) {
  const fade = useRef<Fade | null>(null);

  useLayoutEffect(() => {
    if (!root.current) return;
    const current = startFade(root.current);
    fade.current = current;
    return () => {
      finishFade(current);
      fade.current = null;
    };
  }, [root]);

  useFrame(({ invalidate }, delta) => {
    const current = fade.current;
    if (!current || current.done) return;
    current.progress = Math.min(1, current.progress + Math.min(delta, MAX_STEP) / DURATION);
    if (current.progress >= 1) {
      finishFade(current);
      return;
    }
    setFade(current, smoothstep(0, 1, current.progress));
    invalidate();
  });
}
