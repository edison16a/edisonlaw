'use client';

import { Color, Float32BufferAttribute, MeshStandardMaterial, SphereGeometry } from 'three';
import { smoothstep } from '@/lib/math';
import type { Vec3 } from '../../layout';
import { useDisposable } from '../../useDisposable';

const BLACK = new Color('#1b1d24');
const WHITE = new Color('#f1eee8');
const ORANGE = '#e38a2e';
/** Body radii: an egg a little wider than deep. */
const BODY = { x: 0.04, y: 0.052, z: 0.036, centre: 0.05 };
const EYE = { x: 0.0125, y: 0.074 };

/**
 * One smooth egg for the body, painted in vertex colours: white belly and a heart shaped white face
 * around the eyes, black everywhere else. No second shell is laid over it, so no seam can flicker.
 */
function createBodyGeometry() {
  const geometry = new SphereGeometry(1, 48, 32);
  const position = geometry.attributes.position;
  const colors: number[] = [];
  const color = new Color();
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const belly = smoothstep(0.22, 0.42, z) * smoothstep(0.42, 0.22, y);
    const lobe = (side: number) => Math.hypot((x - side * 0.3) / 0.34, (y - 0.4) / 0.32);
    const face = smoothstep(0.25, 0.45, z) * smoothstep(1, 0.82, Math.min(lobe(-1), lobe(1)));
    color.copy(BLACK).lerp(WHITE, Math.max(belly, face));
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  return geometry;
}

/** Where a point on the body's surface is, straight out from the centre at height `y` and offset `x`. */
function onSurface(x: number, y: number, lift = 0): Vec3 {
  const ux = x / BODY.x;
  const uy = (y - BODY.centre) / BODY.y;
  const uz = Math.sqrt(Math.max(0, 1 - ux * ux - uy * uy));
  return [x, y, uz * BODY.z + lift];
}

interface PenguinProps {
  position: Vec3;
  rotationY?: number;
}

/** Small penguin figurine, egg shaped with a white belly and face, like the one in the reference. */
export function Penguin({ position, rotationY = 0 }: PenguinProps) {
  const parts = useDisposable(() => ({
    body: createBodyGeometry(),
    bodyMaterial: new MeshStandardMaterial({ vertexColors: true, roughness: 0.38 }),
    black: new MeshStandardMaterial({ color: BLACK, roughness: 0.38 }),
    eye: new MeshStandardMaterial({ color: '#08080a', roughness: 0.12 }),
    orange: new MeshStandardMaterial({ color: ORANGE, roughness: 0.45 }),
  }));

  return (
    <group position={position} rotation-y={rotationY}>
      <mesh geometry={parts.body} material={parts.bodyMaterial} position-y={BODY.centre} scale={[BODY.x, BODY.y, BODY.z]} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh material={parts.eye} position={onSurface(side * EYE.x, EYE.y, -0.001)}>
            <sphereGeometry args={[0.0042, 16, 12]} />
          </mesh>
          <mesh material={parts.black} position={[side * 0.038, 0.045, -0.002]} rotation-z={side * 0.35} scale={[0.008, 0.028, 0.018]}>
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
          <mesh material={parts.orange} position={[side * 0.014, 0.004, 0.02]} scale={[0.012, 0.005, 0.016]}>
            <sphereGeometry args={[1, 16, 10]} />
          </mesh>
        </group>
      ))}
      <mesh material={parts.orange} position={onSurface(0, 0.064, 0.006)} rotation-x={Math.PI / 2}>
        <coneGeometry args={[0.0068, 0.016, 16]} />
      </mesh>
    </group>
  );
}
