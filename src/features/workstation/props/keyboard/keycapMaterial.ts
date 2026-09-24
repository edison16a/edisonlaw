import { MeshStandardMaterial } from 'three';

/**
 * Dark keycaps lit from below. The per-instance colour drives the glow instead of the
 * paint: strongest at the base of each cap where the switch LED bleeds out, fainter on top.
 */
export function createKeycapMaterial(capHeight: number) {
  const material = new MeshStandardMaterial({ color: '#16161a', roughness: 0.5, metalness: 0.05 });
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vCapHeight;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>\nvCapHeight = clamp(position.y / ${capHeight.toFixed(5)} + 0.5, 0.0, 1.0);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vCapHeight;')
      // The instance colour is light, not paint, so it must not tint the diffuse colour.
      .replace('#include <color_fragment>', '')
      .replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vColor.rgb * mix(1.0, 0.22, vCapHeight);',
      );
  };
  return material;
}
