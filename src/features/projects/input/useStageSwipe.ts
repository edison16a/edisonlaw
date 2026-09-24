'use client';

import { useCallback, useRef, type PointerEvent } from 'react';
import { stepSpiral } from './steering';

/** Sideways travel, in pixels, that counts as a swipe. */
const SWIPE_DISTANCE = 40;
/** How much more sideways than up or down a swipe has to be, so scrolling the page never turns the spiral. */
const SIDEWAYS = 1.3;

interface Press {
  id: number;
  x: number;
  y: number;
}

/**
 * A sideways swipe on a touch screen turns the spiral one project, and the
 * cards go the way the finger went: a swipe to the right brings in the next
 * card waiting on the left. The stage only lets the browser pan up and down,
 * so a vertical swipe scrolls the page and cancels the press here.
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
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy) * SIDEWAYS) return;
    stepSpiral(dx > 0 ? 1 : -1);
  }, []);

  const onPointerCancel = useCallback(() => {
    press.current = null;
  }, []);

  return { onPointerDown, onPointerUp, onPointerCancel };
}
