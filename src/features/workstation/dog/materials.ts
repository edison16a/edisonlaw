import { Color, MeshBasicMaterial, MeshPhysicalMaterial } from 'three';

/** Every colour on the dog. Colour is allowed here because it lives inside the 3D scene. */
export const DOG_PALETTE = {
  /** Coat tones from the deep red gold of the back to the cream of the feathering, see TONE. */
  coat: ['#b8662a', '#d68c3e', '#ecb76e', '#f8dfae'],
  /** Stops of the coat gradient, matching `coat`. */
  coatStops: [0, 0.3, 0.62, 0.95],
  coatSheen: '#ffe2ad',
  /** Dark pigment on the lips and round the eyes. */
  pigment: '#2b1a12',
  nose: '#141112',
  /** Dark, kind brown eyes with near black pupils. */
  eye: '#3b1f10',
  pupil: '#0b0706',
} as const;

export interface DogMaterials {
  /** Coat, coloured per vertex. Skinned. */
  coat: MeshPhysicalMaterial;
  /** Ears: the same coat, not skinned. */
  ear: MeshPhysicalMaterial;
  nose: MeshPhysicalMaterial;
  /** The dark line of the closed mouth. */
  lips: MeshPhysicalMaterial;
  eye: MeshPhysicalMaterial;
  pupil: MeshPhysicalMaterial;
  eyeShine: MeshBasicMaterial;
}

/**
 * Scales the fur's sheen by how light the painted coat is under it, so dark paint such as the lids
 * round the eyes stays dark at grazing angles instead of washing out to cream.
 */
const SHEEN_BY_COAT = /* glsl */ `material.sheenColor = sheenColor * smoothstep( 0.03, 0.2, dot( vColor.rgb, vec3( 0.2126, 0.7152, 0.0722 ) ) );`;

/** Soft clay fur: matte, with a warm sheen at grazing angles that reads as fuzz on the silhouette. */
function furMaterial() {
  const material = new MeshPhysicalMaterial({
    color: '#ffffff',
    vertexColors: true,
    roughness: 0.72,
    sheen: 1,
    sheenColor: new Color(DOG_PALETTE.coatSheen),
    sheenRoughness: 0.45,
  });
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <lights_physical_fragment>',
      `#include <lights_physical_fragment>\n#ifdef USE_SHEEN\n${SHEEN_BY_COAT}\n#endif`,
    );
  };
  material.customProgramCacheKey = () => 'dogFur';
  return material;
}

/**
 * Every material draws in the transparent pass, so the dog can fade in (see useFadeIn) without its
 * shaders changing when the fade ends. At full opacity each still writes depth and covers what is
 * behind it, so it draws exactly as an opaque model would.
 */
export function createDogMaterials(): DogMaterials {
  const materials = buildMaterials();
  for (const material of Object.values(materials)) material.transparent = true;
  return materials;
}

function buildMaterials(): DogMaterials {
  return {
    coat: furMaterial(),
    ear: furMaterial(),
    nose: new MeshPhysicalMaterial({ color: DOG_PALETTE.nose, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.25 }),
    lips: new MeshPhysicalMaterial({ color: DOG_PALETTE.pigment, roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.35 }),
    eye: new MeshPhysicalMaterial({ color: DOG_PALETTE.eye, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08 }),
    pupil: new MeshPhysicalMaterial({ color: DOG_PALETTE.pupil, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08 }),
    eyeShine: new MeshBasicMaterial({ color: '#ffffff', toneMapped: false }),
  };
}
