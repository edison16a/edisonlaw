'use client';

import { CatmullRomCurve3, LatheGeometry, MeshStandardMaterial, SplineCurve, TubeGeometry, Vector2, Vector3 } from 'three';
import type { Vec3 } from '../../layout';
import { getMaterials } from '../../materials/materials';
import { useDisposable } from '../../useDisposable';

const HEIGHT = 0.088;
const RADIUS = 0.035;
const WALL = 0.0035;
/** Coffee level inside the mug. */
const COFFEE = 0.064;

/**
 * Smooth mug profile, bottom centre to rim and back down the inside, sampled from a spline so the foot,
 * the belly and the rounded lip all read as one ceramic surface.
 */
function createBodyGeometry() {
  const outside = new SplineCurve([
    new Vector2(0.0, 0.0),
    new Vector2(RADIUS - 0.004, 0.0),
    new Vector2(RADIUS - 0.0005, 0.004),
    new Vector2(RADIUS, 0.02),
    new Vector2(RADIUS + 0.0008, HEIGHT - 0.012),
    new Vector2(RADIUS + 0.0004, HEIGHT - 0.002),
  ]).getPoints(28);
  const lip = [new Vector2(RADIUS - WALL / 2, HEIGHT + 0.0006), new Vector2(RADIUS - WALL, HEIGHT - 0.002)];
  const inside = [new Vector2(RADIUS - WALL, 0.012), new Vector2(RADIUS - WALL - 0.004, 0.0085), new Vector2(0, 0.008)];
  return new LatheGeometry([...outside, ...lip, ...inside], 48);
}

/** C shaped handle on the +X side, joining the body near the top and the bottom. */
function createHandleGeometry() {
  const curve = new CatmullRomCurve3([
    new Vector3(RADIUS - 0.002, HEIGHT * 0.78, 0),
    new Vector3(RADIUS + 0.014, HEIGHT * 0.8, 0),
    new Vector3(RADIUS + 0.022, HEIGHT * 0.58, 0),
    new Vector3(RADIUS + 0.017, HEIGHT * 0.34, 0),
    new Vector3(RADIUS - 0.002, HEIGHT * 0.28, 0),
  ]);
  return new TubeGeometry(curve, 40, 0.0045, 12);
}

/** Coffee mug, half full, with a smooth ceramic body and a proper handle. */
export function Mug({ position, rotationY = 0 }: { position: Vec3; rotationY?: number }) {
  const materials = getMaterials();
  const parts = useDisposable(() => ({
    body: createBodyGeometry(),
    handle: createHandleGeometry(),
    coffee: new MeshStandardMaterial({ color: '#2a170c', roughness: 0.12 }),
  }));

  return (
    <group position={position} rotation-y={rotationY}>
      <mesh geometry={parts.body} material={materials.whitePlastic} />
      <mesh geometry={parts.handle} material={materials.whitePlastic} />
      <mesh material={parts.coffee} position-y={COFFEE} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[RADIUS - WALL + 0.0003, 36]} />
      </mesh>
    </group>
  );
}
