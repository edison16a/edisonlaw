import type { WebGLProgramParametersWithUniforms } from 'three';

/**
 * Alpha the monitor faces write to mark their pixels as display pixels. The post chain shows
 * those pixels exactly as painted instead of tone mapping them (see effects/DisplayToneMapping).
 * Every other opaque surface writes 1.
 */
export const DISPLAY_ALPHA = 0;

/**
 * How much of the detail lost to minification the unsharp mask puts back. The canvases are painted
 * at up to twice the old resolution, so the fine samples already carry more contrast; a lighter mask
 * keeps the edges as crisp as before with half the dark halo round bright text.
 */
const SHARPEN = 0.2;

/**
 * The monitors show their canvases four to ten times smaller than painted, the side ones at an
 * angle. One trilinear sample sizes its mip level to the longest side of the pixel's footprint, so
 * text goes soft. Four samples on a rotated grid, each covering a quarter of the footprint, keep
 * it crisp without shimmer. A light unsharp mask against the plain sample restores the contrast.
 */
const SAMPLE_DISPLAY = /* glsl */ `
vec4 sampleDisplay(sampler2D image, vec2 uv) {
  vec2 dx = dFdx(uv);
  vec2 dy = dFdy(uv);
  vec2 qx = dx * 0.5;
  vec2 qy = dy * 0.5;
  vec4 fine = 0.25 * (
    textureGrad(image, uv + 0.125 * dx + 0.375 * dy, qx, qy) +
    textureGrad(image, uv - 0.125 * dx - 0.375 * dy, qx, qy) +
    textureGrad(image, uv + 0.375 * dx - 0.125 * dy, qx, qy) +
    textureGrad(image, uv - 0.375 * dx + 0.125 * dy, qx, qy));
  vec3 plain = textureGrad(image, uv, dx, dy).rgb;
  return vec4(clamp(fine.rgb + ${SHARPEN.toFixed(2)} * (fine.rgb - plain), 0.0, 1.0), fine.a);
}
`;

/**
 * Shader tweaks for the monitor faces, applied through `onBeforeCompile` on their unlit material.
 * The chunks are still `#include` lines at this point, so the patch swaps whole includes.
 */
export function patchDisplayShader(shader: WebGLProgramParametersWithUniforms) {
  shader.fragmentShader = shader.fragmentShader
    .replace('void main() {', `#ifdef USE_MAP\n${SAMPLE_DISPLAY}\n#endif\nvoid main() {`)
    .replace('#include <map_fragment>', '#ifdef USE_MAP\n  diffuseColor *= sampleDisplay( map, vMapUv );\n#endif')
    .replace('#include <opaque_fragment>', `#include <opaque_fragment>\ngl_FragColor.a = ${DISPLAY_ALPHA.toFixed(1)};`);
}
