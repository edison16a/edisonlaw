'use client';

import { RoundedBox } from '@react-three/drei';
import { DESK, MONITOR, MONITORS, type MonitorSlot } from '../layout';
import { ScreenLight } from '../lighting/ScreenLight';
import { getMaterials } from '../materials/materials';
import { patchDisplayShader } from '../screens/displayShader';
import { useScreenTexture } from '../screens/useScreenTexture';
import type { ScreenId } from '../screens/types';

/** Rounded housing on the back of the panel, which the neck mounts to. */
const HOUSING = { widthRatio: 0.62, heightRatio: 0.6, depth: 0.03, drop: 0.01 };
/** Upright of the stand, centred behind the panel. `top` is its top above the screen centre, hidden by the housing. */
const NECK = { width: 0.05, depth: 0.018, top: 0 };
/** How far touching parts sink into each other, so no seam of light shows between them. */
const OVERLAP = 0.002;
/** Flat foot on the desk, a little ahead of the neck so the panel looks balanced. */
const FOOT = { width: 0.2, depth: 0.15, thickness: 0.012, offsetZ: -0.04 };

interface MonitorProps {
  slot: MonitorSlot;
  screen: ScreenId;
  /** Keep the picture repainting. */
  live: boolean;
}

/**
 * Thin bezel panel on a slim stand, with the screen texture as its face. All three monitors are
 * this one model, placed by MONITORS, so they match exactly.
 */
export function Monitor({ slot, screen, live }: MonitorProps) {
  const materials = getMaterials();
  const { texture } = useScreenTexture(screen, { animate: live });
  const index = Math.max(0, MONITORS.findIndex((monitor) => monitor.slot === slot));
  const spec = MONITORS[index];
  const { screenWidth: w, screenHeight: h, bezel, depth } = MONITOR;
  // Screen centre to desk top. The same for every monitor, since they share one height.
  const drop = spec.position[1] - DESK.height;
  const housingBack = -depth / 2 - HOUSING.depth + 0.003;
  const neckBottom = -drop + FOOT.thickness - OVERLAP;
  const neckZ = housingBack - NECK.depth / 2 + OVERLAP;

  return (
    <group position={spec.position} rotation-y={spec.rotationY}>
      <RoundedBox args={[w + bezel * 2, h + bezel * 2, depth]} radius={0.006} smoothness={3} material={materials.darkPlastic} />
      {/*
        The face is unlit, so the picture shows exactly as painted with no grey glare over it.
        The post chain leaves its pixels out of tone mapping, and at white it stays under the bloom threshold.
      */}
      <mesh position-z={depth / 2 + 0.0005}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} toneMapped={false} onBeforeCompile={patchDisplayShader} />
      </mesh>
      <RoundedBox
        args={[w * HOUSING.widthRatio, h * HOUSING.heightRatio, HOUSING.depth]}
        radius={0.012}
        smoothness={3}
        material={materials.darkPlastic}
        position={[0, -HOUSING.drop, housingBack + HOUSING.depth / 2]}
      />
      {/* The neck stands on the foot and rises against the back of the housing. */}
      <RoundedBox
        args={[NECK.width, NECK.top - neckBottom, NECK.depth]}
        radius={0.007}
        smoothness={3}
        material={materials.aluminium}
        position={[0, (NECK.top + neckBottom) / 2, neckZ]}
      />
      <RoundedBox
        args={[FOOT.width, FOOT.thickness, FOOT.depth]}
        radius={0.005}
        smoothness={3}
        material={materials.aluminium}
        position={[0, -drop + FOOT.thickness / 2, FOOT.offsetZ]}
      />
      <ScreenLight width={w} height={h} />
    </group>
  );
}
