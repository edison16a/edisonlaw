import type { Texture, WebGLRenderer } from 'three';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CardPicture } from './cardPicture';
import { loadCardPicture } from './cardPicture';
import { createPictureBank } from './pictureBank';

/** Loads that have started and not landed yet, by picture. The test lands each one by hand. */
const { pending } = vi.hoisted(() => ({ pending: new Map<string, (picture: CardPicture) => void>() }));

vi.mock('./cardPicture', () => ({
  loadCardPicture: vi.fn((src: string) => new Promise<CardPicture>((resolve) => pending.set(src, resolve))),
}));

function fakeGl() {
  return { capabilities: { getMaxAnisotropy: () => 8 }, initTexture: vi.fn() };
}

/** Lands the load of `src` with a made up picture, and lets the bank take it. */
async function land(src: string) {
  const picture = { texture: { name: src } as Texture, aspect: 1.6, flipY: false, dispose: vi.fn() };
  pending.get(src)?.(picture);
  await new Promise((resolve) => setTimeout(resolve, 0));
  return picture;
}

describe('createPictureBank', () => {
  beforeEach(() => {
    pending.clear();
    vi.mocked(loadCardPicture).mockClear();
  });

  it('loads each picture once, however often it is asked for', () => {
    const bank = createPictureBank(fakeGl() as unknown as WebGLRenderer, () => {});
    bank.request('a.webp');
    bank.request('b.webp');
    bank.request('a.webp');
    expect(vi.mocked(loadCardPicture).mock.calls).toEqual([
      ['a.webp', 8],
      ['b.webp', 8],
    ]);
  });

  it('puts one arrival on the GPU per call, in the order they landed, before cards get it', async () => {
    const gl = fakeGl();
    const onArrive = vi.fn();
    const bank = createPictureBank(gl as unknown as WebGLRenderer, onArrive);
    ['a.webp', 'b.webp', 'c.webp'].forEach(bank.request);
    const c = await land('c.webp');
    const a = await land('a.webp');
    expect(onArrive).toHaveBeenCalledTimes(2);
    expect(bank.ready('c.webp')).toBeUndefined();

    expect(bank.uploadNext()).toBe(true);
    expect(gl.initTexture).toHaveBeenLastCalledWith(c.texture);
    expect(bank.ready('c.webp')).toBe(c);
    expect(bank.ready('a.webp')).toBeUndefined();

    expect(bank.uploadNext()).toBe(false);
    expect(bank.ready('a.webp')).toBe(a);
    expect(bank.uploadNext()).toBe(false);
    expect(gl.initTexture).toHaveBeenCalledTimes(2);
  });

  it('frees every picture on dispose, uploaded or still waiting', async () => {
    const bank = createPictureBank(fakeGl() as unknown as WebGLRenderer, () => {});
    ['a.webp', 'b.webp'].forEach(bank.request);
    const a = await land('a.webp');
    const b = await land('b.webp');
    bank.uploadNext();
    bank.dispose();
    expect(a.dispose).toHaveBeenCalledOnce();
    expect(b.dispose).toHaveBeenCalledOnce();
    expect(bank.ready('a.webp')).toBeUndefined();
    expect(bank.uploadNext()).toBe(false);
  });

  it('frees a picture that lands after dispose and never uploads it', async () => {
    const gl = fakeGl();
    const onArrive = vi.fn();
    const bank = createPictureBank(gl as unknown as WebGLRenderer, onArrive);
    bank.request('late.webp');
    bank.dispose();
    const late = await land('late.webp');
    expect(late.dispose).toHaveBeenCalledOnce();
    expect(onArrive).not.toHaveBeenCalled();
    expect(bank.uploadNext()).toBe(false);
    expect(gl.initTexture).not.toHaveBeenCalled();
    expect(bank.ready('late.webp')).toBeUndefined();
  });

  it('starts no new loads once disposed', () => {
    const bank = createPictureBank(fakeGl() as unknown as WebGLRenderer, () => {});
    bank.dispose();
    bank.request('a.webp');
    expect(loadCardPicture).not.toHaveBeenCalled();
  });
});
