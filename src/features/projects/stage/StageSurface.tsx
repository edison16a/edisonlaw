'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useStageSwipe } from '../input/useStageSwipe';
import { useSpiralStore } from '../state/spiralStore';

/**
 * The layer that holds the canvas. It turns sideways swipes into steps and
 * shows a pointer over the cards around the focused one, which move the
 * spiral when clicked. Hover state lives here so the canvas never re-renders for it.
 */
export function StageSurface({ children }: { children: ReactNode }) {
  const swipe = useStageSwipe();
  const clickable = useSpiralStore((state) => state.hovered !== null && state.hovered !== state.panel);

  return (
    <div
      onPointerDown={swipe.onPointerDown}
      onPointerUp={swipe.onPointerUp}
      onPointerCancel={swipe.onPointerCancel}
      className={cn('absolute inset-0 select-none', clickable && 'cursor-pointer')}
    >
      {children}
    </div>
  );
}
