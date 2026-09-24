import { Color, MeshBasicMaterial, MeshPhysicalMaterial } from 'three';

/** Every colour on the dog. Colour is allowed here because it lives inside the 3D scene. */
export const DOG_PALETTE = {
  /** Coat tones from the deep gold of the back to the cream of the feathering, see TONE. */
  coat: ['#c98232', '#e3a44c', '#f2c677', '#fbe7bb'],
  /** Stops of the coat gradient, matching `coat`. */
  coatStops: [0, 0.3, 0.62, 0.95],
  coatSheen: '#ffe2ad',
  /** Dark pigment on the lips and round the eyes. */
  pigment: '#2b1a12',
  mouth: '#4a1c1c',
  tongue: '#e8837f',
  tongueSheen: '#ffc2bd',
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
  tongue: MeshPhysicalMaterial;
  eye: MeshPhysicalMaterial;
  pupil: MeshPhysicalMaterial;
  eyeShine: MeshBasicMaterial;
  /** The dark inside of the open mouth. */
  mouth: MeshPhysicalMaterial;
}

/** Soft clay fur: matte, with a warm sheen at grazing angles that reads as fuzz on the silhouette. */
function furMaterial() {
  return new MeshPhysicalMaterial({
    color: '#ffffff',
    vertexColors: true,
    roughness: 0.72,
    sheen: 1,
    sheenColor: new Color(DOG_PALETTE.coatSheen),
    sheenRoughness: 0.45,
  });
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
    tongue: new MeshPhysicalMaterial({
      color: DOG_PALETTE.tongue,
      roughness: 0.35,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
      sheen: 0.4,
      sheenColor: new Color(DOG_PALETTE.tongueSheen),
    }),
    eye: new MeshPhysicalMaterial({ color: DOG_PALETTE.eye, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08 }),
    pupil: new MeshPhysicalMaterial({ color: DOG_PALETTE.pupil, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08 }),
    mouth: new MeshPhysicalMaterial({ color: DOG_PALETTE.mouth, roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.3 }),
    eyeShine: new MeshBasicMaterial({ color: '#ffffff', toneMapped: false }),
  };
}
