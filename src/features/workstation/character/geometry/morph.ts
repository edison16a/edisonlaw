import { Float32BufferAttribute, type BufferGeometry } from 'three';

function difference(target: BufferGeometry, base: BufferGeometry, name: 'position' | 'normal') {
  const from = base.getAttribute(name);
  const to = target.getAttribute(name);
  if (to.count !== from.count) throw new Error('Blend shapes need the same vertex layout as their base.');
  const values = new Float32Array(from.count * 3);
  for (let i = 0; i < from.count; i++) {
    values[i * 3] = to.getX(i) - from.getX(i);
    values[i * 3 + 1] = to.getY(i) - from.getY(i);
    values[i * 3 + 2] = to.getZ(i) - from.getZ(i);
  }
  return new Float32BufferAttribute(values, 3);
}

/**
 * Stores each target as a relative blend shape of `base`, in order, and frees the targets.
 * A null target adds a blend shape that leaves this geometry alone, so parts with different
 * shapes can still be merged into one mesh.
 */
export function addBlendShapes(base: BufferGeometry, targets: (BufferGeometry | null)[]) {
  const count = base.getAttribute('position').count;
  const still = () => new Float32BufferAttribute(new Float32Array(count * 3), 3);
  base.morphTargetsRelative = true;
  base.morphAttributes.position = targets.map((target) => (target ? difference(target, base, 'position') : still()));
  base.morphAttributes.normal = targets.map((target) => (target ? difference(target, base, 'normal') : still()));
  for (const target of targets) target?.dispose();
  return base;
}
