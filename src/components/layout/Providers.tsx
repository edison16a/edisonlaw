'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { SmoothScroll } from '@/features/navigation';

/** Page wide context: smooth scrolling, and Motion following the reduced motion setting. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>{children}</SmoothScroll>
    </MotionConfig>
  );
}
