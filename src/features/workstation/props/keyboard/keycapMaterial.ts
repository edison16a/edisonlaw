import { AdditiveBlending, MeshBasicMaterial, MeshStandardMaterial } from 'three';

/** Per instance attribute: how far each half of a keycap moves out from the 1u shape, in metres (X, Z). */
export const KEY_STRETCH_ATTRIBUTE = 'keyStretch';

/**
 * Dark keycaps lit from below. The per instance colour drives the glow instead of the paint:
 * strongest at the foot of each cap where the switch light bleeds out, fainter on the top face.
 * Every instance shares the 1u cap geometry, and wider keys push each half of it outward by their
 * `keyStretch`, which keeps the taper and the corners the same size on every key.
 */
export function createKeycapMaterial(capHeight: number) {
  const material = new MeshStandardMaterial({ color: '#15161b', roughness: 0.46, metalness: 0.04 });
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\nattribute vec2 ${KEY_STRETCH_ATTRIBUTE};\nvarying float vCapHeight;`)
      .replace(
        '#include <begin_vertex>',
        [
          '#include <begin_vertex>',
          `transformed.x += sign(transformed.x) * ${KEY_STRETCH_ATTRIBUTE}.x;`,
          `transformed.z += sign(transformed.z) * ${KEY_STRETCH_ATTRIBUTE}.y;`,
          `vCapHeight = clamp(position.y / ${capHeight.toFixed(5)} + 0.5, 0.0, 1.0);`,
        ].join('\n'),
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vCapHeight;')
      // The instance colour is light, not paint, so it must not tint the diffuse colour.
      .replace('#include <color_fragment>', '')
      .replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vColor.rgb * mix(1.0, 0.07, smoothstep(0.0, 0.5, vCapHeight));',
      );
  };
  return material;
}

/**
 * Additive glow for the key halos. Takes its colour from the instance colour, like the caps, and fades
 * with the halo's own alpha so the light pools under each key and dies out on the plate around it.
 */
export function createKeyHaloMaterial(alphaAttribute: string) {
  const material = new MeshBasicMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    toneMapped: false,
  });
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>\nattribute vec2 ${KEY_STRETCH_ATTRIBUTE};\nattribute float ${alphaAttribute};\nvarying float vHalo;`,
      )
      .replace(
        '#include <begin_vertex>',
        [
          '#include <begin_vertex>',
          `transformed.x += sign(transformed.x) * ${KEY_STRETCH_ATTRIBUTE}.x;`,
          `transformed.z += sign(transformed.z) * ${KEY_STRETCH_ATTRIBUTE}.y;`,
          `vHalo = ${alphaAttribute};`,
        ].join('\n'),
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vHalo;')
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= vHalo * vHalo;');
  };
  return material;
}
