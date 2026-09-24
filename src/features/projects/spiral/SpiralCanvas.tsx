'use client';

import { Canvas } from '@react-three/fiber';
import { CAMERA } from './lens';
import { SpiralScene, type SpiralSceneProps } from './SpiralScene';

interface SpiralCanvasProps extends SpiralSceneProps {
  /** Renders only while the stage is on screen. */
  active: boolean;
}

/** The one WebGL canvas behind the spiral stage. Load it client only. */
export function SpiralCanvas({ active, ...scene }: SpiralCanvasProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={active ? 'always' : 'never'}
      flat
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, CAMERA.z], fov: CAMERA.fov, near: 0.1, far: 40 }}
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden="true"
    >
      <SpiralScene {...scene} />
    </Canvas>
  );
}
