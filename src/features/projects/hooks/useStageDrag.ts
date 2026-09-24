'use client';

import { useCallback, useRef, useState, type PointerEvent } from 'react';
import { useLenis } from 'lenis/react';
import { clamp } from '@/lib/math';
import { snapTarget } from '../spiral/detents';
import { indexFromScroll, scrollFromIndex } from '../spiral/track';
import { spiralMotion } from '../state/spiralMotion';
import { useSpiralStore } from '../state/spiralStore';
import { stageMetrics } from '../state/stageMetrics';

/** Pointer travel that turns the spiral by one card. */
const PIXELS_PER_CARD = 260;
/** Travel before a press becomes a drag, so clicks on cards still work. */
const DRAG_SLOP = 6;
/** How far a release keeps coasting, in seconds of the release speed. */
const COAST = 0.32;

interface Drag {
  id: number;
  x: number;
  y: number;
  scroll: number;
  active: boolean;
  /** Recent speed along the drag, in page pixels per millisecond. */
  velocity: number;
  lastTime: number;
  lastScroll: number;
}

/**
 * Grab and spin the spiral with a mouse or pen. The cards follow the pointer:
 * right or down brings the next card in. On release the spin coasts a little,
 * then settles on the nearest card. Touch keeps native page scrolling.
 */
export function useStageDrag() {
  const lenis = useLenis();
  const drag = useRef<Drag | null>(null);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || event.pointerType === 'touch') return;
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      scroll: window.scrollY,
      active: false,
      velocity: 0,
      lastTime: event.timeStamp,
      lastScroll: window.scrollY,
    };
  }, []);

  const release = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const current = drag.current;
      if (!current || current.id !== event.pointerId) return;
      drag.current = null;
      if (!current.active || !lenis) return;
      spiralMotion.dragging = false;
      setDragging(false);

      const coast = current.lastScroll + clamp(current.velocity, -6, 6) * COAST * 1000;
      const landing = indexFromScroll(coast, stageMetrics);
      const card = snapTarget(landing, null, stageMetrics.count);
      const destination = card === null ? coast : scrollFromIndex(card, stageMetrics);
      lenis.scrollTo(destination, { duration: 0.9, easing: (t) => 1 - Math.pow(1 - t, 3), force: true });
      useSpiralStore.getState().markScrolled();
    },
    [lenis],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const current = drag.current;
      if (!current || current.id !== event.pointerId || !lenis) return;
      // The button came up where this surface could not hear it, over the toggle or outside the window.
      if ((event.buttons & 1) === 0) {
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
      }
      const scroll = current.scroll + ((dx + dy) / PIXELS_PER_CARD) * stageMetrics.perCard;
      lenis.scrollTo(scroll, { immediate: true, force: true });
      const elapsed = Math.max(1, event.timeStamp - current.lastTime);
      current.velocity = current.velocity * 0.6 + ((scroll - current.lastScroll) / elapsed) * 0.4;
      current.lastTime = event.timeStamp;
      current.lastScroll = scroll;
    },
    [lenis, release],
  );

  return {
    dragging,
    onPointerDown,
    onPointerMove,
    onPointerUp: release,
    onPointerCancel: release,
    onLostPointerCapture: release,
  };
}
