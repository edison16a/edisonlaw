'use client';

import { useFrame } from '@react-three/fiber';
import { FrontSide, MeshBasicMaterial, type Side } from 'three';
import { useDisposable } from '../useDisposable';
import { useRgbClock } from './RgbClockProvider';
import { writeRgb } from './rgbClock';

interface RgbMaterialOptions {
  /** Hue shift from the shared clock. */
  hueOffset?: number;
  /** Brightness, above 1 blooms. */
  intensity?: number;
  /** Lower values wash the colour toward white. */
  saturation?: number;
  /** Which faces draw. Thin open surfaces such as fan blades need both. */
  side?: Side;
}

/**
 * An unlit glowing material whose colour follows the shared RGB clock.
 * Used for LED strips, fan rings and light bars.
 */
export function useRgbMaterial({ hueOffset = 0, intensity = 2, saturation = 1, side = FrontSide }: RgbMaterialOptions = {}) {
  const clock = useRgbClock();
  const material = useDisposable(() => new MeshBasicMaterial({ toneMapped: false, side }));

  useFrame(({ clock: time }) => {
    clock.sample(time.elapsedTime);
    writeRgb(material.color, clock.hue + hueOffset, intensity, saturation);
  });

  return material;
}
