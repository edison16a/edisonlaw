import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MUSIC_FADE_IN_MS, MUSIC_FADE_OUT_MS, MUSIC_HIDE_FADE_MS, MUSIC_VOLUME } from '../config';

const effects = { play: vi.fn() };
const music = { fadeTo: vi.fn() };
vi.mock('../backend/howlerBackend', () => ({ createHowlerBackend: () => Promise.resolve(effects) }));
vi.mock('../backend/musicBackend', () => ({ createMusicBackend: () => Promise.resolve(music) }));

/** Lets the lazy imports and loads settle. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

async function freshEngine() {
  vi.resetModules();
  return import('../engine');
}

beforeEach(() => {
  effects.play.mockClear();
  music.fadeTo.mockClear();
});

describe('the sound engine', () => {
  it('starts the music and confirms with a click when sound is turned on', async () => {
    const { sound } = await freshEngine();
    sound.setEnabled(true);
    await settle();
    expect(music.fadeTo).toHaveBeenCalledWith(MUSIC_VOLUME, MUSIC_FADE_IN_MS);
    expect(effects.play).toHaveBeenCalledWith('toggle', expect.any(Number), expect.any(Number));
  });

  it('plays nothing, music included, until sound is turned on', async () => {
    const { sound, soundLifecycle } = await freshEngine();
    soundLifecycle.unlock();
    sound.play('move');
    await settle();
    expect(music.fadeTo).not.toHaveBeenCalled();
    expect(effects.play).not.toHaveBeenCalled();
  });

  it('pauses the music while the tab is hidden and brings it back after', async () => {
    const { sound, soundLifecycle } = await freshEngine();
    sound.setEnabled(true);
    await settle();
    soundLifecycle.setVisible(false);
    expect(music.fadeTo).toHaveBeenLastCalledWith(0, MUSIC_HIDE_FADE_MS);
    soundLifecycle.setVisible(true);
    expect(music.fadeTo).toHaveBeenLastCalledWith(MUSIC_VOLUME, MUSIC_FADE_IN_MS);
  });

  it('fades the music out when sound is turned off', async () => {
    const { sound } = await freshEngine();
    sound.setEnabled(true);
    await settle();
    sound.setEnabled(false);
    expect(music.fadeTo).toHaveBeenLastCalledWith(0, MUSIC_FADE_OUT_MS);
  });

  it('plays the music for a visitor whose saved choice was on, from their first gesture', async () => {
    const { soundLifecycle } = await freshEngine();
    soundLifecycle.restore(true);
    await settle();
    expect(music.fadeTo).not.toHaveBeenCalled();
    soundLifecycle.unlock();
    await settle();
    expect(music.fadeTo).toHaveBeenCalledWith(MUSIC_VOLUME, MUSIC_FADE_IN_MS);
  });
});
