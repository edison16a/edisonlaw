'use client';

import { useCallback, useRef, type PointerEvent } from 'react';
import { stepSpiral } from './steering';
import { swipeStep } from './swipe';

interface Press {
  id: number;
  x: number;
  y: number;
}

/**
 * A sideways swipe on a touch screen turns the spiral one project, and the
 * cards go the way the finger went: a swipe to the left brings in the next
 * card waiting on the right, like the phone carousel and any photo gallery.
 * The stage only lets the browser pan up and down, so a vertical swipe
 * scrolls the page and cancels the press here.
 */
export function useStageSwipe() {
  const press = useRef<Press | null>(null);

  const onPointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' || !event.isPrimary) return;
    press.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }, []);

  const onPointerUp = useCallback((event: PointerEvent<HTMLElement>) => {
    const start = press.current;
    if (!start || start.id !== event.pointerId) return;
    press.current = null;
    const direction = swipeStep(event.clientX - start.x, event.clientY - start.y);
    if (direction !== null) stepSpiral(direction);
  }, []);

  const onPointerCancel = useCallback(() => {
    press.current = null;
  }, []);

  return { onPointerDown, onPointerUp, onPointerCancel };
}
