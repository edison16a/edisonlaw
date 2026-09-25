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
  /** How much of the hue reaches the room. Low values keep walls and floor near white while the accents cycle. */
  saturation: number;
}

const [towerX, , towerZ] = PC_TOWER.position;

// The colour lives on the emissive parts (tower, strips). These lights only hint at it, with
// short reach and washed out colour, so the room itself stays neutral whatever the hue.
const LIGHTS: RgbLightSpec[] = [
  // Inside the tower, so a little colour spills out through the glass onto the floor beside it.
  { position: [towerX, 0.32, towerZ + 0.02], hueOffset: 0, intensity: 0.7, distance: 2, saturation: 0.55 },
  // Behind the monitors, a soft bias light on the back wall.
  { position: [0, 1.02, ROOM.backWallZ + 0.16], hueOffset: 0.06, intensity: 0.8, distance: 2.4, saturation: 0.2 },
  // Under the desk, a faint glow on the floor.
  { position: [-0.35, 0.3, -0.62], hueOffset: 0.12, intensity: 0.35, distance: 1.8, saturation: 0.2 },
];

/** Coloured point lights that follow the shared RGB hue. */
export function RgbLights() {
  const clock = useRgbClock();
  const refs = useRef<(PointLight | null)[]>([]);

  useFrame(({ clock: time }) => {
    clock.sample(time.elapsedTime);
    LIGHTS.forEach((spec, index) => {
      const light = refs.current[index];
      if (light) writeRgb(light.color, clock.hue + spec.hueOffset, 1, spec.saturation);
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
