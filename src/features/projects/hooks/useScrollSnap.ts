'use client';

import { useEffect } from 'react';
import { useLenis } from 'lenis/react';
import { snapTarget } from '../spiral/detents';
import { rawIndexFromScroll, scrollFromIndex } from '../spiral/track';
import { spiralMotion } from '../state/spiralMotion';
import { useSpiralStore } from '../state/spiralStore';
import { stageMetrics } from '../state/stageMetrics';

/** Quiet time after the last scroll input before the spiral settles on a card. */
const IDLE_MS = 150;
/** Lenis glide used for the snap. Retargeting the glide keeps the motion continuous. */
const SNAP_LERP = 0.075;
/** A finger silent for this long counts as lifted, in case the browser never says so. */
const TOUCH_TIMEOUT_MS = 2000;

/**
 * Once scrolling stops inside the track, glides to the nearest card, or to the
 * neighbour when the visitor nudged away from a locked card. Never snaps before
 * the first card or after the last, so the page can always be scrolled out of,
 * and never while a finger is still on the screen.
 */
export function useScrollSnap() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    let timer = 0;
    // The card locked in place when the current gesture began. Nudging away from it commits to the neighbour.
    let anchor: number | null = null;
    let idle = true;
    let touching = false;
    let lastTouchAt = 0;

    const snap = () => {
      // Never pull the page from under a finger that is still down. Check again shortly.
      if (touching && performance.now() - lastTouchAt < TOUCH_TIMEOUT_MS) {
        timer = window.setTimeout(snap, IDLE_MS);
        return;
      }
      touching = false;
      idle = true;
      if (spiralMotion.dragging) return;
      const heading = lenis.targetScroll;
      // Unclamped, so a stop past either end of the track never pulls the page back in.
      const position = rawIndexFromScroll(heading, stageMetrics);
      const card = snapTarget(position, anchor, stageMetrics.count);
      if (card === null) return;
      const destination = scrollFromIndex(card, stageMetrics);
      if (Math.abs(destination - heading) < 1) return;
      lenis.scrollTo(destination, { lerp: SNAP_LERP });
    };

    const schedule = () => {
      if (idle) anchor = useSpiralStore.getState().settled;
      idle = false;
      window.clearTimeout(timer);
      timer = window.setTimeout(snap, IDLE_MS);
    };

    // Wheel glides are smooth scrolls, so they are caught at the input. Keys and the scrollbar scroll natively.
    const onScroll = () => {
      if (lenis.isScrolling === 'native') schedule();
    };

    // A touch takes its anchor as the finger lands, before the spiral starts to move.
    const onTouch = (event: TouchEvent) => {
      touching = event.touches.length > 0;
      lastTouchAt = performance.now();
      if (event.type !== 'touchmove') schedule();
    };
    const onWheel = () => {
      touching = false;
      schedule();
    };

    const touchEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel'] as const;
    window.addEventListener('wheel', onWheel, { passive: true });
    touchEvents.forEach((type) => window.addEventListener(type, onTouch, { passive: true }));
    const unsubscribe = lenis.on('scroll', onScroll);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('wheel', onWheel);
      touchEvents.forEach((type) => window.removeEventListener(type, onTouch));
      unsubscribe();
    };
  }, [lenis]);
}
