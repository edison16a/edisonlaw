'use client';

import { PerformanceMonitor } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { DeskScene, type DeskSceneProps } from './scene/DeskScene';

export type Frameloop = 'always' | 'demand' | 'never';

export interface WorkstationCanvasProps extends DeskSceneProps {
  frameloop: Frameloop;
}

const MAX_DPR = 2;

/** Renders one frame whenever the loop mode changes, so a resumed on-demand canvas is never stale. */
function FrameloopKick({ frameloop }: { frameloop: Frameloop }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    if (frameloop !== 'never') invalidate();
  }, [frameloop, invalidate]);
  return null;
}

/** The R3F canvas for the desk scene. Loaded client-only by WorkstationStage. */
export function WorkstationCanvas({ frameloop, ...sceneProps }: WorkstationCanvasProps) {
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, MAX_DPR));

  return (
    <Canvas
      frameloop={frameloop}
      dpr={[1, dpr]}
      gl={{ antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' }}
      camera={{ fov: 30, near: 0.1, far: 30, position: [2.4, 2.2, 3.2] }}
      style={{ pointerEvents: 'none' }}
    >
      {frameloop === 'always' && (
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
