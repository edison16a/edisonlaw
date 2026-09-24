'use client';

import type { ReactNode } from 'react';
import { ReactLenis } from 'lenis/react';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

/** Weighted, eased page scrolling. Turns itself off for reduced motion. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  return (
    <ReactLenis
      root
      options={{
        lerp: reducedMotion ? 1 : 0.09,
        smoothWheel: !reducedMotion,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.4,
      }}
    >
      {children}
    </ReactLenis>
  );
}
