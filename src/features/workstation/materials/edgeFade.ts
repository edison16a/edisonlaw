import { Vector3, type Material } from 'three';

/** Middle of the lit part of the room, roughly the desk. */
const FADE_CENTER = new Vector3(0.35, 0.8, -0.35);
/** Half extents of the ellipsoid that stays fully visible, in metres. */
const FADE_RADII = new Vector3(3.1, 2.5, 2.9);

const COMMON = '#include <common>';
const DECLARE = 'varying vec3 vFadeWorld;';

/**
 * Patches a lit material so it fades to black toward the edges of the room,
 * which lets the walls and floor melt into the black page instead of ending in a hard line.
 */
export function withEdgeFade<T extends Material>(material: T): T {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uFadeCenter = { value: FADE_CENTER };
    shader.uniforms.uFadeRadii = { value: FADE_RADII };
    shader.vertexShader = shader.vertexShader
      .replace(COMMON, `${COMMON}\n${DECLARE}`)
      .replace(
        '#include <project_vertex>',
        '#include <project_vertex>\nvFadeWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(COMMON, `${COMMON}\n${DECLARE}\nuniform vec3 uFadeCenter;\nuniform vec3 uFadeRadii;`)
      .replace(
        '#include <opaque_fragment>',
        [
          '#include <opaque_fragment>',
          'float fadeDistance = length((vFadeWorld - uFadeCenter) / uFadeRadii);',
          'gl_FragColor.rgb *= 1.0 - smoothstep(0.55, 1.0, fadeDistance);',
        ].join('\n'),
      );
  };
  return material;
}
