'use client';

import { getImageProps } from 'next/image';
import type { StageVariant } from '../types';

/** Describes each scene for screen readers, for both the live canvas and the still image. */
export const STAGE_ALT: Record<StageVariant, string> = {
  work: 'Edison at his desk at night, typing in front of three glowing monitors, with an RGB PC tower beside the desk.',
  about: 'Edison standing beside his desk at night with a mug of coffee, petting his golden retriever and looking at code on his three monitors.',
};

/** Tailwind's lg breakpoint, where the stage stops being a 4:3 box and fills half the screen beside the text. */
const DESKTOP_MEDIA = '(min-width: 1024px)';

interface StageRenderProps {
  variant: StageVariant;
  onError: () => void;
}

/**
 * Pre-rendered still of the scene. Phones and tablets see only this. On desktop it is the poster
 * the live canvas fades in over. Each layout gets a still framed for its own shape (see
 * scripts/capture-renders.mjs), so phones see the whole room and the desktop poster lines up with
 * the canvas that replaces it.
 */
export function StageRender({ variant, onError }: StageRenderProps) {
  const alt = STAGE_ALT[variant];
  const desktop = getImageProps({ alt, fill: true, sizes: '50vw', src: `/renders/${variant}-desktop.webp` }).props;
  const phone = getImageProps({ alt, fill: true, sizes: '100vw', src: `/renders/${variant}.webp` }).props;

  return (
    <picture>
      <source media={DESKTOP_MEDIA} srcSet={desktop.srcSet} sizes={desktop.sizes} />
      {/* The phone still is the fallback, and its img carries the fill styling for both. */}
      <img {...phone} alt={alt} className="object-cover" onError={onError} />
    </picture>
  );
}
