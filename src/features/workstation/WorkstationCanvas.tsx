'use client';

import { PerformanceMonitor } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { DeskScene, type DeskSceneProps } from './scene/DeskScene';
import type { Frameloop } from './types';

export interface WorkstationCanvasProps extends DeskSceneProps {
  frameloop: Frameloop;
  /** Drop to 1x pixel ratio when the frame rate struggles. Off for captures, which want full detail. */
  adaptive: boolean;
}

const MAX_DPR = 2;
/**
 * Both cameras stand well back from the room, the About one about nine metres out, so the near plane
 * sits a metre out rather than a hand's width. That spends the depth buffer on the room itself, and
 * thin layers such as the print on its mat or the rug's bands never shimmer against each other.
 */
const CAMERA = { fov: 30, near: 1, far: 30, position: [2.4, 2.2, 3.2] as const };

/** Renders one frame whenever the loop mode changes, so a resumed on-demand canvas is never stale. */
function FrameloopKick({ frameloop }: { frameloop: Frameloop }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    if (frameloop !== 'never') invalidate();
  }, [frameloop, invalidate]);
  return null;
}

/** The R3F canvas for the desk scene. Loaded client-only by WorkstationStage. */
export function WorkstationCanvas({ frameloop, adaptive, ...sceneProps }: WorkstationCanvasProps) {
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, MAX_DPR));

  return (
    <Canvas
      frameloop={frameloop}
      dpr={[1, dpr]}
      gl={{ antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' }}
      camera={CAMERA}
      style={{ pointerEvents: 'none' }}
    >
      {adaptive && frameloop === 'always' && (
        <PerformanceMonitor
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(Math.min(window.devicePixelRatio || 1, MAX_DPR))}
          flipflops={3}
        />
      )}
      <FrameloopKick frameloop={frameloop} />
      <DeskScene {...sceneProps} />
    </Canvas>
  );
}
