'use client';

import { MeshStandardMaterial } from 'three';
import { createFrameRingGeometry } from '../../geometry/frameRing';
import { ROOM, type Vec3 } from '../../layout';
import { createPictureTexture } from '../../materials/canvasTextures';
import { useDisposable } from '../../useDisposable';

const FRAME = { width: 0.46, height: 0.35, border: 0.036, depth: 0.03 };
/** The white mat around the print, and how far the print sits inside it. */
const MAT = { z: 0.01, inset: 0.022 };
const OPEN_WIDTH = FRAME.width - FRAME.border * 2;
const OPEN_HEIGHT = FRAME.height - FRAME.border * 2;
const PRINT_WIDTH = OPEN_WIDTH - MAT.inset * 2;
const PRINT_HEIGHT = OPEN_HEIGHT - MAT.inset * 2;
/**
 * The wall is far from every light, so the print and its mat glow faintly with their own colours, as if
 * they caught the screens' spill. Just enough for the sunset to read in the dark room, and the mat keeps
 * pace with the print so the pair reads as paper in soft light rather than a display.
 */
const PRINT_GLOW = 0.32;
const MAT_GLOW = 0.09;
const MAT_COLOR = '#e9e4da';

/** Soft blue rounded frame around a matted print of a sailboat on calm water at dusk. */
export function FramedPicture({ position }: { position: Vec3 }) {
  const parts = useDisposable(() => {
    const print = createPictureTexture(PRINT_WIDTH, PRINT_HEIGHT);
    return {
      frame: createFrameRingGeometry({ ...FRAME, radius: 0.03, bevel: 0.008 }),
      frameMaterial: new MeshStandardMaterial({ color: '#6f86b3', roughness: 0.5 }),
      mat: new MeshStandardMaterial({ color: MAT_COLOR, emissive: MAT_COLOR, emissiveIntensity: MAT_GLOW, roughness: 0.9 }),
      // Matte, so no reflection streaks across the paint.
      picture: new MeshStandardMaterial({ map: print, emissive: '#ffffff', emissiveMap: print, emissiveIntensity: PRINT_GLOW, roughness: 0.85 }),
    };
  });
  const [x, y] = position;

  return (
    <group position={[x, y, ROOM.backWallZ]}>
      <mesh geometry={parts.frame} material={parts.frameMaterial} />
      <mesh material={parts.mat} position-z={MAT.z}>
        <planeGeometry args={[OPEN_WIDTH + 0.01, OPEN_HEIGHT + 0.01]} />
      </mesh>
      <mesh material={parts.picture} position-z={MAT.z + 0.001}>
        <planeGeometry args={[PRINT_WIDTH, PRINT_HEIGHT]} />
      </mesh>
    </group>
  );
}
