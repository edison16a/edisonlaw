'use client';

import { useCallback, useRef, useState, type PointerEvent } from 'react';
import { clamp } from '@/lib/math';
import { snapTarget } from '../spiral/detents';
import { spiralMotion } from '../state/spiralMotion';
import { spinTo, stopSpin } from './steering';

/** Pointer travel that turns the spiral by one card. */
const PIXELS_PER_CARD = 260;
/** Travel before a press becomes a drag, so clicks and taps on cards still work. */
const DRAG_SLOP = 6;
/** How far a release keeps coasting, in seconds of the release speed. */
const COAST = 0.32;
/** Fastest release that still coasts, in cards per millisecond. */
const MAX_FLICK = 0.012;

interface Drag {
  id: number;
  x: number;
  y: number;
  /** Card index when the press began. */
  from: number;
  active: boolean;
  /** Recent speed along the drag, in cards per millisecond. */
  velocity: number;
  lastTime: number;
  lastIndex: number;
}

/**
 * Grab and spin the spiral with a mouse, a pen or, on tablets, a finger. The
 * cards follow the pointer: right or down brings the next card in. On release
 * the spin coasts a little, then settles on the nearest card. `calm` skips the
 * coast for visitors who prefer reduced motion.
 */
export function useStageDrag(calm: boolean) {
  const drag = useRef<Drag | null>(null);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    const from = spiralMotion.target;
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      from,
      active: false,
      velocity: 0,
      lastTime: event.timeStamp,
      lastIndex: from,
    };
  }, []);

  const release = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const current = drag.current;
      if (!current || current.id !== event.pointerId) return;
      drag.current = null;
      if (!current.active) return;
      spiralMotion.dragging = false;
      setDragging(false);
      const coast = calm ? 0 : clamp(current.velocity, -MAX_FLICK, MAX_FLICK) * COAST * 1000;
      spinTo(snapTarget(current.lastIndex + coast, null));
    },
    [calm],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const current = drag.current;
      if (!current || current.id !== event.pointerId) return;
      // The button came up where this surface could not hear it, outside the window for example.
      if (event.pointerType === 'mouse' && (event.buttons & 1) === 0) {
        release(event);
        return;
      }
      const dx = event.clientX - current.x;
      const dy = event.clientY - current.y;
      if (!current.active) {
        if (Math.hypot(dx, dy) < DRAG_SLOP) return;
        current.active = true;
        spiralMotion.dragging = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
        stopSpin();
      }
      const index = current.from + (dx + dy) / PIXELS_PER_CARD;
      spinTo(index);
      const elapsed = Math.max(1, event.timeStamp - current.lastTime);
      current.velocity = current.velocity * 0.6 + ((index - current.lastIndex) / elapsed) * 0.4;
      current.lastTime = event.timeStamp;
      current.lastIndex = index;
    },
    [release],
  );

  // A touch starts out captured by the canvas under the finger. Moving the capture to the surface
  // makes the canvas lose it, and that event bubbles up here, so only the surface's own loss ends the drag.
  const onLostPointerCapture = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (event.target === event.currentTarget) release(event);
    },
    [release],
  );

  return {
    dragging,
    onPointerDown,
    onPointerMove,
    onPointerUp: release,
    onPointerCancel: release,
    onLostPointerCapture,
  };
}
