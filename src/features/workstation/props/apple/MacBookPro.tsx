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
/** The lid rests open by this angle, just enough for a thin dark gap at the front. */
const OPEN_ANGLE = 0.055;
/** The hinge axis sits this far in from the back edge. */
const HINGE_INSET = 0.0055;

/**
 * Space grey MacBook Pro below the monitors with its lid folded almost shut: a thin wedge of dark gap at
 * the front, the black hinge along the back and the polished Apple logo on the lid. The logo faces the
 * back of the lid, so from the front of the desk it reads upside down, as on a real closed MacBook.
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
  const inner = { width: SIZE.width - 0.014, depth: SIZE.depth - 0.016 };

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
      {/* Keyboard well and the black hinge cover, seen only through the gap. */}
      <mesh material={materials.blackMatte} position={[0, baseTop + 0.0002, 0.012]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[inner.width - 0.03, inner.depth * 0.6]} />
      </mesh>
      <mesh material={materials.blackMatte} position={[0, baseTop + 0.0005, hingeZ + 0.001]} rotation-z={Math.PI / 2}>
        <capsuleGeometry args={[0.0042, SIZE.width * 0.74, 6, 16]} />
      </mesh>

      {/* The lid turns about the hinge at the back and rests almost shut. */}
      <group position={[0, baseTop + 0.0012, hingeZ]} rotation-x={-OPEN_ANGLE}>
        <group position-z={SIZE.depth / 2 - HINGE_INSET}>
          <mesh geometry={parts.lid} material={materials.spaceGrey} />
          {/* The display side of the lid: black glass inside a thin bezel. */}
          <mesh material={materials.blackGlass} position-y={-0.0002} rotation-x={Math.PI / 2}>
            <planeGeometry args={[inner.width, inner.depth]} />
          </mesh>
          <mesh geometry={parts.logo} material={materials.polishedChrome} position-y={LID_HEIGHT + 0.0002} rotation-y={Math.PI} />
        </group>
      </group>
    </group>
  );
}
