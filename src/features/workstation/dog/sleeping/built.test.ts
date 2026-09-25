import { Matrix4, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { earShapes } from '../anatomy/ear';
import { headForms, headFur } from '../anatomy/head';
import { neckForms, neckFur } from '../anatomy/neck';
import { tailForms } from '../anatomy/tail';
import { PART_COUNT } from '../dimensions';
import { buildDogData } from '../geometry/dogData';
import { openEdges, skinCoat } from '../geometry/meshChecks';
import { meshPart } from '../geometry/partGeometry';
import { Field, transformShapes } from '../sdf/field';
import { bib, torsoForms } from './body';
import { SLEEPING_NECK } from './coat';
import { headRestMatrix } from './headPose';
import { britches, legForms } from './legs';
import { applySleepPose, createSleepPose, sleepPose } from './pose';
import { createSleepingRig, SLEEP_BONE, SLEEP_TAIL_BONES, SLEEPING_COAT_BOUNDS } from './rig';
import { SLEEPING_TAIL, sleepingTailFur } from './tail';
import { SLEEP_SEED } from './useSleepingMotion';

const headToDog = headRestMatrix();
const head = new Field([...transformShapes(headForms(), headToDog), ...transformShapes(headFur(), headToDog)], PART_COUNT);
const neck = new Field([...neckForms(headToDog, SLEEPING_NECK), ...neckFur(headToDog, SLEEPING_NECK)], PART_COUNT);
const legs = new Field([...legForms(), ...britches()], PART_COUNT);
/** Everything that stays put while it sleeps, and the tail at rest. */
const body = new Field([...torsoForms(), ...legForms(), ...bib(), ...britches(), ...tailForms(SLEEPING_TAIL), ...sleepingTailFur()], PART_COUNT);

/** Two minutes of the idle, every half second: several look ups and wags. */
const idle = Array.from({ length: 240 }, (_, i) => i * 0.5);

function throughIdle(visit: (rig: ReturnType<typeof createSleepingRig>, t: number) => void) {
  const rig = createSleepingRig();
  const pose = createSleepPose();
  for (const t of idle) {
    applySleepPose(rig, sleepPose(t, 1, SLEEP_SEED, pose));
    rig.root.updateMatrixWorld(true);
    visit(rig, t);
  }
}

describe('the built sleeping dog', () => {
  // Full detail, as the page builds it: slow, but the only way to catch a pinch in the real sculpture.
  const { coat } = buildDogData('sleeping');
  const count = coat.positions.length / 3;

  it('meshes the coat as one closed surface, with no holes or pinches', () => {
    expect(count).toBeGreaterThan(20000);
    expect(openEdges(coat.indices)).toBe(0);
  });

  it('gives every vertex bone weights that add up to one', () => {
    for (let n = 0; n < count; n++) {
      let total = 0;
      for (let slot = 0; slot < 4; slot++) {
        total += coat.skinWeights[n * 4 + slot];
        expect(coat.skinIndices[n * 4 + slot]).toBeLessThan(SLEEP_BONE.tail + SLEEP_TAIL_BONES);
      }
      expect(total).toBeCloseTo(1, 5);
    }
  });

  it('lets only the head and neck follow the head, so the rest stays curled when it looks up', () => {
    const point = new Vector3();
    for (let n = 0; n < count; n++) {
      let onHead = 0;
      for (let slot = 0; slot < 4; slot++) if (coat.skinIndices[n * 4 + slot] === SLEEP_BONE.head) onHead += coat.skinWeights[n * 4 + slot];
      // Enough to move it noticeably when the head lifts.
      if (onHead < 0.05) continue;
      point.fromArray(coat.positions, n * 3);
      const near = Math.min(head.distance(point.x, point.y, point.z), neck.distance(point.x, point.y, point.z));
      expect(near).toBeLessThan(0.035);
    }
  });

  it('stays inside its culling bounds through the idle', () => {
    throughIdle((rig) => skinCoat(coat, rig, 5, (posed) => expect(posed.distanceTo(SLEEPING_COAT_BOUNDS.center)).toBeLessThan(SLEEPING_COAT_BOUNDS.radius - 0.02)));
  }, 60000);

  it('swishes its tail along the floor, clear of its legs and its face', () => {
    // The part of the tail lying on the floor, from its third joint on.
    const onFloor = (n: number) => coat.skinIndices[n * 4] >= SLEEP_BONE.tail + 2;
    let checked = 0;
    throughIdle((rig) =>
      skinCoat(coat, rig, 1, (posed, n) => {
        if (!onFloor(n)) return;
        checked++;
        expect(posed.y).toBeGreaterThan(-0.004);
        expect(legs.distance(posed.x, posed.y, posed.z)).toBeGreaterThan(0.01);
        expect(head.distance(posed.x, posed.y, posed.z)).toBeGreaterThan(0.012);
      }),
    );
    expect(checked / idle.length).toBeGreaterThan(500);
  }, 60000);

  it('lifts and turns its head clear of its tail and body through the idle', () => {
    const skull = new Field([...headForms(), ...headFur()], PART_COUNT);
    const dogToHead = headToDog.clone().invert();
    const rest = new Vector3();
    const toHead = new Matrix4();
    const inHead = new Vector3();
    // The face: head vertices well in front of the skull's back, where the neck joins.
    const face: number[] = [];
    for (let n = 0; n < count; n++) {
      if (coat.skinIndices[n * 4] !== SLEEP_BONE.head || coat.skinWeights[n * 4] < 0.99) continue;
      if (rest.fromArray(coat.positions, n * 3).applyMatrix4(dogToHead).z > 0.03) face.push(n);
    }
    const onFace = new Set(face);
    const onTail = (n: number) => coat.skinIndices[n * 4] >= SLEEP_BONE.tail + 1;
    expect(face.length).toBeGreaterThan(1000);
    throughIdle((rig) => {
      toHead.makeTranslation(-rig.headOrigin.x, -rig.headOrigin.y, -rig.headOrigin.z).multiply(rig.head.matrixWorld.clone().invert());
      const scale = rig.head.matrixWorld.getMaxScaleOnAxis();
      skinCoat(coat, rig, 1, (posed, n) => {
        if (onTail(n)) {
          inHead.copy(posed).applyMatrix4(toHead);
          expect(skull.distance(inHead.x, inHead.y, inHead.z) * scale).toBeGreaterThan(0.012);
        } else if (onFace.has(n)) expect(body.distance(posed.x, posed.y, posed.z)).toBeGreaterThan(0.01);
      });
    });
  }, 120000);

  it('hangs its ears clear of its head, its body, its tail and the floor through the idle', () => {
    // Coarser than the page builds them, which only thickens the flap a little: a fair test.
    const ear = meshPart(new Field(earShapes(), PART_COUNT), 0.004, true);
    const skull = new Field([...headForms(), ...headFur()], PART_COUNT);
    const toHead = new Matrix4();
    const fromBone = new Matrix4();
    const point = new Vector3();
    throughIdle((rig) => {
      fromBone.makeTranslation(-rig.headOrigin.x, -rig.headOrigin.y, -rig.headOrigin.z);
      for (const [index, side] of [
        [0, 1],
        [1, -1],
      ] as const) {
        toHead.copy(rig.head.matrixWorld).invert().multiply(rig.ears[index].matrixWorld).premultiply(fromBone);
        for (let n = 0; n < ear.positions.length; n += 9) {
          point.fromArray(ear.positions, n);
          point.x *= side;
          const inDog = point.clone().applyMatrix4(rig.ears[index].matrixWorld);
          expect(inDog.y).toBeGreaterThan(0.012);
          expect(body.distance(inDog.x, inDog.y, inDog.z)).toBeGreaterThan(0.002);
          // The fold at the top is meant to sit in the skull.
          if (point.y > -0.035) continue;
          point.applyMatrix4(toHead);
          expect(skull.distance(point.x, point.y, point.z)).toBeGreaterThan(-0.001);
        }
      }
    });
  }, 120000);
});
