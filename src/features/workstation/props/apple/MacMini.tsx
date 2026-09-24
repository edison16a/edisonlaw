'use client';

import { ShapeGeometry } from 'three';
import { createAppleLogoGeometry } from '../../geometry/appleLogo';
import { roundedRectShape } from '../../geometry/shapes';
import { createSlabGeometry } from '../../geometry/slab';
import { MAC_MINI } from '../../layout';
import { getMaterials } from '../../materials/materials';
import { useDisposable } from '../../useDisposable';

const [WIDTH, HEIGHT, DEPTH] = MAC_MINI.size;
/** The dark foot underneath, set in so the aluminium body seems to float. */
const FOOT = { height: 0.004, inset: 0.016 };
const BODY_HEIGHT = HEIGHT - FOOT.height;
const CORNER = WIDTH * 0.19;

/** Front panel details on the +Z face: USB-C ports and the headphone jack, as x offsets. */
const PORTS = [-0.026, -0.012];
const JACK_X = 0.004;

/** The Mac mini: a softly rounded aluminium square on a dark foot, an Apple logo on top and a status light. */
export function MacMini() {
  const materials = getMaterials();
  const parts = useDisposable(() => ({
    body: createSlabGeometry({ width: WIDTH, depth: DEPTH, height: BODY_HEIGHT, radius: CORNER, bevel: 0.0045, curveSegments: 16 }),
    foot: createSlabGeometry({
      width: WIDTH - FOOT.inset * 2,
      depth: DEPTH - FOOT.inset * 2,
      height: FOOT.height + 0.001,
      radius: CORNER - FOOT.inset,
      bevel: 0.001,
      bevelSegments: 2,
    }),
    logo: createAppleLogoGeometry(0.03),
    port: new ShapeGeometry(roundedRectShape(0.0085, 0.0029, 0.00145), 4),
  }));

  const [x, y, z] = MAC_MINI.position;
  const front = DEPTH / 2 + 0.0002;
  const portY = FOOT.height + BODY_HEIGHT * 0.34;

  return (
    <group position={[x, y, z]} rotation-y={MAC_MINI.rotationY}>
      <mesh geometry={parts.foot} material={materials.blackMatte} />
      <mesh geometry={parts.body} material={materials.silverAluminium} position-y={FOOT.height} />
      <mesh geometry={parts.logo} material={materials.polishedChrome} position-y={HEIGHT + 0.0002} />
      {PORTS.map((portX) => (
        <mesh key={portX} geometry={parts.port} material={materials.blackMatte} position={[portX, portY, front]} />
      ))}
      <mesh material={materials.blackMatte} position={[JACK_X, portY, front]}>
        <circleGeometry args={[0.0017, 16]} />
      </mesh>
      {/* Status light, bottom right of the front. */}
      <mesh position={[WIDTH / 2 - CORNER - 0.004, FOOT.height + BODY_HEIGHT * 0.3, front]}>
        <circleGeometry args={[0.0011, 12]} />
        <meshBasicMaterial color={[2.4, 2.4, 2.4]} toneMapped={false} />
      </mesh>
    </group>
  );
}
