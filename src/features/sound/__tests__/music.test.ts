import { describe, expect, it, vi } from 'vitest';
import type { MusicBackend } from '../backend/types';
import { MUSIC_FADE_IN_MS, MUSIC_FADE_OUT_MS, MUSIC_HIDE_FADE_MS, MUSIC_VOLUME } from '../config';
import { createMusic, type MusicState } from '../music';

/** A music controller with a fake player whose load the test finishes by hand. */
function setup() {
  const fades: [volume: number, duration: number][] = [];
  const backend: MusicBackend = { fadeTo: (volume, duration) => fades.push([volume, duration]) };
  let finish: (backend: MusicBackend) => void = () => undefined;
  const load = vi.fn(() => new Promise<MusicBackend>((resolve) => (finish = resolve)));
  const music = createMusic(load);
  const loaded = async () => {
    finish(backend);
    await Promise.resolve();
    await Promise.resolve();
  };
  return { music, load, fades, loaded };
}

const on: MusicState = { enabled: true, visible: true, unlocked: true };

describe('createMusic', () => {
  it('loads nothing while sound is off or audio is still locked', () => {
    const { music, load } = setup();
    music.sync({ ...on, enabled: false });
    music.sync({ ...on, unlocked: false });
    expect(load).not.toHaveBeenCalled();
  });

  it('loads once sound is on, and swells in over about two seconds', async () => {
    const { music, load, fades, loaded } = setup();
    music.sync(on);
    music.sync(on);
    expect(load).toHaveBeenCalledTimes(1);
    await loaded();
    expect(fades).toEqual([[MUSIC_VOLUME, MUSIC_FADE_IN_MS]]);
    expect(MUSIC_FADE_IN_MS).toBeGreaterThanOrEqual(1500);
    expect(MUSIC_FADE_IN_MS).toBeLessThanOrEqual(2500);
  });

  it('fades out when sound goes off, and back in when it comes on', async () => {
    const { music, fades, loaded } = setup();
    music.sync(on);
    await loaded();
    music.sync({ ...on, enabled: false });
    music.sync(on);
    expect(fades.slice(1)).toEqual([
      [0, MUSIC_FADE_OUT_MS],
      [MUSIC_VOLUME, MUSIC_FADE_IN_MS],
    ]);
  });

  it('pauses quickly while the tab is hidden and resumes when it shows again', async () => {
    const { music, fades, loaded } = setup();
    music.sync(on);
    await loaded();
    music.sync({ ...on, visible: false });
    music.sync(on);
    expect(fades.slice(1)).toEqual([
      [0, MUSIC_HIDE_FADE_MS],
      [MUSIC_VOLUME, MUSIC_FADE_IN_MS],
    ]);
  });

  it('stays silent if sound goes off while the track is still loading', async () => {
    const { music, fades, loaded } = setup();
    music.sync(on);
    music.sync({ ...on, enabled: false });
    await loaded();
    expect(fades.every(([volume]) => volume === 0)).toBe(true);
  });

  it('tries again the next time sound turns on after a failed load', async () => {
    const load = vi.fn(() => Promise.reject(new Error('offline')));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const music = createMusic(load);
    music.sync(on);
    await new Promise((resolve) => setTimeout(resolve, 0));
    music.sync({ ...on, enabled: false });
    music.sync(on);
    expect(load).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });
});
