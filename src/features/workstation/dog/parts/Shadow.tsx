'use client';

import { CanvasTexture, MeshBasicMaterial, PlaneGeometry } from 'three';
import { useDisposable } from '../../useDisposable';
import { PAWS } from '../dimensions';

/** Floor area the shadow covers in dog space: X from -HALF_WIDTH, Z from BACK to FRONT. */
const AREA = { halfWidth: 0.2, back: -0.36, front: 0.3 } as const;
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
 * The dog's own soft contact shadow: a wide pool under the body and a darker touch under each paw.
 * The room bakes its contact shadows in its first frames, before the dog has finished building,
 * so the dog brings its own to sit on the rug.
 */
function createShadow() {
  const width = Math.round(AREA.halfWidth * 2 * PIXELS_PER_METRE);
  const depth = Math.round((AREA.front - AREA.back) * PIXELS_PER_METRE);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = depth;
  const ctx = canvas.getContext('2d');
  // Canvas X runs along dog X, canvas Y from the back of the dog to the front: the plane is laid flat
  // with its top edge toward -Z.
  const toCanvas = (x: number, z: number): [number, number] => [(x + AREA.halfWidth) * PIXELS_PER_METRE, (z - AREA.back) * PIXELS_PER_METRE];
  if (ctx) {
    spot(ctx, ...toCanvas(0, -0.01), 0.13 * PIXELS_PER_METRE, 0.27 * PIXELS_PER_METRE, 0.42);
    for (const [x, z] of [PAWS.front, PAWS.rear]) {
      for (const side of [1, -1]) spot(ctx, ...toCanvas(x * side, z), 0.05 * PIXELS_PER_METRE, 0.058 * PIXELS_PER_METRE, 0.5);
    }
  }
  const texture = new CanvasTexture(canvas);
  const material = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false });
  const geometry = new PlaneGeometry(AREA.halfWidth * 2, AREA.front - AREA.back);
  return { texture, material, geometry };
}

export function Shadow() {
  const { material, geometry } = useDisposable(createShadow);
  return (
    <mesh
      geometry={geometry}
      material={material}
      rotation-x={-Math.PI / 2}
      position={[0, HEIGHT, (AREA.front + AREA.back) / 2]}
      renderOrder={-1}
    />
  );
}
