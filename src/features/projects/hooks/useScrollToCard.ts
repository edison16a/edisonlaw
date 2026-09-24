'use client';

import { useCallback } from 'react';
import { useLenis } from 'lenis/react';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { clamp } from '@/lib/math';
import { scrollFromIndex } from '../spiral/track';
import { spiralMotion } from '../state/spiralMotion';
import { stageMetrics } from '../state/stageMetrics';

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Scrolls the page so card `index` lands in the focus slot. Longer trips take
 * a little longer, so a spin across the whole deck still reads as one motion.
 */
export function useScrollToCard() {
  const lenis = useLenis();
  const reducedMotion = useReducedMotion();

  return useCallback(
    (index: number) => {
      const top = scrollFromIndex(index, stageMetrics);
      const distance = Math.abs(index - spiralMotion.value);
      if (!lenis || reducedMotion) {
        window.scrollTo({ top });
        return;
      }
      lenis.scrollTo(top, { duration: clamp(0.7 + distance * 0.09, 0.7, 1.9), easing: easeInOutCubic, force: true });
    },
    [lenis, reducedMotion],
  );
}
