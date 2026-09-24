'use client';

import type { ReactNode, Ref } from 'react';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { useStageDrag } from '../input/useStageDrag';
import { useSpiralStore } from '../state/spiralStore';

interface StageSurfaceProps {
  ref: Ref<HTMLDivElement>;
  children: ReactNode;
}

/**
 * The interactive layer over the stage: it takes keyboard focus, turns drags
 * into spins and shows the right cursor. Hover and drag state live here so the
 * canvas inside never re-renders for them.
 */
export function StageSurface({ ref, children }: StageSurfaceProps) {
  const drag = useStageDrag(useReducedMotion());
  // Only a card other than the one in the panel goes somewhere when clicked.
  const clickable = useSpiralStore((state) => state.hovered !== null && state.hovered !== state.panel);

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="carousel"
      aria-label="Project spiral. Use the arrow keys to move between projects."
      tabIndex={0}
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onPointerCancel={drag.onPointerCancel}
      onLostPointerCapture={drag.onLostPointerCapture}
      className={cn(
        'absolute inset-0 rounded-2xl outline-offset-[-10px] select-none focus-visible:outline-white/70',
        drag.dragging ? 'cursor-grabbing' : clickable ? 'cursor-pointer' : 'cursor-grab',
      )}
    >
      {children}
    </div>
  );
}
