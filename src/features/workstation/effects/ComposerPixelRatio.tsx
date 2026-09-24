'use client';

import { useThree } from '@react-three/fiber';
import { EffectComposerContext } from '@react-three/postprocessing';
import { use, useEffect } from 'react';
import { Vector2 } from 'three';

const size = new Vector2();

/**
 * Keeps the composer's buffers at the canvas pixel ratio. The wrapper only resizes them when the
 * CSS size changes. Without this, a stage that drops to 1x on slow frames still renders the scene
 * at 2x, and one resized while at 1x stays at 1x once the canvas is back at 2x, stretched and soft.
 * Render it inside EffectComposer.
 */
export function ComposerPixelRatio() {
  const { composer } = use(EffectComposerContext);
  const gl = useThree((state) => state.gl);
  const dpr = useThree((state) => state.viewport.dpr);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    // The renderer already carries the new pixel ratio, so this only resizes the buffers.
    gl.getSize(size);
    composer.setSize(size.width, size.height);
    invalidate();
  }, [composer, gl, dpr, invalidate]);

  return null;
}
