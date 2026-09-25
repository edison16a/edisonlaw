import { Color, MeshBasicMaterial, MeshPhysicalMaterial } from 'three';
import type { Vec3 } from '../layout';

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

/**
 * The fur's emissive is a soft fill of light on the coat alone rather than a glow: it lights the painted
 * coat, so it brings out each tone's own colour, gold as gold and cream as cream. Black, it adds nothing.
 */
const FILL_BY_COAT = /* glsl */ `totalEmissiveRadiance *= diffuseColor.rgb;`;

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
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <lights_physical_fragment>', `#include <lights_physical_fragment>\n#ifdef USE_SHEEN\n${SHEEN_BY_COAT}\n#endif`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n${FILL_BY_COAT}`);
  };
  material.customProgramCacheKey = () => 'dogFur';
  return material;
}

/**
 * How the coat is kept golden under coloured light where a dog lies, the way a painter keeps a golden
 * coat golden in a violet room. Both are linear RGB.
 */
export interface CoatLight {
  /** Multiplies the coat's colour, balancing it against the colour of the light. */
  balance: Vec3;
  /** A soft fill of light on the coat alone, which brings out each tone's own colour (see FILL_BY_COAT). */
  fill: Vec3;
}

/**
 * Every material draws in the transparent pass, so the dog can fade in (see useFadeIn) without its
 * shaders changing when the fade ends. At full opacity each still writes depth and covers what is
 * behind it, so it draws exactly as an opaque model would. The fur is lit by `coatLight` when given.
 */
export function createDogMaterials(coatLight?: CoatLight): DogMaterials {
  const materials = buildMaterials();
  for (const material of Object.values(materials)) material.transparent = true;
  if (coatLight) {
    for (const fur of [materials.coat, materials.ear]) {
      fur.color.setRGB(...coatLight.balance);
      fur.emissive.setRGB(...coatLight.fill);
    }
  }
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
