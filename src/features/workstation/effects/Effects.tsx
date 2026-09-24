'use client';

import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import { HalfFloatType } from 'three';

/**
 * Bloom only catches emissive surfaces (screens, RGB, LEDs) thanks to the high threshold.
 * Tone mapping runs here rather than on the renderer, after bloom has seen the HDR values.
 */
export function Effects() {
  return (
    <EffectComposer multisampling={4} frameBufferType={HalfFloatType} stencilBuffer={false}>
      <Bloom mipmapBlur luminanceThreshold={0.95} luminanceSmoothing={0.25} intensity={0.85} radius={0.72} />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <Vignette offset={0.28} darkness={0.62} />
      <Noise opacity={0.045} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
}
