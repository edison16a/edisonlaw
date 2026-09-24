'use client';

import { RgbLights } from './RgbLights';
import { SceneEnvironment } from './SceneEnvironment';

/**
 * Night lighting. The monitors light the desk through their own area lights (see ScreenLight);
 * this adds the dim cool fill, a faint moonlight rim from the left and the RGB spill.
 */
export function Lighting() {
  return (
    <>
      <hemisphereLight args={['#27304d', '#0b0806', 0.4]} />
      <directionalLight color="#8095d4" intensity={0.45} position={[-4.5, 3.4, 0.6]} />
      <RgbLights />
      <SceneEnvironment />
    </>
  );
}
