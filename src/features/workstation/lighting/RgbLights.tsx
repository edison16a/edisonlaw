'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Color, type PointLight } from 'three';
import { useRgbClock } from './RgbClockProvider';
import { FROZEN_HUE } from './rgbClock';
import { RGB_ROOM_LIGHTS, writeRoomLightColor } from './roomLights';

/** Each light's colour at the resting violet, which the lights that never cycle keep. */
const REST_COLORS = RGB_ROOM_LIGHTS.map((spec) => writeRoomLightColor(new Color(), spec, FROZEN_HUE));
const CYCLING = RGB_ROOM_LIGHTS.flatMap((spec, index) => (spec.cycles ? [index] : []));

/** Coloured point lights at one steady brightness. Only the ones that cycle follow the shared RGB hue. */
export function RgbLights() {
  const clock = useRgbClock();
  const refs = useRef<(PointLight | null)[]>([]);

  useFrame(({ clock: time }) => {
    clock.sample(time.elapsedTime);
    for (const index of CYCLING) {
      const light = refs.current[index];
      if (light) writeRoomLightColor(light.color, RGB_ROOM_LIGHTS[index], clock.hue);
    }
  });

  return (
    <>
      {RGB_ROOM_LIGHTS.map((spec, index) => (
        <pointLight
          key={index}
          ref={(light) => {
            refs.current[index] = light;
          }}
          color={REST_COLORS[index]}
          position={spec.position}
          distance={spec.distance}
          decay={2}
          intensity={spec.intensity}
        />
      ))}
    </>
  );
}
