import { Mesh, MeshBasicMaterial, SkinnedMesh, type Material, type Object3D } from 'three';

/**
 * Fading a whole model in. Every mesh under the root blends in by its material's opacity, and while it
 * does, a depth only twin of each mesh draws first, so only the front surface blends over the room:
 * the far legs never show through the body and the eyes never show the skull behind them.
 */

/** Draws the depth twins after every other opaque object, so they hide nothing that stands behind the model. */
const PREPASS_ORDER = 10;

export interface Fade {
  /** 0 to 1 through the fade. */
  progress: number;
  done: boolean;
  /** Each material under the root, with the opacity it has at full strength. */
  materials: Map<Material, number>;
  twins: Mesh[];
  depth: MeshBasicMaterial;
}

function twinOf(mesh: Mesh, depth: MeshBasicMaterial) {
  if (mesh instanceof SkinnedMesh) {
    const twin = new SkinnedMesh(mesh.geometry, depth);
    twin.bindMode = mesh.bindMode;
    twin.bind(mesh.skeleton, mesh.bindMatrix);
    // Without a sphere of its own, a skinned mesh skins every vertex on the CPU to measure itself.
    twin.boundingSphere = mesh.boundingSphere?.clone() ?? null;
    return twin;
  }
  return new Mesh(mesh.geometry, depth);
}

/**
 * Starts fading in everything under `root`: sets every material to nothing and hangs a depth twin under
 * each mesh that writes depth. The materials must be transparent already, so their shaders never change.
 */
export function startFade(root: Object3D): Fade {
  const depth = new MeshBasicMaterial({ colorWrite: false });
  // Pushed back a hair, so the model's own front surface always passes the depth test after it.
  depth.polygonOffset = true;
  depth.polygonOffsetFactor = 1;
  depth.polygonOffsetUnits = 1;
  const fade: Fade = { progress: 0, done: false, materials: new Map(), twins: [], depth };
  const meshes: Mesh[] = [];
  root.traverse((object) => {
    if (object instanceof Mesh) meshes.push(object);
  });
  for (const mesh of meshes) {
    const material = mesh.material as Material;
    if (!fade.materials.has(material)) fade.materials.set(material, material.opacity);
    if (!material.depthWrite) continue;
    const twin = twinOf(mesh, depth);
    twin.name = `${mesh.name || 'mesh'}Depth`;
    twin.renderOrder = PREPASS_ORDER;
    twin.frustumCulled = mesh.frustumCulled;
    mesh.add(twin);
    fade.twins.push(twin);
  }
  setFade(fade, 0);
  return fade;
}

/** Sets how far in the model has faded, 0 to 1. */
export function setFade(fade: Fade, amount: number) {
  for (const [material, full] of fade.materials) material.opacity = full * amount;
}

/** Ends the fade at full strength: restores every opacity and removes and frees the depth twins. */
export function finishFade(fade: Fade) {
  if (fade.done) return;
  fade.done = true;
  fade.progress = 1;
  setFade(fade, 1);
  for (const twin of fade.twins) twin.removeFromParent();
  fade.twins.length = 0;
  fade.depth.dispose();
}
