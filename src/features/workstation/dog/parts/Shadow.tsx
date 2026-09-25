'use client';

import { CanvasTexture, MeshBasicMaterial, PlaneGeometry } from 'three';
import { useDisposable } from '../../useDisposable';

/** A soft dark spot on the floor, in dog space: its centre, its half sizes along X and Z, and its darkest alpha. */
export interface ShadowSpot {
  x: number;
  z: number;
  rx: number;
  rz: number;
  alpha: number;
}

/** Where a pose meets the floor: the area its shadow covers in dog space, and the spots it is drawn from. */
export interface ShadowLayout {
  /** X from `right` to `left`, Z from `back` to `front`. */
  area: { right: number; left: number; back: number; front: number };
  spots: readonly ShadowSpot[];
}

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

function createShadow({ area, spots }: ShadowLayout) {
  const width = Math.round((area.left - area.right) * PIXELS_PER_METRE);
  const depth = Math.round((area.front - area.back) * PIXELS_PER_METRE);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = depth;
  const ctx = canvas.getContext('2d');
  // Canvas X runs along dog X, canvas Y from the back of the dog to the front: the plane is laid flat
  // with its top edge toward -Z.
  const metres = (value: number) => value * PIXELS_PER_METRE;
  if (ctx) {
    for (const { x, z, rx, rz, alpha } of spots) spot(ctx, metres(x - area.right), metres(z - area.back), metres(rx), metres(rz), alpha);
  }
  const texture = new CanvasTexture(canvas);
  const material = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false });
  const geometry = new PlaneGeometry(area.left - area.right, area.front - area.back);
  return { texture, material, geometry };
}

/**
 * The dog's own soft contact shadow, drawn from its pose's spots. The room bakes its contact shadows in
 * its first frames, before the dog has finished building, so the dog brings its own to lie on the rug.
 */
export function Shadow({ layout }: { layout: ShadowLayout }) {
  const { material, geometry } = useDisposable(() => createShadow(layout));
  const { area } = layout;
  return (
    <mesh
      geometry={geometry}
      material={material}
      rotation-x={-Math.PI / 2}
      position={[(area.left + area.right) / 2, HEIGHT, (area.front + area.back) / 2]}
      renderOrder={-1}
    />
  );
}
