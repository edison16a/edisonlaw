import type { WebGLProgramParametersWithUniforms } from 'three';

/**
 * Alpha the monitor faces write to mark their pixels as display pixels. The post chain shows
 * those pixels exactly as painted instead of tone mapping them (see effects/DisplayToneMapping).
 * Every other opaque surface writes 1.
 */
export const DISPLAY_ALPHA = 0;

/** Shader tweaks for the monitor faces, applied through `onBeforeCompile` on their unlit material. */
export function patchDisplayShader(shader: WebGLProgramParametersWithUniforms) {
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <opaque_fragment>',
    `#include <opaque_fragment>\ngl_FragColor.a = ${DISPLAY_ALPHA.toFixed(1)};`,
  );
}
