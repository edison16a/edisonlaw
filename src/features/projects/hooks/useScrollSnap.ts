'use client';

import { useEffect } from 'react';
import { useLenis } from 'lenis/react';
import { snapTarget } from '../spiral/detents';
import { indexFromScroll, scrollFromIndex } from '../spiral/track';
import { spiralMotion } from '../state/spiralMotion';
import { useSpiralStore } from '../state/spiralStore';
import { stageMetrics } from '../state/stageMetrics';

/** Quiet time after the last scroll input before the spiral settles on a card. */
const IDLE_MS = 150;
/** Lenis glide used for the snap. Retargeting the glide keeps the motion continuous. */
const SNAP_LERP = 0.075;

/**
 * Once scrolling stops inside the track, glides to the nearest card, or to the
 * neighbour when the visitor nudged away from a locked card. Never snaps before
 * the first card or after the last, so the page can always be scrolled out of.
 */
export function useScrollSnap() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    let timer = 0;
    // The card locked in place when the current gesture began. Nudging away from it commits to the neighbour.
    let anchor: number | null = null;
    let idle = true;

    const snap = () => {
      idle = true;
      if (spiralMotion.dragging) return;
      const heading = lenis.targetScroll;
      const position = indexFromScroll(heading, stageMetrics);
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

    window.addEventListener('wheel', schedule, { passive: true });
    window.addEventListener('touchend', schedule, { passive: true });
    const unsubscribe = lenis.on('scroll', onScroll);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('wheel', schedule);
      window.removeEventListener('touchend', schedule);
      unsubscribe();
    };
  }, [lenis]);
}
