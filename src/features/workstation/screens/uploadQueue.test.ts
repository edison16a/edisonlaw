import { describe, expect, it } from 'vitest';
import { createUploadTicket, UploadQueue } from './uploadQueue';

describe('UploadQueue', () => {
  it('gives out one upload per frame', () => {
    const queue = new UploadQueue();
    const a = createUploadTicket();
    const b = createUploadTicket();
    queue.request(a);
    queue.request(b);
    queue.nextFrame();
    expect(queue.take(a)).toBe(true);
    expect(queue.take(b)).toBe(false);
    queue.nextFrame();
    expect(queue.take(b)).toBe(true);
    expect(queue.isWaiting(a)).toBe(false);
    expect(queue.isWaiting(b)).toBe(false);
  });

  it('serves the oldest change first even when a newer one asks first', () => {
    const queue = new UploadQueue();
    const a = createUploadTicket();
    const b = createUploadTicket();
    queue.request(a);
    queue.request(b);
    queue.nextFrame();
    expect(queue.take(a)).toBe(true);
    expect(queue.take(b)).toBe(false);
    // A changes again and now waits behind B.
    queue.request(a);
    queue.nextFrame();
    expect(queue.take(a)).toBe(false);
    expect(queue.take(b)).toBe(true);
    queue.nextFrame();
    expect(queue.take(a)).toBe(true);
  });

  it('stops waiting on an older change whose stage stopped drawing', () => {
    const queue = new UploadQueue();
    const first = createUploadTicket();
    const stalled = createUploadTicket();
    const live = createUploadTicket();
    queue.request(first);
    queue.request(stalled);
    queue.request(live);
    queue.nextFrame();
    expect(queue.take(first)).toBe(true);
    expect(queue.take(stalled)).toBe(false);
    expect(queue.take(live)).toBe(false);
    // The stalled ticket's stage stops drawing, so it never asks again.
    queue.nextFrame();
    expect(queue.take(live)).toBe(false);
    queue.nextFrame();
    expect(queue.take(live)).toBe(true);
    expect(queue.isWaiting(stalled)).toBe(true);
  });

  it('keeps a waiting ticket in its place when it changes again', () => {
    const queue = new UploadQueue();
    const a = createUploadTicket();
    const b = createUploadTicket();
    queue.request(a);
    queue.request(b);
    queue.nextFrame();
    expect(queue.take(b)).toBe(true);
    expect(queue.take(a)).toBe(false);
    queue.request(b);
    queue.request(a);
    queue.nextFrame();
    expect(queue.take(b)).toBe(false);
    expect(queue.take(a)).toBe(true);
  });

  it('drops cancelled tickets', () => {
    const queue = new UploadQueue();
    const a = createUploadTicket();
    queue.request(a);
    queue.cancel(a);
    expect(queue.isWaiting(a)).toBe(false);
  });
});
