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
