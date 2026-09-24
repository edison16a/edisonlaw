'use client';

import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { HalfFloatType } from 'three';
import { ComposerPixelRatio } from './ComposerPixelRatio';
import { DisplayToneMapping } from './DisplayToneMapping';

/**
 * Bloom only catches what is brighter than display white: RGB strips, fans and LEDs.
 * The monitor faces peak at exactly white, so their text never feeds it and stays sharp.
 * Tone mapping runs here rather than on the renderer, after bloom has seen the HDR values,
 * and leaves the monitor faces at their painted colours.
 */
export function Effects() {
  return (
    <EffectComposer multisampling={4} frameBufferType={HalfFloatType} stencilBuffer={false}>
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.25} intensity={0.85} radius={0.72} />
      <DisplayToneMapping />
      <Vignette offset={0.28} darkness={0.62} />
      <Noise opacity={0.045} blendFunction={BlendFunction.OVERLAY} />
      <ComposerPixelRatio />
    </EffectComposer>
  );
}
