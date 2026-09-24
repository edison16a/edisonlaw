'use client';

import { RoundedBox } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { ROOM, type Vec3 } from '../../layout';
import { createPictureTexture } from '../../materials/canvasTextures';

const FRAME = { width: 0.46, height: 0.35, depth: 0.03, border: 0.04 };

/** Soft blue frame around a small night landscape. */
export function FramedPicture({ position }: { position: Vec3 }) {
  const picture = useMemo(() => createPictureTexture(), []);
  useEffect(() => () => picture.dispose(), [picture]);
  const [x, y] = position;

  return (
    <group position={[x, y, ROOM.backWallZ + FRAME.depth / 2]}>
      <RoundedBox args={[FRAME.width, FRAME.height, FRAME.depth]} radius={0.02} smoothness={4}>
        <meshStandardMaterial color="#6f86b3" roughness={0.55} />
      </RoundedBox>
      <mesh position-z={FRAME.depth / 2 + 0.001}>
        <planeGeometry args={[FRAME.width - FRAME.border * 2, FRAME.height - FRAME.border * 2]} />
        <meshStandardMaterial map={picture} roughness={0.4} />
      </mesh>
    </group>
  );
}
