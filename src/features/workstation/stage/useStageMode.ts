'use client';

import { useState, type RefObject } from 'react';
import { useInView } from '@/lib/hooks/useInView';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import type { Frameloop, StageVariant } from '../types';
import { useCaptureVariant } from './useCaptureVariant';

/** Start loading the scene a full screen before it scrolls in. */
const NEAR_MARGIN = '100% 0px 100% 0px';

export interface StageMode {
  /** This stage is being captured by scripts/capture-renders.mjs. */
  capturing: boolean;
  /** Show the pre-rendered still instead of a canvas. */
  showImage: boolean;
  /** Mount the live canvas. */
  live: boolean;
  frameloop: Frameloop;
  /** Idle animation, typing, fans and the keyboard wave. */
  animate: boolean;
  /** The RGB hue cycles. Held still for reduced motion and captures. */
  rgbCycle: boolean;
  /** Screens keep repainting. */
  screensLive: boolean;
  parallax: boolean;
  /** Lower the pixel ratio when frames run slow. */
  adaptive: boolean;
}

/**
 * Decides how a stage renders from where it is on the page and what the device prefers:
 * a paused, still or fully animated canvas, or the phone render.
 */
export function useStageMode(ref: RefObject<HTMLElement | null>, variant: StageVariant, imageFailed: boolean): StageMode {
  const near = useInView(ref, { rootMargin: NEAR_MARGIN });
  const onScreen = useInView(ref);
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const capture = useCaptureVariant();

  // Once mounted, the canvas stays mounted so scrolling back never recompiles shaders.
  const [wasNear, setWasNear] = useState(false);
  if (near && !wasNear) setWasNear(true);

  const capturing = capture === variant;
  const showImage = isMobile && !imageFailed && !capture;
  const still = reducedMotion || isMobile;
  const animate = capturing || !still;

  let frameloop: Frameloop = 'always';
  if (!capturing && !onScreen) frameloop = 'never';
  else if (!capturing && still) frameloop = 'demand';

  return {
    capturing,
    showImage,
    live: capturing || (!capture && !showImage && wasNear),
    frameloop,
    animate,
    rgbCycle: animate && !capturing,
    screensLive: animate && (capturing || onScreen),
    parallax: animate && !capturing,
    adaptive: !capturing,
  };
}
