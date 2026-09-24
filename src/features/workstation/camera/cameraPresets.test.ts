import { describe, expect, it } from 'vitest';
import type { StageVariant } from '../types';
import { CAMERA_FRAMINGS, createResolvedShot, resolveShot } from './cameraPresets';

const VARIANTS: StageVariant[] = ['work', 'about'];
const halfWidth = (fov: number, aspect: number) => Math.tan((fov * Math.PI) / 360) * aspect;

describe('resolveShot', () => {
  it.each(VARIANTS)('returns the tuned shots at their own aspects for %s', (variant) => {
    const framing = CAMERA_FRAMINGS[variant];
    const [portraitAspect, landscapeAspect] = framing.aspects;
    const portrait = resolveShot(framing, portraitAspect, createResolvedShot());
    expect(portrait.position.toArray()).toEqual(framing.portrait.position);
    expect(portrait.fov).toBeCloseTo(framing.portrait.fov);
    const landscape = resolveShot(framing, landscapeAspect, createResolvedShot());
    expect(landscape.target.toArray()).toEqual(framing.landscape.target);
    expect(landscape.fov).toBeCloseTo(framing.landscape.fov);
  });

  it.each(VARIANTS)('keeps the portrait width on taller panels for %s', (variant) => {
    const framing = CAMERA_FRAMINGS[variant];
    const [portraitAspect] = framing.aspects;
    const tall = resolveShot(framing, portraitAspect * 0.8, createResolvedShot());
    expect(halfWidth(tall.fov, portraitAspect * 0.8)).toBeCloseTo(halfWidth(framing.portrait.fov, portraitAspect));
  });
});
