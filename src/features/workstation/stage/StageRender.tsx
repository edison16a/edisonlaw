'use client';

import Image from 'next/image';
import type { StageVariant } from '../types';

/** Describes each scene for screen readers, for both the live canvas and the still image. */
export const STAGE_ALT: Record<StageVariant, string> = {
  work: 'Edison at his desk at night, typing in front of three glowing monitors, with an RGB PC tower beside the desk.',
  about: 'Edison standing beside his desk at night with a mug of coffee, petting his golden retriever and looking at code on his three monitors.',
};

interface StageRenderProps {
  variant: StageVariant;
  onError: () => void;
}

/**
 * Pre-rendered still of the scene. Phones and tablets see only this. On desktop it is the poster
 * the live canvas fades in over.
 */
export function StageRender({ variant, onError }: StageRenderProps) {
  return (
    <Image
      src={`/renders/${variant}.webp`}
      alt={STAGE_ALT[variant]}
      fill
      sizes="(min-width: 1024px) 50vw, 100vw"
      className="object-cover"
      onError={onError}
    />
  );
}
