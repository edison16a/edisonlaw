'use client';

import { CircleGeometry, LatheGeometry, TorusGeometry, Vector2 } from 'three';
import { MUG } from '../dimensions';
import { mergeParts } from '../geometry/merge';
import { useGeometry } from '../geometry/useGeometry';
import { useCharacterMaterials } from '../MaterialsContext';

const WALL = 0.0045;
const COFFEE_DEPTH = 0.016;

/** Mug profile: outside from the base up to a rounded rim, then back down the inside. */
function mugBody() {
  const { radius, height } = MUG;
  const points = [
    new Vector2(0.0001, 0),
    new Vector2(radius - 0.006, 0),
    new Vector2(radius - 0.001, 0.002),
    new Vector2(radius, 0.008),
    new Vector2(radius, height - 0.002),
    new Vector2(radius - WALL * 0.3, height + 0.0008),
    new Vector2(radius - WALL * 0.75, height + 0.0006),
    new Vector2(radius - WALL, height - 0.003),
    new Vector2(radius - WALL, WALL * 2),
    new Vector2(0.0001, WALL * 2),
  ];
  return new LatheGeometry(points, 32);
}

/** Mug body and its handle as one piece. The handle is a half ring standing out along +X. */
function mugShell() {
  const handle = new TorusGeometry(0.02, 0.0062, 10, 24, Math.PI)
    .rotateZ(-Math.PI / 2)
    .translate(MUG.radius - 0.003, MUG.height * 0.5, 0);
  return mergeParts([mugBody(), handle]);
}

/** A chunky ceramic mug of coffee. Its base is the origin and it stands along +Y, handle toward +X. */
export function Mug() {
  const materials = useCharacterMaterials();
  const shell = useGeometry(mugShell);
  const coffee = useGeometry(() => new CircleGeometry(MUG.radius - WALL, 32).rotateX(-Math.PI / 2));

  return (
    <group>
      <mesh geometry={shell} material={materials.mug} castShadow receiveShadow />
      <mesh geometry={coffee} material={materials.coffee} position={[0, MUG.height - COFFEE_DEPTH, 0]} />
    </group>
  );
}

/** The mug as held in the right hand: centred in the grip, axis along the thumb, handle turned toward him. */
export function HeldMug() {
  return (
    <group position={[...MUG.centerInHand]} rotation={[0, 0, -Math.PI / 2]}>
      <group rotation={[0, Math.PI * 0.75, 0]} position={[0, -MUG.height / 2, 0]}>
        <Mug />
      </group>
    </group>
  );
}
