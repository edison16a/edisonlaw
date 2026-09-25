'use client';

import { CanvasTexture, MeshBasicMaterial, PlaneGeometry } from 'three';
import { useDisposable } from '../../useDisposable';
import { TAIL_PATH } from '../anatomy/tail';
import { PAWS } from '../dimensions';

/** Floor area the shadow covers in dog space: X from RIGHT to LEFT, Z from BACK to FRONT. */
const AREA = { right: -0.2, left: 0.34, back: -0.42, front: 0.26 } as const;
/** Just above the rug and the room's baked contact shadow. */
const HEIGHT = 0.021;
const PIXELS_PER_METRE = 640;

/** A soft dark spot, stretched to an ellipse, with its darkest `alpha` in the middle. */
function spot(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, alpha: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, ry / rx);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  gradient.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
  gradient.addColorStop(0.55, `rgba(0, 0, 0, ${alpha * 0.45})`);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
  ctx.restore();
}

/**
 * The dog's own soft contact shadow: a wide pool under the seat and haunches, a darker touch under each
 * paw and hock, and a faint trail under the tail, broad enough to cover its sweep. The room bakes its
 * contact shadows in its first frames, before the dog has finished building, so the dog brings its own
 * to sit on the rug.
 */
function createShadow() {
  const width = Math.round((AREA.left - AREA.right) * PIXELS_PER_METRE);
  const depth = Math.round((AREA.front - AREA.back) * PIXELS_PER_METRE);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = depth;
  const ctx = canvas.getContext('2d');
  // Canvas X runs along dog X, canvas Y from the back of the dog to the front: the plane is laid flat
  // with its top edge toward -Z.
  const toCanvas = (x: number, z: number): [number, number] => [(x - AREA.right) * PIXELS_PER_METRE, (z - AREA.back) * PIXELS_PER_METRE];
  const metres = (value: number) => value * PIXELS_PER_METRE;
  if (ctx) {
    spot(ctx, ...toCanvas(0, -0.06), metres(0.17), metres(0.22), 0.46);
    for (const [x, z] of TAIL_PATH.slice(2)) spot(ctx, ...toCanvas(x, z), metres(0.05), metres(0.05), 0.2);
    for (const side of [1, -1]) {
      for (const [x, z] of [PAWS.front, PAWS.rear]) spot(ctx, ...toCanvas(x * side, z), metres(0.05), metres(0.058), 0.5);
      spot(ctx, ...toCanvas(PAWS.hock[0] * side, PAWS.hock[1]), metres(0.045), metres(0.06), 0.4);
    }
  }
  const texture = new CanvasTexture(canvas);
  const material = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false });
  const geometry = new PlaneGeometry(AREA.left - AREA.right, AREA.front - AREA.back);
  return { texture, material, geometry };
}

export function Shadow() {
  const { material, geometry } = useDisposable(createShadow);
  return (
    <mesh
      geometry={geometry}
      material={material}
      rotation-x={-Math.PI / 2}
      position={[(AREA.left + AREA.right) / 2, HEIGHT, (AREA.front + AREA.back) / 2]}
      renderOrder={-1}
    />
  );
}
