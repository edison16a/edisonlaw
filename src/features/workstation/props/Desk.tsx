'use client';

import { CylinderGeometry } from 'three';
import { shearAlongY } from '../geometry/shear';
import { createSlabGeometry } from '../geometry/slab';
import { DESK } from '../layout';
import { useRgbMaterial } from '../lighting/useRgbMaterial';
import { getMaterials } from '../materials/materials';
import { useDisposable } from '../useDisposable';

const LEG = { top: 0.027, bottom: 0.017, insetX: 0.13, insetZ: 0.1, splay: 0.035 };
/** Brass ferrule capping the foot of each leg. */
const FERRULE = { height: 0.045, lip: 0.0016 };
/** Steel plate that screws each leg to the underside of the top. */
const PLATE = { size: 0.075, thickness: 0.005 };
const CORNERS: [number, number][] = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

/**
 * Pale desktop with soft rounded corners and edges, on four splayed wooden legs with brass ferrules.
 * The legs lean by shearing, so they meet the underside flush and stand flat on the floor.
 * An RGB strip along the back edge washes the wall behind.
 */
export function Desk() {
  const materials = getMaterials();
  const strip = useRgbMaterial({ hueOffset: 0.06, intensity: 2.4 });
  const [x, topY, z] = DESK.center;
  const underside = topY - DESK.thickness;
  const legHeight = underside - PLATE.thickness;
  const halfW = DESK.width / 2 - LEG.insetX;
  const halfD = DESK.depth / 2 - LEG.insetZ;
  const backZ = z - DESK.depth / 2;
  const lean = Math.tan(LEG.splay);

  const parts = useDisposable(() => {
    const radiusAt = (y: number) => LEG.bottom + ((LEG.top - LEG.bottom) * y) / legHeight;
    // Each leg is built upright with its foot at the origin, then sheared so the foot reaches outward.
    const legs = CORNERS.map(([sx, sz]) => {
      const leg = new CylinderGeometry(LEG.top, LEG.bottom, legHeight, 28, 1);
      leg.translate(0, legHeight / 2, 0);
      const ferrule = new CylinderGeometry(radiusAt(FERRULE.height) + FERRULE.lip, LEG.bottom + FERRULE.lip, FERRULE.height, 28, 1);
      ferrule.translate(0, FERRULE.height / 2, 0);
      // Top of the leg stays put; the foot moves out by the lean over the leg's height.
      for (const geometry of [leg, ferrule]) {
        geometry.translate(0, -legHeight, 0);
        shearAlongY(geometry, -sx * lean, -sz * lean);
        geometry.translate(0, legHeight, 0);
      }
      return { leg, ferrule };
    });
    return {
      top: createSlabGeometry({ width: DESK.width, depth: DESK.depth, height: DESK.thickness, radius: 0.06, bevel: 0.009, curveSegments: 16, bevelSegments: 5 }),
      legs,
      plate: createSlabGeometry({ width: PLATE.size, depth: PLATE.size, height: PLATE.thickness, radius: 0.008, bevel: 0.0015, bevelSegments: 2 }),
    };
  });

  return (
    <group>
      <mesh geometry={parts.top} material={materials.deskTop} position={[x, underside, z]} />
      {CORNERS.map(([sx, sz], index) => {
        const legX = x + sx * halfW;
        const legZ = z + sz * halfD;
        return (
          <group key={index}>
            <mesh geometry={parts.plate} material={materials.brushedMetal} position={[legX, legHeight, legZ]} />
            <group position={[legX, 0, legZ]}>
              <mesh geometry={parts.legs[index].leg} material={materials.lightWood} />
              <mesh geometry={parts.legs[index].ferrule} material={materials.brass} />
            </group>
          </group>
        );
      })}
      {/* LED strip on the back edge, facing the wall. */}
      <mesh material={strip} position={[x, underside - 0.006, backZ + 0.02]}>
        <boxGeometry args={[DESK.width - 0.3, 0.008, 0.012]} />
      </mesh>
    </group>
  );
}
