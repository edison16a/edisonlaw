'use client';

import { useEffect, useState } from 'react';
import { useLenis } from 'lenis/react';
import { indexFromScroll, scrollFromIndex } from '../spiral/track';
import { resetSpiralMotion } from '../state/spiralMotion';
import { useSpiralStore } from '../state/spiralStore';
import { stageMetrics } from '../state/stageMetrics';

/**
 * Where the spiral opens. Usually wherever the page already is, but after a
 * list row is chosen it jumps straight to that card. Returns the card the
 * spiral opens on, so its picture can load first. Call after the track is measured.
 */
export function useOpeningCard() {
  const lenis = useLenis();
  const [startAt] = useState(() => useSpiralStore.getState().pendingFocus ?? 0);

  useEffect(() => {
    const pending = useSpiralStore.getState().takePendingFocus();
    if (pending === null) {
      resetSpiralMotion(indexFromScroll(window.scrollY, stageMetrics));
      return;
    }
    const top = scrollFromIndex(pending, stageMetrics);
    if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
    else window.scrollTo({ top });
    resetSpiralMotion(pending);
    // Only on mount: the spiral opens once per visit to spiral mode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return startAt;
}
