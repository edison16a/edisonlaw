'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { MeshBasicMaterial } from 'three';
import { useRgbClock } from './RgbClockProvider';
import { writeRgb } from './rgbClock';

interface RgbMaterialOptions {
  /** Hue shift from the shared clock. */
  hueOffset?: number;
  /** Brightness, above 1 blooms. */
  intensity?: number;
  /** Lower values wash the colour toward white. */
  saturation?: number;
}

/**
 * An unlit glowing material whose colour follows the shared RGB clock and pulse.
 * Used for LED strips, fan rings and light bars.
 */
export function useRgbMaterial({ hueOffset = 0, intensity = 2, saturation = 1 }: RgbMaterialOptions = {}) {
  const clock = useRgbClock();
  const material = useMemo(() => new MeshBasicMaterial({ toneMapped: false }), []);

  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock: time }) => {
    clock.sample(time.elapsedTime);
    writeRgb(material.color, clock.hue + hueOffset, intensity * clock.boost, saturation);
  });

  return material;
}
