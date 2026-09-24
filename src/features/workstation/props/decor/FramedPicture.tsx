'use client';

import { MeshStandardMaterial } from 'three';
import { createFrameRingGeometry } from '../../geometry/frameRing';
import { ROOM, type Vec3 } from '../../layout';
import { createPictureTexture } from '../../materials/canvasTextures';
import { useDisposable } from '../../useDisposable';

const FRAME = { width: 0.46, height: 0.35, border: 0.036, depth: 0.03 };
/** The white mat around the print, and how far the print sits inside it. */
const MAT = { z: 0.01, inset: 0.022 };

/** Soft blue rounded frame around a matted print of a small night landscape. */
export function FramedPicture({ position }: { position: Vec3 }) {
  const parts = useDisposable(() => ({
    frame: createFrameRingGeometry({ ...FRAME, radius: 0.03, bevel: 0.008 }),
    frameMaterial: new MeshStandardMaterial({ color: '#6f86b3', roughness: 0.5 }),
    mat: new MeshStandardMaterial({ color: '#e9e4da', roughness: 0.9 }),
    picture: new MeshStandardMaterial({ map: createPictureTexture(), roughness: 0.4 }),
  }));
  const [x, y] = position;
  const openWidth = FRAME.width - FRAME.border * 2;
  const openHeight = FRAME.height - FRAME.border * 2;

  return (
    <group position={[x, y, ROOM.backWallZ]}>
      <mesh geometry={parts.frame} material={parts.frameMaterial} />
      <mesh material={parts.mat} position-z={MAT.z}>
        <planeGeometry args={[openWidth + 0.01, openHeight + 0.01]} />
      </mesh>
      <mesh material={parts.picture} position-z={MAT.z + 0.001}>
        <planeGeometry args={[openWidth - MAT.inset * 2, openHeight - MAT.inset * 2]} />
      </mesh>
    </group>
  );
}
