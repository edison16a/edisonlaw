'use client';

import { RGB_ROOM_LIGHTS } from './roomLights';

/**
 * Coloured point lights for the spill of the RGB setup. They hold one colour and one strength and never
 * read the RGB clock, so the room stays put while the fans and strips cycle.
 */
export function RgbLights() {
  return (
    <>
      {RGB_ROOM_LIGHTS.map((spec, index) => (
        <pointLight
          key={index}
          color={spec.color}
          position={spec.position}
          distance={spec.distance}
          decay={2}
          intensity={spec.intensity}
        />
      ))}
    </>
  );
}
