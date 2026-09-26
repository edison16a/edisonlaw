'use client';

import { useCallback, useRef, type PointerEvent } from 'react';
import { spiralMotion } from '../state/spiralMotion';
import { useSpiralStore } from '../state/spiralStore';
import { cardSpan, DRAG_SLOP, dragTarget, releaseSpeed, releaseTarget, type DragSample } from './drag';
import { moveSpiralTo } from './steering';

interface Drag {
  id: number;
  /** Where the press began, in CSS pixels. */
  x: number;
  /** Where the spiral would be with the mouse back where the press began. Set as the drag starts. */
  start: number;
  /** Pixels of travel per card. */
  span: number;
  /** False until the mouse moves past DRAG_SLOP, so a click still picks a card. */
  moving: boolean;
  samples: DragSample[];
}

/** Samples kept for the speed at release. A few frames' worth is plenty. */
const SAMPLES = 8;

/**
 * Pressing the mouse on the spiral and moving it turns the spiral with the
 * mouse, card by card. Letting go settles on the nearest card, and a flick
 * carries on a few more. Touch keeps its swipe (see useStageSwipe).
 */
export function useStageDrag() {
  const drag = useRef<Drag | null>(null);

  const finish = useCallback((surface: HTMLElement, release: boolean) => {
    const current = drag.current;
    drag.current = null;
    if (!current?.moving) return;
    delete surface.dataset.grabbing;
    spiralMotion.held = false;
    const speed = release ? releaseSpeed(current.samples, performance.now()) : 0;
    moveSpiralTo(releaseTarget(current.start, spiralMotion.target, spiralMotion.value, speed, current.span));
  }, []);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType !== 'mouse' || event.button !== 0 || !event.isPrimary) return;
      // A drag whose release never arrived lets go first.
      finish(event.currentTarget, false);
      if (!useSpiralStore.getState().ready) return;
      const box = event.currentTarget.getBoundingClientRect();
      drag.current = {
        id: event.pointerId,
        x: event.clientX,
        start: spiralMotion.value,
        span: cardSpan(box.width, box.height),
        moving: false,
        samples: [{ x: event.clientX, time: performance.now() }],
      };
    },
    [finish],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const current = drag.current;
      if (!current || current.id !== event.pointerId) return;
      // The button came up somewhere the page never heard about.
      if ((event.buttons & 1) === 0) return finish(event.currentTarget, false);
      const dx = event.clientX - current.x;
      if (!current.moving) {
        if (Math.abs(dx) <= DRAG_SLOP) return;
        current.moving = true;
        // A spiral still turning when the press began has gone on since, so the drag takes it from where it is.
        current.start = spiralMotion.value + dx / current.span;
        // Keep the mouse on the spiral even when it wanders off the stage or the window.
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.dataset.grabbing = '';
        spiralMotion.held = true;
      }
      current.samples.push({ x: event.clientX, time: performance.now() });
      if (current.samples.length > SAMPLES) current.samples.shift();
      moveSpiralTo(dragTarget(current.start, dx, current.span));
    },
    [finish],
  );

  const onPointerUp = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (drag.current?.id === event.pointerId) finish(event.currentTarget, true);
    },
    [finish],
  );

  // A press that wanders off the stage before it drags is not a drag, so a later one can't pick it up.
  const onPointerLeave = useCallback(() => {
    if (drag.current && !drag.current.moving) drag.current = null;
  }, []);

  // A cancelled press, or capture taken away, settles where the spiral is.
  const onPointerCancel = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (drag.current?.id === event.pointerId) finish(event.currentTarget, false);
    },
    [finish],
  );

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave,
    onPointerCancel,
    onLostPointerCapture: onPointerCancel,
  };
}
