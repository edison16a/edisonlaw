'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

/** Frames to wait: the composer needs one frame to build its passes before output is final. */
const SETTLE_FRAMES = 3;

/** Calls `onReady` once the scene has put real pixels on screen, so the stage can fade in. */
export function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);

  useFrame(({ invalidate }) => {
    if (frames.current > SETTLE_FRAMES) return;
    frames.current += 1;
    if (frames.current > SETTLE_FRAMES) onReady();
    // With an on-demand frame loop, keep asking for frames until the signal fires.
    else invalidate();
  });

  return null;
}
