import { afterEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEY } from '../config';
import { loadSoundPreference, resolveEnabled, saveSoundPreference } from '../persistence';

describe('resolveEnabled', () => {
  it('starts off when nothing is saved', () => {
    expect(resolveEnabled(null, false)).toBe(false);
  });

  it('follows the saved choice, whatever the motion setting', () => {
    expect(resolveEnabled('on', false)).toBe(true);
    expect(resolveEnabled('on', true)).toBe(true);
    expect(resolveEnabled('off', false)).toBe(false);
  });

  it('ignores values it did not write', () => {
    expect(resolveEnabled('true', false)).toBe(false);
    expect(resolveEnabled('', false)).toBe(false);
  });

  it('keeps reduced motion visitors off even if the default were on', () => {
    expect(resolveEnabled(null, false, true)).toBe(true);
    expect(resolveEnabled(null, true, true)).toBe(false);
  });
});

describe('saved preference', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('round trips through localStorage', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value) },
    });
    expect(loadSoundPreference(false)).toBe(false);
    saveSoundPreference(true);
    expect(store.get(STORAGE_KEY)).toBe('on');
    expect(loadSoundPreference(true)).toBe(true);
    saveSoundPreference(false);
    expect(loadSoundPreference(false)).toBe(false);
  });

  it('falls back to off when storage is blocked', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => {
          throw new Error('blocked');
        },
      },
    });
    expect(loadSoundPreference(false)).toBe(false);
  });
});
