import { describe, expect, it } from 'vitest';
import { applySleepPose, createSleepPose, sleepPose, type SleepPose } from './pose';
import { createSleepingRig } from './rig';
import { SLEEP_SEED } from './useSleepingMotion';

/** Every value in a pose with the most it may change in one frame at 60 fps: slow and soft, never a snap. */
function values(pose: SleepPose): [number, number][] {
  return [
    // Breath is a normalised cycle rather than an angle.
    [pose.breath, 0.03],
    [pose.lift, 0.02],
    // The head turns once it is up, as a slow and gentle turn, never a snap.
    [pose.look.yaw, 0.02],
    [pose.look.pitch, 0.012],
    // A slow sleepy blink takes about a third of a second to close.
    [pose.lids, 0.06],
    ...pose.ears.flatMap((ear): [number, number][] => [
      [ear.out, 0.04],
      [ear.forward, 0.02],
    ]),
    ...pose.tail.map((swing): [number, number] => [swing, 0.012]),
    ...pose.tailLift.map((lift): [number, number] => [lift, 0.008]),
  ];
}

const plain = (pose: SleepPose) => values(pose).map(([value]) => value + 0);

/** Samples the idle over ten minutes. */
function sample(visit: (pose: SleepPose, t: number) => void) {
  const pose = createSleepPose();
  for (let t = 0; t < 600; t += 0.1) visit(sleepPose(t, 1, SLEEP_SEED, pose), t);
}

describe('sleepPose', () => {
  it('holds one calm sleeping pose when motion is off, eyes shut and head down', () => {
    const first = sleepPose(0, 0, SLEEP_SEED, createSleepPose());
    expect(first.lids).toBe(1);
    expect(first.lift).toBe(0);
    for (const t of [1.3, 7.9, 42, 300]) expect(plain(sleepPose(t, 0, SLEEP_SEED, createSleepPose()))).toEqual(plain(first));
  });

  it('moves slowly and smoothly, with no pops between frames', () => {
    const a = createSleepPose();
    const b = createSleepPose();
    for (let t = 0; t < 200; t += 0.05) {
      const before = values(sleepPose(t, 1, SLEEP_SEED, a));
      const after = values(sleepPose(t + 1 / 60, 1, SLEEP_SEED, b));
      before.forEach(([value, limit], index) => expect(Math.abs(after[index][0] - value)).toBeLessThan(limit));
    }
  });

  it('sleeps with its eyes shut most of the time, and now and then looks up with sleepy eyes', () => {
    let shut = 0;
    let looks = 0;
    let wasUp = false;
    let widest = 1;
    sample((pose) => {
      if (pose.lids > 0.9) shut++;
      const up = pose.lift > 0.9;
      if (up && !wasUp) looks++;
      wasUp = up;
      widest = Math.min(widest, pose.lids);
    });
    expect(shut / 6000).toBeGreaterThan(0.75);
    expect(looks).toBeGreaterThan(8);
    // Never wide awake: the lids always cover some of the eye.
    expect(widest).toBeGreaterThan(0.35);
  });

  it('stays sound asleep through its first spell, when the room first comes into view', () => {
    const pose = createSleepPose();
    for (let t = 0; t < 20; t += 0.1) {
      sleepPose(t, 1, SLEEP_SEED, pose);
      expect(pose.lift).toBe(0);
      expect(pose.lids).toBeGreaterThan(0.9);
    }
  });

  it('only ever opens its eyes while its head is up', () => {
    sample((pose) => {
      if (pose.lids < 0.85) expect(pose.lift).toBeGreaterThan(0.8);
    });
  });

  it('now and then swishes and thumps its tail out across the floor, never in toward its face', () => {
    let wags = 0;
    let wasWagging = false;
    sample((pose) => {
      for (const swing of pose.tail) {
        expect(swing).toBeGreaterThanOrEqual(0);
        expect(swing).toBeLessThan(0.15);
      }
      // It lifts off the floor a little as it swishes, never up into the air.
      for (const lift of pose.tailLift) {
        expect(lift).toBeGreaterThanOrEqual(0);
        expect(lift).toBeLessThan(0.1);
      }
      const wagging = pose.tail[3] > 0.02;
      if (wagging && !wasWagging) wags++;
      wasWagging = wagging;
    });
    expect(wags).toBeGreaterThan(20);
  });

  it('puts out the catch lights in its eyes while the lids are shut, and lights them when it looks up', () => {
    const rig = createSleepingRig();
    applySleepPose(rig, sleepPose(0, 0, SLEEP_SEED, createSleepPose()));
    expect(rig.shines.map((shine) => shine.visible)).toEqual([false, false]);
    let lit = false;
    sample((pose) => {
      applySleepPose(rig, pose);
      expect(rig.shines[0].visible).toBe(pose.lids < 0.8);
      lit ||= rig.shines[0].visible;
    });
    expect(lit).toBe(true);
  });

  it('shows only the line of each shut eye while it sleeps, and the eye itself once it opens', () => {
    const rig = createSleepingRig();
    applySleepPose(rig, sleepPose(0, 0, SLEEP_SEED, createSleepPose()));
    expect(rig.eyes.map((eye) => eye.visible)).toEqual([false, false]);
    expect(rig.creases.map((crease) => crease.visible)).toEqual([true, true]);
    let opened = false;
    sample((pose) => {
      applySleepPose(rig, pose);
      for (let side = 0; side < 2; side++) {
        const eye = rig.eyes[side];
        // Always the eye or its line, never both and never neither.
        expect(rig.creases[side].visible).toBe(!eye.visible);
        // It only gives way to its line once it has settled nearly flush into the face, and has all its depth back open.
        if (!eye.visible) expect(eye.scale.z).toBeLessThan(0.6);
        if (pose.lids < 0.6) expect(eye.scale.z).toBe(1);
      }
      opened ||= rig.eyes[0].visible && pose.lids < 0.5;
    });
    expect(opened).toBe(true);
  });

  it('keeps the head in the curl, lifting only a little', () => {
    const rig = createSleepingRig();
    const rest = rig.head.position.clone();
    sample((pose) => {
      applySleepPose(rig, pose);
      expect(rig.head.position.distanceTo(rest)).toBeLessThan(0.04);
      expect(rig.head.position.y).toBeGreaterThanOrEqual(rest.y - 1e-9);
    });
  });
});
