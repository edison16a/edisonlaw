'use client';

import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import { AdditiveBlending, DoubleSide, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial } from 'three';
import { createSlabGeometry } from '../../geometry/slab';
import { PC_TOWER } from '../../layout';
import { useRgbMaterial } from '../../lighting/useRgbMaterial';
import { createGlassSheenTexture, createPerforationTexture, createTowerRearTexture } from '../../materials/canvasTextures';
import { useDisposable } from '../../useDisposable';
import { createFritGeometry, createGlassGeometry } from './chassisGeometry';
import { Fan, type FanParts } from './Fan';
import { createFanBladesGeometry, createFanFrameGeometry, createFanHubGeometry, createFanRingGeometry, FAN_DEPTH, FAN_SIZE } from './fanGeometry';
import { TowerInternals } from './TowerInternals';
import { BACK_INNER_Z, FRONT_FANS, GLASS_INNER_Z, INNER_BOTTOM, INNER_TOP, REAR_INNER_X, TOWER } from './towerSpec';

/** Turned a little toward the desk so the camera sees both the glass side and the front fans. */
const YAW = -0.35;
const REAR_FAN = { y: 0.395, z: 0.004 };

/**
 * Glass PC on the floor right of the desk: a black aluminium case whose side and front glass meet at a
 * pillarless corner, with three front fans on a radiator, a rear exhaust fan and lit internals.
 */
export function PcTower({ animate }: { animate: boolean }) {
  const ringMaterial = useRgbMaterial({ intensity: 3 });
  const bladeMaterial = useRgbMaterial({ intensity: 0.34, saturation: 0.75, side: DoubleSide });

  const shell = useDisposable(() => {
    const perforation = createPerforationTexture();
    perforation.repeat.set(14, 7);
    return {
      // Low roughness and a strong environment let the black edges catch the room and read as a shape.
      body: new MeshStandardMaterial({ color: '#131419', roughness: 0.3, metalness: 0.55, envMapIntensity: 1.8 }),
      frit: new MeshStandardMaterial({ color: '#050506', roughness: 0.2 }),
      glass: new MeshPhysicalMaterial({
        color: '#9aa6c0',
        roughness: 0.02,
        metalness: 0,
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
        envMapIntensity: 3,
        specularIntensity: 1,
      }),
      sheen: new MeshBasicMaterial({
        map: createGlassSheenTexture(),
        transparent: true,
        opacity: 0.04,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
      vent: new MeshStandardMaterial({ map: perforation, roughness: 0.55, metalness: 0.4 }),
      rear: new MeshStandardMaterial({ map: createTowerRearTexture(), roughness: 0.5, metalness: 0.35 }),
      rubber: new MeshStandardMaterial({ color: '#0c0c0e', roughness: 0.8 }),
      glassGeometry: createGlassGeometry(),
      fritGeometry: createFritGeometry(),
      plate: createSlabGeometry({ width: TOWER.length, depth: TOWER.depth, height: TOWER.plate, radius: 0.008, bevel: 0.003 }),
      rail: createSlabGeometry({ width: TOWER.length * 0.84, depth: 0.03, height: TOWER.foot, radius: 0.012, bevel: 0.004 }),
    };
  });
  const fanGeometry = useDisposable(() => ({
    frame: createFanFrameGeometry(),
    blades: createFanBladesGeometry(),
    ring: createFanRingGeometry(),
    hub: createFanHubGeometry(),
  }));

  // Materials here are owned by the hooks above, so this object only groups them for the fans.
  const fanParts = useMemo<FanParts>(
    () => ({ ...fanGeometry, frameMaterial: shell.body, hubMaterial: shell.body, ringMaterial, bladeMaterial }),
    [fanGeometry, shell, ringMaterial, bladeMaterial],
  );

  const { length: L, height: H, depth: D, wall } = TOWER;
  const wallHeight = INNER_TOP - INNER_BOTTOM;
  const wallY = (INNER_TOP + INNER_BOTTOM) / 2;
  const rearDepth = GLASS_INNER_Z - BACK_INNER_Z;

  return (
    <group position={PC_TOWER.position} rotation-y={YAW}>
      {/* Rail feet, bottom and top plates, with a perforated vent set into the top. */}
      {[-1, 1].map((side) => (
        <mesh key={side} geometry={shell.rail} material={shell.rubber} position-z={side * (D / 2 - 0.03)} />
      ))}
      <mesh geometry={shell.plate} material={shell.body} position-y={TOWER.foot} />
      <mesh geometry={shell.plate} material={shell.body} position-y={INNER_TOP} />
      <mesh material={shell.vent} position={[0.01, H + 0.0003, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[L - 0.08, D - 0.06]} />
      </mesh>

      {/* Motherboard tray along the back and the rear panel, butted so no faces overlap. */}
      <RoundedBox args={[L, wallHeight, wall]} radius={0.002} smoothness={2} material={shell.body} position={[0, wallY, -D / 2 + wall / 2]} />
      <RoundedBox
        args={[wall, wallHeight, rearDepth]}
        radius={0.002}
        smoothness={2}
        material={shell.body}
        position={[-L / 2 + wall / 2, wallY, (GLASS_INNER_Z + BACK_INNER_Z) / 2]}
      />
      <mesh material={shell.rear} position={[-L / 2 - 0.0004, wallY, (GLASS_INNER_Z + BACK_INNER_Z) / 2]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[rearDepth - 0.01, wallHeight - 0.01]} />
      </mesh>

      <TowerInternals />

      {/* Front intake fans, facing out through the front glass. */}
      {Array.from({ length: FRONT_FANS.count }, (_, index) => (
        <Fan
          key={index}
          parts={fanParts}
          position={[FRONT_FANS.x, FRONT_FANS.firstY + index * (FAN_SIZE + FRONT_FANS.gap), FRONT_FANS.z]}
          rotation={[0, Math.PI / 2, 0]}
          spinning={animate}
        />
      ))}
      {/* Rear exhaust. */}
      <Fan
        parts={fanParts}
        position={[REAR_INNER_X + FAN_DEPTH / 2 + 0.001, REAR_FAN.y, REAR_FAN.z]}
        rotation={[0, -Math.PI / 2, 0]}
        spinning={animate}
      />

      {/* Black print behind the glass, then the glass itself, drawn last. */}
      <mesh geometry={shell.fritGeometry} material={shell.frit} />
      <mesh geometry={shell.glassGeometry} material={shell.glass} renderOrder={2} />
      <mesh geometry={shell.glassGeometry} material={shell.sheen} renderOrder={3} />
    </group>
  );
}
