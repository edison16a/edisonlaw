'use client';

import { CylinderGeometry, LatheGeometry, MeshStandardMaterial, Vector2 } from 'three';
import type { Vec3 } from '../../layout';
import { useDisposable } from '../../useDisposable';

const WOOD = '#e8cfa6';
const GRAPHITE = '#2a2a2e';
/** Cup profile: outside up to the rolled rim, then down the inside to the floor, as radius and height pairs. */
const CUP: [number, number][] = [
  [0, 0],
  [0.027, 0],
  [0.029, 0.002],
  [0.0305, 0.03],
  [0.032, 0.086],
  [0.0322, 0.0895],
  [0.0305, 0.0905],
  [0.029, 0.088],
  [0.0275, 0.03],
  [0.0255, 0.007],
  [0, 0.007],
];

/** Pencils: body colour, lean around X, lean around Z, length of the painted body. */
const PENCILS: [string, number, number, number][] = [
  ['#5a8fd6', 0.12, 0.18, 0.13],
  ['#d6575b', -0.1, -0.14, 0.12],
  ['#e0b84a', 0.16, -0.04, 0.11],
];
const PENCIL_RADIUS = 0.0042;
const TIP = { wood: 0.012, lead: 0.0035 };

/** Rounded ceramic pencil cup with three hexagonal pencils sharpened to a graphite point. */
export function PencilCup({ position }: { position: Vec3 }) {
  const parts = useDisposable(() => {
    const woodCone = new CylinderGeometry(PENCIL_RADIUS * 0.3, PENCIL_RADIUS, TIP.wood, 6);
    woodCone.translate(0, TIP.wood / 2, 0);
    const lead = new CylinderGeometry(0, PENCIL_RADIUS * 0.3, TIP.lead, 6);
    lead.translate(0, TIP.wood + TIP.lead / 2, 0);
    return {
      cup: new LatheGeometry(CUP.map(([r, y]) => new Vector2(r, y)), 40),
      cupMaterial: new MeshStandardMaterial({ color: '#c9b79c', roughness: 0.55 }),
      bodies: PENCILS.map(([, , , length]) => {
        const body = new CylinderGeometry(PENCIL_RADIUS, PENCIL_RADIUS, length, 6);
        body.translate(0, length / 2, 0);
        return body;
      }),
      paints: PENCILS.map(([color]) => new MeshStandardMaterial({ color, roughness: 0.45, flatShading: true })),
      woodCone,
      lead,
      wood: new MeshStandardMaterial({ color: WOOD, roughness: 0.7, flatShading: true }),
      graphite: new MeshStandardMaterial({ color: GRAPHITE, roughness: 0.35, metalness: 0.3 }),
    };
  });

  return (
    <group position={position}>
      <mesh geometry={parts.cup} material={parts.cupMaterial} />
      {PENCILS.map(([color, leanX, leanZ, length], index) => (
        <group key={color} position-y={0.008} rotation={[leanX, index * 0.7, leanZ]}>
          <mesh geometry={parts.bodies[index]} material={parts.paints[index]} />
          <group position-y={length}>
            <mesh geometry={parts.woodCone} material={parts.wood} />
            <mesh geometry={parts.lead} material={parts.graphite} />
          </group>
        </group>
      ))}
    </group>
  );
}
