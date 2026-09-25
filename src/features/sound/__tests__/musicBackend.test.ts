import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MUSIC_LOOP, MUSIC_URL } from '../musicTrack';

/** Just enough of a Howl to follow what the music backend asks of it. */
class FakeHowl {
  static last: FakeHowl;
  calls: string[] = [];
  level = 1;
  playingNow = false;
  private handlers = new Map<string, (id: number) => void>();

  constructor(readonly options: { src: string[]; sprite: Record<string, [number, number, boolean]> }) {
    FakeHowl.last = this;
  }
  once(event: string, handler: () => void) {
    if (event === 'load') queueMicrotask(handler);
  }
  on(event: string, handler: (id: number) => void) {
    this.handlers.set(event, handler);
  }
  play(what: string | number) {
    this.calls.push(`play ${what}`);
    this.playingNow = true;
    return 7;
  }
  pause(id: number) {
    this.calls.push(`pause ${id}`);
    this.playingNow = false;
  }
  playing() {
    return this.playingNow;
  }
  volume(value?: number) {
    if (value === undefined) return this.level;
    this.level = value;
  }
  fade(from: number, to: number, duration: number, id: number) {
    this.calls.push(`fade ${from} to ${to} over ${duration} on ${id}`);
    this.level = to;
  }
  /** Howler emits this once a fade has run its course. */
  endFade() {
    this.handlers.get('fade')?.(7);
  }
}

vi.mock('howler', () => ({ Howl: FakeHowl, Howler: { volume: vi.fn() } }));

const { createMusicBackend } = await import('../backend/musicBackend');

describe('createMusicBackend', () => {
  let howl: FakeHowl;
  let music: Awaited<ReturnType<typeof createMusicBackend>>;

  beforeEach(async () => {
    music = await createMusicBackend();
    howl = FakeHowl.last;
  });

  it('loads its own file and loops only the seamless lap inside it', () => {
    expect(howl.options.src).toEqual([MUSIC_URL]);
    expect(howl.options.sprite.lap).toEqual([MUSIC_LOOP.start, MUSIC_LOOP.duration, true]);
  });

  it('starts silent and fades up to the level asked for', () => {
    music.fadeTo(0.09, 2000);
    expect(howl.calls).toEqual(['play lap', 'fade 0 to 0.09 over 2000 on 7']);
  });

  it('pauses once a fade to silence ends, and resumes where it stopped', () => {
    music.fadeTo(0.09, 2000);
    music.fadeTo(0, 250);
    expect(howl.calls).not.toContain('pause 7');
    howl.endFade();
    expect(howl.calls).toContain('pause 7');
    music.fadeTo(0.09, 2000);
    expect(howl.calls.slice(-2)).toEqual(['play 7', 'fade 0 to 0.09 over 2000 on 7']);
  });

  it('keeps playing when a fade out is reversed before it ends', () => {
    music.fadeTo(0.09, 2000);
    music.fadeTo(0, 1200);
    music.fadeTo(0.09, 2000);
    howl.endFade();
    expect(howl.calls).not.toContain('pause 7');
  });

  it('ignores a repeat of the level it already heads for', () => {
    music.fadeTo(0.09, 2000);
    music.fadeTo(0.09, 2000);
    expect(howl.calls).toHaveLength(2);
  });
});
