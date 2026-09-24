import type { WebGLProgramParametersWithUniforms } from 'three';

/**
 * Alpha the monitor faces write to mark their pixels as display pixels. The post chain shows
 * those pixels exactly as painted instead of tone mapping them (see effects/DisplayToneMapping).
 * Every other opaque surface writes 1.
 */
export const DISPLAY_ALPHA = 0;

/**
 * The screens sit five to ten times smaller on the page than their canvases, so the GPU samples
 * a small mip level and the text goes soft. This bias picks a sharper level instead, and
 * anisotropic filtering still smooths the angled side monitors.
 */
const MIP_BIAS = -0.65;

const SAMPLE = 'texture2D( map, vMapUv )';

/** Shader tweaks for the monitor faces, applied through `onBeforeCompile` on their unlit material. */
export function patchDisplayShader(shader: WebGLProgramParametersWithUniforms) {
  shader.fragmentShader = shader.fragmentShader
    .replace(SAMPLE, `texture2D( map, vMapUv, ${MIP_BIAS.toFixed(2)} )`)
    .replace('#include <opaque_fragment>', `#include <opaque_fragment>\ngl_FragColor.a = ${DISPLAY_ALPHA.toFixed(1)};`);
}
