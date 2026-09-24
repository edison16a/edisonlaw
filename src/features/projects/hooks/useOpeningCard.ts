'use client';

import { useEffect, useState } from 'react';
import { indexFromScroll } from '../spiral/track';
import { resetSpiralMotion } from '../state/spiralMotion';
import { stageMetrics } from '../state/stageMetrics';

/**
 * Where the spiral opens: wherever the page already is. Returns the card the
 * spiral opens on, so its picture can load first. Call after the track is measured.
 */
export function useOpeningCard() {
  const [startAt] = useState(0);

  useEffect(() => {
    resetSpiralMotion(indexFromScroll(window.scrollY, stageMetrics));
  }, []);

  return startAt;
}
