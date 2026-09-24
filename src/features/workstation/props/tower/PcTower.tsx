'use client';

import { RoundedBox } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { MeshPhysicalMaterial, MeshStandardMaterial } from 'three';
import { PC_TOWER } from '../../layout';
import { useRgbMaterial } from '../../lighting/useRgbMaterial';
import { Fan, type FanParts } from './Fan';
import { createFanBladesGeometry, createFanFrameGeometry, createFanHubGeometry, createFanRingGeometry, FAN_DEPTH, FAN_SIZE } from './fanGeometry';
import { TowerInternals } from './TowerInternals';
import { TOWER } from './towerSpec';

/** Turned a little toward the desk so the camera sees both the glass side and the front fans. */
const YAW = -0.35;
const FRONT_FAN_COUNT = 3;

interface PcTowerProps {
  animate: boolean;
}

/** Glass-sided PC on the floor right of the desk: visible internals, three front fans and an RGB strip. */
export function PcTower({ animate }: PcTowerProps) {
  const ringMaterial = useRgbMaterial({ intensity: 3.2 });
  const bladeMaterial = useRgbMaterial({ intensity: 0.32, saturation: 0.8 });
  const strip = useRgbMaterial({ hueOffset: 0.03, intensity: 2.6 });

  const shell = useMemo(
    () => ({
      body: new MeshStandardMaterial({ color: '#111216', roughness: 0.42, metalness: 0.45 }),
      glass: new MeshPhysicalMaterial({
        color: '#0b0d12',
        roughness: 0.04,
        metalness: 0,
        clearcoat: 1,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
        envMapIntensity: 2.2,
      }),
    }),
    [],
  );

  const fanParts = useMemo<FanParts>(
    () => ({
      frame: createFanFrameGeometry(),
      blades: createFanBladesGeometry(),
      ring: createFanRingGeometry(),
      hub: createFanHubGeometry(),
      frameMaterial: shell.body,
      hubMaterial: shell.body,
      ringMaterial,
      bladeMaterial,
    }),
    [shell, ringMaterial, bladeMaterial],
  );

  useEffect(
    () => () => {
      shell.body.dispose();
      shell.glass.dispose();
      fanParts.frame.dispose();
      fanParts.blades.dispose();
      fanParts.ring.dispose();
      fanParts.hub.dispose();
    },
    [shell, fanParts],
  );

  const { length: L, height: H, depth: D, wall, foot } = TOWER;
  const bodyH = H - foot;
  const midY = foot + bodyH / 2;
  const fanX = L / 2 - wall - FAN_DEPTH / 2 - 0.004;
  const fanStart = TOWER.shroudTop + FAN_SIZE / 2 + 0.006;

  return (
    <group position={PC_TOWER.position} rotation-y={YAW}>
      {/* Case: back panel, top, bottom and rear, then glass on the side and front. */}
      <RoundedBox args={[L, bodyH, wall]} radius={0.003} smoothness={2} material={shell.body} position={[0, midY, -D / 2 + wall / 2]} />
      <RoundedBox args={[L, wall, D]} radius={0.003} smoothness={2} material={shell.body} position={[0, H - wall / 2, 0]} />
      <RoundedBox args={[L, wall, D]} radius={0.003} smoothness={2} material={shell.body} position={[0, foot + wall / 2, 0]} />
      <RoundedBox args={[wall, bodyH, D]} radius={0.003} smoothness={2} material={shell.body} position={[-L / 2 + wall / 2, midY, 0]} />
      <mesh material={shell.body} position={[L / 2 - 0.006, midY, D / 2 - 0.006]}>
        <boxGeometry args={[0.012, bodyH, 0.012]} />
      </mesh>
      <mesh material={shell.glass} position={[0, midY, D / 2 - 0.002]}>
        <boxGeometry args={[L - 0.012, bodyH - wall * 2, 0.003]} />
      </mesh>
      <mesh material={shell.glass} position={[L / 2 - 0.002, midY, 0]}>
        <boxGeometry args={[0.003, bodyH - wall * 2, D - 0.012]} />
      </mesh>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} material={shell.body} position={[sx * (L / 2 - 0.04), foot / 2, sz * (D / 2 - 0.03)]}>
            <cylinderGeometry args={[0.012, 0.014, foot, 12]} />
          </mesh>
        )),
      )}

      <TowerInternals />

      {/* Front intake fans, facing out through the front glass. */}
      {Array.from({ length: FRONT_FAN_COUNT }, (_, index) => (
        <Fan
          key={index}
          parts={fanParts}
          position={[fanX, fanStart + index * (FAN_SIZE + 0.004), 0]}
          rotation={[0, Math.PI / 2, 0]}
          spinning={animate}
        />
      ))}
      {/* Rear exhaust. */}
      <Fan parts={fanParts} position={[-L / 2 + wall + FAN_DEPTH / 2 + 0.002, 0.39, 0.01]} rotation={[0, -Math.PI / 2, 0]} spinning={animate} />

      {/* Vertical strip in the front corner behind the glass. */}
      <mesh material={strip} position={[L / 2 - 0.022, midY, D / 2 - 0.016]}>
        <boxGeometry args={[0.004, bodyH - 0.05, 0.004]} />
      </mesh>
    </group>
  );
}
