import { Bone, BoxGeometry, Group, Mesh, MeshBasicMaterial, Skeleton, SkinnedMesh } from 'three';
import { describe, expect, it } from 'vitest';
import { finishFade, setFade, startFade } from './fade';

function model() {
  const root = new Group();
  const solid = new Mesh(new BoxGeometry(), new MeshBasicMaterial({ transparent: true, opacity: 0.8 }));
  const bone = new Bone();
  const skinned = new SkinnedMesh(new BoxGeometry(), new MeshBasicMaterial({ transparent: true }));
  skinned.add(bone);
  skinned.bind(new Skeleton([bone]));
  const decal = new Mesh(new BoxGeometry(), new MeshBasicMaterial({ transparent: true, depthWrite: false }));
  root.add(solid, skinned, decal);
  return { root, solid, skinned, decal };
}

describe('fade', () => {
  it('starts from nothing with a depth twin under every mesh that writes depth', () => {
    const { root, solid, skinned, decal } = model();
    const fade = startFade(root);
    for (const mesh of [solid, skinned, decal]) expect((mesh.material as MeshBasicMaterial).opacity).toBe(0);
    expect(fade.twins).toHaveLength(2);
    expect(decal.children).toHaveLength(0);
    const skinnedTwin = skinned.children.find((child) => child instanceof SkinnedMesh) as SkinnedMesh;
    expect(skinnedTwin.skeleton).toBe(skinned.skeleton);
    expect(skinnedTwin.geometry).toBe(skinned.geometry);
    for (const twin of fade.twins) {
      expect(twin.material).toBe(fade.depth);
      expect(twin.renderOrder).toBeGreaterThan(0);
    }
    expect(fade.depth.colorWrite).toBe(false);
  });

  it('scales each material from its own full opacity', () => {
    const { root, solid, skinned } = model();
    const fade = startFade(root);
    setFade(fade, 0.5);
    expect((solid.material as MeshBasicMaterial).opacity).toBeCloseTo(0.4);
    expect((skinned.material as MeshBasicMaterial).opacity).toBeCloseTo(0.5);
  });

  it('finishes at full strength with the twins gone, once', () => {
    const { root, solid, skinned } = model();
    const fade = startFade(root);
    finishFade(fade);
    expect((solid.material as MeshBasicMaterial).opacity).toBeCloseTo(0.8);
    expect((skinned.material as MeshBasicMaterial).opacity).toBe(1);
    expect(solid.children).toHaveLength(0);
    expect(skinned.children.filter((child) => child instanceof Mesh)).toHaveLength(0);
    expect(fade.done).toBe(true);
    finishFade(fade);
    expect((solid.material as MeshBasicMaterial).opacity).toBeCloseTo(0.8);
  });
});
