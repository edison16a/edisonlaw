import { MeshPhysicalMaterial, MeshStandardMaterial } from 'three';
import { createFloorTexture } from './canvasTextures';
import { withEdgeFade } from './edgeFade';

/**
 * Materials shared by several props. Built once on first use and reused by every
 * scene on the page, so repeated surfaces cost one shader and one upload.
 */
function createMaterials() {
  const floorMap = createFloorTexture();
  floorMap.repeat.set(1.6, 1.6);

  return {
    /** Near black charcoal with a hint of warmth. */
    wall: withEdgeFade(new MeshStandardMaterial({ color: '#27221f', roughness: 0.96 })),
    skirting: withEdgeFade(new MeshStandardMaterial({ color: '#1a1715', roughness: 0.8 })),
    floor: withEdgeFade(new MeshStandardMaterial({ map: floorMap, color: '#b4a497', roughness: 0.62 })),
    /** Pale off-white laminate, catches the screen light. */
    deskTop: new MeshPhysicalMaterial({ color: '#e7e2d9', roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.5 }),
    lightWood: new MeshStandardMaterial({ color: '#b98d62', roughness: 0.62 }),
    /** Glossy white plastic for the chair shell, pots and the mug. */
    whitePlastic: new MeshPhysicalMaterial({ color: '#efece6', roughness: 0.38, clearcoat: 0.4, clearcoatRoughness: 0.35 }),
    brushedMetal: new MeshStandardMaterial({ color: '#9ca0a8', metalness: 0.85, roughness: 0.32 }),
    /** Satin brass for the desk's leg ferrules. */
    brass: new MeshStandardMaterial({ color: '#c9a060', metalness: 0.85, roughness: 0.3 }),
    aluminium: new MeshStandardMaterial({ color: '#c9ccd1', metalness: 0.8, roughness: 0.34 }),
    /** Apple's bead blasted finishes: half metal so they stay readable in the dim room. */
    silverAluminium: new MeshStandardMaterial({ color: '#d9dbdf', metalness: 0.55, roughness: 0.3 }),
    spaceGrey: new MeshStandardMaterial({ color: '#5d6066', metalness: 0.6, roughness: 0.32 }),
    /** Mirror polished Apple logos. */
    polishedChrome: new MeshStandardMaterial({ color: '#eef0f3', metalness: 1, roughness: 0.08 }),
    /** Black glass and gloss, for displays and the inside of the laptop. */
    blackGlass: new MeshStandardMaterial({ color: '#050507', roughness: 0.08, metalness: 0.2 }),
    /** Satin graphite for bezels, the keyboard case and small electronics. */
    darkPlastic: new MeshStandardMaterial({ color: '#17181c', roughness: 0.55, metalness: 0.1 }),
    blackMatte: new MeshStandardMaterial({ color: '#0b0b0d', roughness: 0.8 }),
    rubber: new MeshStandardMaterial({ color: '#232326', roughness: 0.9 }),
  };
}

export type SharedMaterials = ReturnType<typeof createMaterials>;

let shared: SharedMaterials | null = null;

export function getMaterials(): SharedMaterials {
  shared ??= createMaterials();
  return shared;
}
