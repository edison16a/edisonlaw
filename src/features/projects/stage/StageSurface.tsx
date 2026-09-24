'use client';

import type { ReactNode } from 'react';
import { useStageSwipe } from '../input/useStageSwipe';

/**
 * The layer that holds the canvas. It turns sideways swipes into steps. The
 * canvas itself shows a pointer over every card but the focused one, and a
 * click on any of them turns the spiral to it.
 */
export function StageSurface({ children }: { children: ReactNode }) {
  const swipe = useStageSwipe();

  return (
    <div
      onPointerDown={swipe.onPointerDown}
      onPointerUp={swipe.onPointerUp}
      onPointerCancel={swipe.onPointerCancel}
      className="absolute inset-0 select-none"
    >
      {children}
    </div>
  );
}
