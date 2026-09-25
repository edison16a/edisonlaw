'use client';

import { useEffect, useState } from 'react';
import { createProjectMoveSound } from '../sound/moveSound';

/**
 * The phone strip's move sound: once for every project the strip reaches,
 * whether a swipe, a long glide, a button or an arrow key moved it. A strip
 * that skips several projects between two frames still sounds each of them,
 * a moment apart.
 */
export function useStripSound(active: number) {
  const [moveSound] = useState(createProjectMoveSound);

  useEffect(() => {
    let frame = 0;
    const play = () => {
      moveSound.track(active, active, performance.now());
      frame = moveSound.pending() ? requestAnimationFrame(play) : 0;
    };
    play();
    return () => cancelAnimationFrame(frame);
  }, [active, moveSound]);
}
