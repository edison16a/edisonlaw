'use client';

import { useCallback } from 'react';
import { useLenis } from 'lenis/react';
import type { SectionId } from '@/content/site';
import { useNavStore } from './useNavStore';

const DURATION = 1.4;

/** Smoothly scrolls to a section and pins the nav underline to it for the trip. */
export function useScrollToSection() {
  const lenis = useLenis();
  const lockTo = useNavStore((state) => state.lockTo);

  return useCallback(
    (id: SectionId) => {
      const target = document.getElementById(id);
      if (!target) return;
      lockTo(id, DURATION * 1000 + 150);
      if (lenis) {
        lenis.scrollTo(target, { duration: DURATION, easing: (t) => 1 - Math.pow(1 - t, 4) });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [lenis, lockTo],
  );
}
