import { describe, expect, it } from 'vitest';
import { CALM_GAP, MIN_SPACING, SOFTEST, createMoveSound, runVolume } from './moveSound';

interface Played {
  at: number;
  volume: number;
}

/**
 * Plays out a view that heads for `heading(t)` and sits at `position(t)`, read
 * every 16 ms frame from 0 to `until`, and returns every sound it played.
 */
function run(position: (t: number) => number, heading: (t: number) => number, until: number) {
  const played: Played[] = [];
  let now = 0;
  const sound = createMoveSound((volume) => played.push({ at: now, volume }));
  for (now = 0; now <= until; now += 16) sound.track(position(now), heading(now), now);
  return played;
}

/** A view that cruises at `speed` projects per second from 0 toward `to`, then stays there. */
const cruise = (to: number, speed: number) => (t: number) => Math.min(to, (t / 1000) * speed);

const gapsOf = (played: Played[]) => played.slice(1).map((sound, i) => sound.at - played[i].at);

describe('createMoveSound', () => {
  it('stays quiet where the view opens and while it rests', () => {
    expect(run(() => 4, () => 4, 1000)).toEqual([]);
  });

  it('sounds at once for a press from rest', () => {
    expect(run((t) => (t < 100 ? 0 : 1), () => 1, 500)).toEqual([{ at: 0, volume: 1 }]);
  });

  it('sounds once for every project a held key passes', () => {
    // A held key turns the spiral at its top speed of five projects a second, eight projects on.
    const played = run(cruise(8, 5), (t) => Math.min(8, Math.floor((t / 1000) * 5) + 1), 3000);
    expect(played).toHaveLength(8);
    for (const gap of gapsOf(played)) expect(gap).toBeGreaterThanOrEqual(180);
  });

  it('sounds once per notch for five quick wheel notches', () => {
    // Five notches 40 ms apart queue five projects up, which the spiral then turns through.
    expect(run(cruise(5, 5), (t) => Math.min(5, Math.floor(t / 40) + 1), 2000)).toHaveLength(5);
  });

  it('plays a long click jump as a quick soft run, one sound per project passed', () => {
    const played = run(cruise(6, 12), () => 6, 1500);
    expect(played).toHaveLength(6);
    expect(played[0].volume).toBe(1);
    for (const { volume } of played.slice(1)) expect(volume).toBeLessThan(1);
  });

  it('never drops a sound when the view outruns the spacing, it plays them out at that pace', () => {
    // The view lands six projects on in a single frame, as it does for reduced motion.
    const played = run((t) => (t === 0 ? 0 : 6), () => 6, 1000);
    expect(played).toHaveLength(6);
    for (const gap of gapsOf(played)) expect(gap).toBeGreaterThanOrEqual(MIN_SPACING);
  });

  it('keeps asking to be called while projects wait to sound', () => {
    const sound = createMoveSound(() => undefined);
    sound.track(0, 0, 0);
    expect(sound.pending()).toBe(false);
    sound.track(0, 3, 100);
    expect(sound.pending()).toBe(true);
    for (const now of [200, 300, 400]) sound.track(3, 3, now);
    expect(sound.pending()).toBe(false);
  });

  it('sounds again at once when the view turns back', () => {
    const played = run((t) => (t < 200 ? t / 1000 : 0.2), (t) => (t < 200 ? 1 : 0), 600);
    expect(played.map(({ at }) => at)).toEqual([0, 208]);
  });
});

describe('runVolume', () => {
  it('plays calm moves at full volume and quick ones softer, but never below the floor', () => {
    expect(runVolume(Infinity)).toBe(1);
    expect(runVolume(CALM_GAP)).toBe(1);
    expect(runVolume(200)).toBeLessThan(1);
    expect(runVolume(200)).toBeGreaterThan(SOFTEST);
    expect(runVolume(MIN_SPACING)).toBe(SOFTEST);
    expect(runVolume(0)).toBe(SOFTEST);
  });
});
