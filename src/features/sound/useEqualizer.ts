'use client';

import { useEffect, type RefObject } from 'react';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { EASE_OUT_EXPO_CSS } from '@/lib/easing';

/**
 * Bar heights while sound is off: a paused equaliser. Varied heights read as audio,
 * where a row of equal dots looked like a menu button.
 */
export const PAUSED = [0.35, 0.6, 0.45, 0.3];

export const pausedHeight = (index: number) => PAUSED[index % PAUSED.length];

/**
 * Each bar's own rhythm. Different lengths keep the bars drifting in and out of step,
 * so the motion never visibly repeats.
 */
const RHYTHMS = [
  { heights: [0.5, 0.95, 0.6, 1, 0.45], duration: 1900 },
  { heights: [0.85, 0.4, 1, 0.55, 0.8], duration: 1500 },
  { heights: [0.6, 1, 0.45, 0.85, 0.7], duration: 2300 },
  { heights: [0.9, 0.5, 0.75, 0.4, 1], duration: 1700 },
];

/** A still, readable "on" for reduced motion. */
const STILL = [0.55, 0.9, 0.7, 0.45];

const SETTLE_MS = 500;
const STAGGER_MS = 45;

const scale = (height: number) => `scaleY(${height})`;

/**
 * Drives the equaliser bars with the Web Animations API, on the compositor.
 * Every change starts from the bar's live height, so switching mid motion stays smooth.
 */
export function useEqualizer(bars: RefObject<(HTMLElement | null)[]>, active: boolean) {
  const reduced = useReducedMotion();

  useEffect(() => {
    let current = true;

    bars.current.forEach((bar, index) => {
      if (!bar || typeof bar.animate !== 'function') return;
      const from = getComputedStyle(bar).transform;
      bar.getAnimations().forEach((animation) => animation.cancel());

      const rhythm = RHYTHMS[index % RHYTHMS.length];
      const target = !active ? pausedHeight(index) : reduced ? STILL[index % STILL.length] : rhythm.heights[0];
      const settle = bar.animate([{ transform: from === 'none' ? scale(pausedHeight(index)) : from }, { transform: scale(target) }], {
        duration: reduced ? 0 : SETTLE_MS,
        delay: active && !reduced ? index * STAGGER_MS : 0,
        easing: EASE_OUT_EXPO_CSS,
        fill: 'forwards',
      });
      if (!active || reduced) return;

      settle.onfinish = () => {
        if (!current) return;
        const keyframes = rhythm.heights.map((height) => ({ transform: scale(height), easing: 'ease-in-out' }));
        bar.animate(keyframes, { duration: rhythm.duration, iterations: Infinity, direction: 'alternate' });
      };
    });

    return () => {
      current = false;
    };
  }, [bars, active, reduced]);
}
