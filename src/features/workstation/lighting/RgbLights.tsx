'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { PointLight } from 'three';
import { PC_TOWER, ROOM, type Vec3 } from '../layout';
import { useRgbClock } from './RgbClockProvider';
import { writeRgb } from './rgbClock';

interface RgbLightSpec {
  position: Vec3;
  /** Hue offset from the shared clock, so the spill shifts slightly across the room. */
  hueOffset: number;
  intensity: number;
  distance: number;
}

const [towerX, , towerZ] = PC_TOWER.position;

const LIGHTS: RgbLightSpec[] = [
  // Inside the tower, so colour spills out through the glass onto the floor, desk leg and wall.
  { position: [towerX, 0.32, towerZ + 0.02], hueOffset: 0, intensity: 1.1, distance: 3 },
  // Behind the monitors, washing the back wall like a bias light.
  { position: [0, 1.02, ROOM.backWallZ + 0.16], hueOffset: 0.06, intensity: 0.9, distance: 2.6 },
  // Under the desk, a low glow on the floor and rug.
  { position: [-0.35, 0.3, -0.62], hueOffset: 0.12, intensity: 0.5, distance: 2.2 },
];

/** Coloured point lights that follow the shared RGB hue and its pulse. */
export function RgbLights() {
  const clock = useRgbClock();
  const refs = useRef<(PointLight | null)[]>([]);

  useFrame(({ clock: time }) => {
    clock.sample(time.elapsedTime);
    LIGHTS.forEach((spec, index) => {
      const light = refs.current[index];
      if (!light) return;
      writeRgb(light.color, clock.hue + spec.hueOffset);
      light.intensity = spec.intensity * clock.boost;
    });
  });

  return (
    <>
      {LIGHTS.map((spec, index) => (
        <pointLight
          key={index}
          ref={(light) => {
            refs.current[index] = light;
          }}
          position={spec.position}
          distance={spec.distance}
          decay={2}
          intensity={spec.intensity}
        />
      ))}
    </>
  );
}
