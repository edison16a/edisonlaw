'use client';

import type { PointerEvent, ReactNode } from 'react';
import { useStageDrag } from '../input/useStageDrag';
import { useStageSwipe } from '../input/useStageSwipe';

/**
 * The layer that holds the canvas. It turns sideways swipes into steps, and
 * the mouse can grab the spiral and drag it round. The canvas itself shows a
 * pointer over every card but the focused one, and a click on any of them
 * turns the spiral to it.
 */
export function StageSurface({ children }: { children: ReactNode }) {
  const swipe = useStageSwipe();
  const drag = useStageDrag();

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    swipe.onPointerDown(event);
    drag.onPointerDown(event);
  };
  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    swipe.onPointerUp(event);
    drag.onPointerUp(event);
  };
  const onPointerCancel = (event: PointerEvent<HTMLElement>) => {
    swipe.onPointerCancel();
    drag.onPointerCancel(event);
  };

  return (
    // A mouse sees an open hand over the spiral, and a closed one everywhere while it drags.
    <div
      onPointerDown={onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={drag.onPointerLeave}
      onPointerCancel={onPointerCancel}
      onLostPointerCapture={drag.onLostPointerCapture}
      className="absolute inset-0 select-none pointer-fine:cursor-grab data-grabbing:cursor-grabbing data-grabbing:**:cursor-grabbing!"
    >
      {children}
    </div>
  );
}
