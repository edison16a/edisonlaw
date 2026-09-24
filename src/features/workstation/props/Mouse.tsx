'use client';

import { MeshPhysicalMaterial, SphereGeometry } from 'three';
import { DESK_MAT, MOUSE } from '../layout';
import { getMaterials } from '../materials/materials';
import { useDisposable } from '../useDisposable';

const LENGTH = 0.11;
const WIDTH = 0.062;
/** Highest point of the shell, over the palm toward the back. Low enough for the cupped seated hand. */
const HEIGHT = 0.026;
/** Depth of the flattened underside below the shell's widest line. */
const FLAT_BOTTOM = 0.004;

/**
 * Sculpts a sphere into a mouse shell: flat underneath, narrower at the buttons (-Z) and rising to a
 * rounded hump under the palm near the back.
 */
function createShellGeometry() {
  const geometry = new SphereGeometry(1, 64, 40);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    // -1 at the buttons, +1 at the back.
    const along = z;
    const width = (WIDTH / 2) * (1 - 0.1 * Math.max(0, -along));
    const hump = HEIGHT * (0.72 + 0.28 * Math.exp(-(((along - 0.25) / 0.7) ** 2)));
    position.setXYZ(i, x * width, y > 0 ? y * hump : y * FLAT_BOTTOM, z * (LENGTH / 2));
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** Rounded mouse with a soft sheen, a dark scroll wheel in its slot, sitting flat on the mat. */
export function Mouse() {
  const materials = getMaterials();
  const parts = useDisposable(() => ({
    shell: createShellGeometry(),
    material: new MeshPhysicalMaterial({ color: '#dcdce0', roughness: 0.34, clearcoat: 0.6, clearcoatRoughness: 0.28 }),
  }));
  const [x, , z] = MOUSE.position;

  return (
    <group position={[x, DESK_MAT.center[1] + FLAT_BOTTOM, z]} rotation-y={0.12}>
      <mesh geometry={parts.shell} material={parts.material} />
      <mesh material={materials.darkPlastic} position={[0, HEIGHT * 0.78, -LENGTH * 0.22]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.0062, 0.0062, 0.0045, 20]} />
      </mesh>
    </group>
  );
}
