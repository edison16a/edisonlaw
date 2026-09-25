'use client';

import type { ReactNode } from 'react';
import { ReactLenis } from 'lenis/react';
import type { VirtualScrollData } from 'lenis';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { isZoomWheel } from '@/lib/zoomWheel';

/** Lenis leaves ctrl with the wheel to the browser. Cmd, which zooms in Firefox on a Mac, goes the same way. */
const smoothable = ({ event }: VirtualScrollData) => !isZoomWheel(event);

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
        virtualScroll: smoothable,
      }}
    >
      {children}
    </ReactLenis>
  );
}
