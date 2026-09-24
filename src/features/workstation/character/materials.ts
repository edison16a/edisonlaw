import { Color, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, type Texture } from 'three';

/** Every colour on the character. Colour is allowed here because it lives inside the 3D scene. */
export const PALETTE = {
  skin: '#f6cfb2',
  skinShade: '#e7ad92',
  blush: '#f39a8e',
  lips: '#9c4b44',
  hair: '#16161b',
  hairShort: '#2a2a31',
  hairSheen: '#6d7ea8',
  eye: '#0c0c10',
  shirt: '#2748b0',
  shirtRib: '#1f3a92',
  print: '#fdb515',
  pants: '#1b1b1f',
  pantsSheen: '#50505e',
  shoe: '#f3f2ee',
  sole: '#d8d7d2',
  shoeAccent: '#1c1c20',
  sock: '#ecebe7',
  mug: '#efe9df',
  coffee: '#3a2217',
} as const;

export interface CharacterMaterials {
  /** Skin tinted by the head's vertex colours (blush, shading). */
  skin: MeshPhysicalMaterial;
  /** Skin for limbs and neck, no vertex colours. */
  body: MeshPhysicalMaterial;
  hair: MeshPhysicalMaterial;
  /** Matte close crop of the undercut. */
  hairShort: MeshStandardMaterial;
  brow: MeshStandardMaterial;
  eye: MeshPhysicalMaterial;
  eyeShine: MeshBasicMaterial;
  lips: MeshStandardMaterial;
  shirt: MeshPhysicalMaterial;
  /** Plain shirt fabric for the sleeves, which have no print. */
  sleeve: MeshPhysicalMaterial;
  shirtRib: MeshPhysicalMaterial;
  pants: MeshPhysicalMaterial;
  shoe: MeshPhysicalMaterial;
  sole: MeshStandardMaterial;
  shoeAccent: MeshStandardMaterial;
  sock: MeshStandardMaterial;
  mug: MeshPhysicalMaterial;
  coffee: MeshPhysicalMaterial;
}

/** Soft clay skin: broad, low highlights and a faint warm sheen at grazing angles. */
function skinMaterial(vertexColors: boolean) {
  return new MeshPhysicalMaterial({
    color: vertexColors ? '#ffffff' : PALETTE.skin,
    vertexColors,
    roughness: 0.58,
    sheen: 0.35,
    sheenColor: new Color('#ffd7c4'),
    sheenRoughness: 0.6,
  });
}

function fabric(color: string, sheenColor: string, roughness = 0.82) {
  return new MeshPhysicalMaterial({ color, roughness, sheen: 0.6, sheenColor: new Color(sheenColor), sheenRoughness: 0.5 });
}

/** Builds the full set. `shirtMap` carries the base colour and the chest print. */
export function createCharacterMaterials(shirtMap: Texture): CharacterMaterials {
  const shirt = fabric('#ffffff', '#6f8ae0');
  shirt.map = shirtMap;
  return {
    skin: skinMaterial(true),
    body: skinMaterial(false),
    hair: new MeshPhysicalMaterial({
      color: PALETTE.hair,
      vertexColors: true,
      roughness: 0.5,
      clearcoat: 0.12,
      clearcoatRoughness: 0.4,
      sheen: 0.55,
      sheenColor: new Color(PALETTE.hairSheen),
      sheenRoughness: 0.42,
    }),
    hairShort: new MeshStandardMaterial({ color: PALETTE.hairShort, roughness: 0.85 }),
    brow: new MeshStandardMaterial({ color: PALETTE.hair, roughness: 0.7 }),
    eye: new MeshPhysicalMaterial({ color: PALETTE.eye, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08 }),
    eyeShine: new MeshBasicMaterial({ color: '#ffffff', toneMapped: false }),
    lips: new MeshStandardMaterial({ color: PALETTE.lips, roughness: 0.6 }),
    shirt,
    sleeve: fabric(PALETTE.shirt, '#6f8ae0'),
    shirtRib: fabric(PALETTE.shirtRib, '#6f8ae0'),
    pants: fabric(PALETTE.pants, PALETTE.pantsSheen, 0.86),
    shoe: new MeshPhysicalMaterial({ color: PALETTE.shoe, roughness: 0.55, sheen: 0.3, sheenColor: new Color('#ffffff') }),
    sole: new MeshStandardMaterial({ color: PALETTE.sole, roughness: 0.7 }),
    shoeAccent: new MeshStandardMaterial({ color: PALETTE.shoeAccent, roughness: 0.6 }),
    sock: new MeshStandardMaterial({ color: PALETTE.sock, roughness: 0.9 }),
    mug: new MeshPhysicalMaterial({ color: PALETTE.mug, roughness: 0.28, clearcoat: 0.6, clearcoatRoughness: 0.2 }),
    coffee: new MeshPhysicalMaterial({ color: PALETTE.coffee, roughness: 0.12, clearcoat: 1 }),
  };
}

export function disposeCharacterMaterials(materials: CharacterMaterials) {
  for (const material of Object.values(materials)) material.dispose();
}
