'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { sampleOf } from '../input/wheelSample';
import { createWheelStrokes } from '../input/wheelStrokes';
import { endMoveGlide, holdMove, soundMove } from '../sound/moveSound';

/**
 * The phone strip's move sound: once as the strip reaches another project,
 * and not again until it comes to rest, however many projects a long glide
 * passes and however slowly it passes the last of them. A new touch or a
 * fresh trackpad swipe starts a gesture of its own, which sounds again as it
 * reaches a project, and so do the buttons and the arrow keys.
 */
export function useStripSound(strip: RefObject<HTMLElement | null>, active: number) {
  const previous = useRef(active);

  useEffect(() => {
    if (previous.current !== active) soundMove();
    previous.current = active;
  }, [active]);

  useEffect(() => {
    const node = strip.current;
    if (!node) return;
    const strokes = createWheelStrokes();
    const onWheel = (event: WheelEvent) => {
      if (strokes.read(sampleOf(event)).begins) endMoveGlide();
    };
    node.addEventListener('scroll', holdMove, { passive: true });
    node.addEventListener('pointerdown', endMoveGlide, { passive: true });
    node.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      node.removeEventListener('scroll', holdMove);
      node.removeEventListener('pointerdown', endMoveGlide);
      node.removeEventListener('wheel', onWheel);
    };
  }, [strip]);
}
