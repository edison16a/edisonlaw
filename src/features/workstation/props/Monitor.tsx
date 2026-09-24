'use client';

import { RoundedBox } from '@react-three/drei';
import { DESK, MONITOR, MONITORS, type MonitorSlot } from '../layout';
import { ScreenLight } from '../lighting/ScreenLight';
import { getMaterials } from '../materials/materials';
import { patchDisplayShader } from '../screens/displayShader';
import { useScreenTexture } from '../screens/useScreenTexture';
import type { ScreenId } from '../screens/types';

const PANEL_DEPTH = 0.014;

interface MonitorProps {
  slot: MonitorSlot;
  screen: ScreenId;
  /** Keep the picture repainting. */
  live: boolean;
}

/** Thin bezel panel on a slim stand, with the screen texture as its face. */
export function Monitor({ slot, screen, live }: MonitorProps) {
  const materials = getMaterials();
  const { texture, glow } = useScreenTexture(screen, { animate: live });
  const index = Math.max(0, MONITORS.findIndex((monitor) => monitor.slot === slot));
  const spec = MONITORS[index];
  const { screenWidth: w, screenHeight: h, bezel } = MONITOR;
  const drop = spec.position[1] - DESK.height;

  return (
    <group position={spec.position} rotation-y={spec.rotationY}>
      <RoundedBox args={[w + bezel * 2, h + bezel * 2, PANEL_DEPTH]} radius={0.006} smoothness={3} material={materials.darkPlastic} />
      {/*
        The face is unlit, so the picture shows exactly as painted with no grey glare over it.
        The post chain leaves its pixels out of tone mapping, and at white it stays under the bloom threshold.
      */}
      <mesh position-z={PANEL_DEPTH / 2 + 0.0005}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} toneMapped={false} onBeforeCompile={patchDisplayShader} />
      </mesh>
      {/* Rounded housing on the back, then the neck and the foot. */}
      <RoundedBox
        args={[w * 0.62, h * 0.6, 0.03]}
        radius={0.012}
        smoothness={3}
        material={materials.darkPlastic}
        position={[0, -0.01, -PANEL_DEPTH / 2 - 0.012]}
      />
      <RoundedBox
        args={[0.05, drop - 0.03, 0.018]}
        radius={0.007}
        smoothness={3}
        material={materials.aluminium}
        position={[0, -drop / 2 + 0.01, -0.052]}
      />
      <RoundedBox
        args={[0.24, 0.012, 0.17]}
        radius={0.005}
        smoothness={3}
        material={materials.aluminium}
        position={[0, -drop + 0.006, -0.05]}
      />
      <ScreenLight texture={glow} width={w} height={h} phase={index / MONITORS.length} />
    </group>
  );
}
