'use client';

import { createAppleLogoGeometry } from '../../geometry/appleLogo';
import { createSlabGeometry } from '../../geometry/slab';
import { MACBOOK } from '../../layout';
import { getMaterials } from '../../materials/materials';
import { useDisposable } from '../../useDisposable';

/** A 14 inch MacBook Pro, in metres. */
const SIZE = { width: 0.3122, depth: 0.2212, radius: 0.011 };
const BASE_HEIGHT = 0.0092;
const LID_HEIGHT = 0.0058;
/** Rubber feet lift the base this far off the desk. */
const FEET = 0.0012;
/** The closed lid rests this far above the base, a hairline seam all round like the real one. */
const SEAM = 0.0005;
/** The hinge axis sits this far in from the back edge. */
const HINGE_INSET = 0.0055;

/**
 * Space grey MacBook Pro below the monitors with its lid shut flat: a hairline seam between lid and base,
 * the black hinge along the back and the polished Apple logo on the lid. The logo faces the back of the
 * lid, so from the front of the desk it reads upside down, as on a real closed MacBook.
 */
export function MacBookPro() {
  const materials = getMaterials();
  const parts = useDisposable(() => ({
    base: createSlabGeometry({ ...SIZE, height: BASE_HEIGHT, bevel: 0.0022 }),
    lid: createSlabGeometry({ ...SIZE, height: LID_HEIGHT, bevel: 0.0018 }),
    logo: createAppleLogoGeometry(0.046),
  }));

  const baseTop = FEET + BASE_HEIGHT;
  const hingeZ = -SIZE.depth / 2 + HINGE_INSET;

  return (
    <group position={MACBOOK.position} rotation-y={MACBOOK.rotationY}>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh
            key={`${sx}${sz}`}
            material={materials.rubber}
            position={[sx * (SIZE.width / 2 - 0.022), FEET / 2, sz * (SIZE.depth / 2 - 0.022)]}
          >
            <cylinderGeometry args={[0.0065, 0.0065, FEET, 16]} />
          </mesh>
        )),
      )}
      <mesh geometry={parts.base} material={materials.spaceGrey} position-y={FEET} />
      {/* The black hinge cover along the back. */}
      <mesh material={materials.blackMatte} position={[0, baseTop + 0.0005, hingeZ + 0.001]} rotation-z={Math.PI / 2}>
        <capsuleGeometry args={[0.0042, SIZE.width * 0.74, 6, 16]} />
      </mesh>

      {/* The lid lies flat on the base, all the way shut. */}
      <group position-y={baseTop + SEAM}>
        <mesh geometry={parts.lid} material={materials.spaceGrey} />
        <mesh geometry={parts.logo} material={materials.polishedChrome} position-y={LID_HEIGHT + 0.0002} rotation-y={Math.PI} />
      </group>
    </group>
  );
}
