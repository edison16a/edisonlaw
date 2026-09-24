'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useStageDrag } from '../hooks/useStageDrag';
import { useStageKeys } from '../hooks/useStageKeys';
import { useSpiralStore } from '../state/spiralStore';

interface StageSurfaceProps {
  count: number;
  children: ReactNode;
}

/**
 * The interactive layer over the stage: it takes keyboard focus, turns drags
 * into scrolling and shows the right cursor. Hover and drag state live here so
 * the canvas inside never re-renders for them.
 */
export function StageSurface({ count, children }: StageSurfaceProps) {
  const drag = useStageDrag();
  const onKeyDown = useStageKeys(count);
  const hovered = useSpiralStore((state) => state.hovered);

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Project spiral. Use the arrow keys to move between projects."
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onPointerCancel={drag.onPointerCancel}
      className={cn(
        'absolute inset-0 touch-pan-y rounded-2xl outline-offset-[-10px] select-none focus-visible:outline-white/30',
        drag.dragging ? 'cursor-grabbing' : hovered !== null ? 'cursor-pointer' : 'cursor-grab',
      )}
    >
      {children}
    </div>
  );
}
