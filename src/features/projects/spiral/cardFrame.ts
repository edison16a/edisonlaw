import type { Mesh } from 'three';
import { clamp, damp, smoothstep } from '@/lib/math';
import type { CardPicture } from '../media/cardPicture';
import type { SpiralMotion } from '../state/spiralMotion';
import { cardBend, cardBlur, cardBow, cardBrightness, cardStreak } from './appearance';
import { createCardMaterial, type CardMaterial } from './cardMaterial';
import { cardPose, createPose, SPIRAL, slotOffset } from './geometry';

/** Everything one card on the strand keeps between frames. */
export interface CardRuntime {
  slot: number;
  /** Index of the project this card shows. */
  project: number;
  material: CardMaterial;
  mesh: Mesh | null;
  hover: number;
  /** Seconds since the picture reached the GPU, or -1 while it is on its way. */
  shownFor: number;
  /** Mirrors the pose so pointer handlers can ignore cards turned away. */
  facing: number;
}

/** Seconds a card takes to fade in once its picture is ready. */
const FADE_IN = 0.7;
/** Cards further than this from the slot are out of frame and skip drawing. */
const VISIBLE_RANGE = 8.5;
/** Share of the entrance each card spends rising, the rest is its stagger. */
const RISE = 0.7;

const pose = createPose();

/** How many cards the strand holds: each project repeated until it is full. */
export function slotCount(projects: number) {
  if (projects < 1) return 0;
  return projects * Math.max(1, Math.round(SPIRAL.slots / projects));
}

export function createCards(projects: number): CardRuntime[] {
  return Array.from({ length: slotCount(projects) }, (_, slot) => ({
    slot,
    project: slot % projects,
    material: createCardMaterial(),
    mesh: null,
    hover: 0,
    shownFor: -1,
    facing: 0,
  }));
}

/** Points the card at its picture and starts the fade in. */
export function showPicture(card: CardRuntime, picture: CardPicture) {
  const uniforms = card.material.uniforms;
  uniforms.uMap.value = picture.texture;
  uniforms.uImageAspect.value = picture.aspect;
  uniforms.uFlipY.value = picture.flipY ? 1 : 0;
  card.shownFor = 0;
}

/**
 * Places one card for this frame and writes its uniforms. `calm` drops the
 * speed effects for visitors who prefer reduced motion.
 */
export function updateCard(card: CardRuntime, motion: SpiralMotion, slots: number, delta: number, calm: boolean) {
  const mesh = card.mesh;
  if (!mesh) return;

  const offset = slotOffset(card.slot, motion.value, slots);
  // Cards rise into place in four small waves on the way in.
  const stagger = (card.slot % 4) * ((1 - RISE) / 3);
  const rise = clamp((motion.reveal - stagger) / RISE);
  const hidden = 1 - rise * (2 - rise);
  cardPose(offset, motion.settle, hidden, pose);
  card.facing = pose.facing;

  if (card.shownFor >= 0) card.shownFor += delta;
  const opacity = smoothstep(0, FADE_IN, card.shownFor) * rise;
  mesh.visible = opacity > 0.001 && Math.abs(offset) < VISIBLE_RANGE;
  if (!mesh.visible) return;

  mesh.position.set(pose.x, pose.y, pose.z);
  mesh.rotation.y = pose.rotationY;
  mesh.scale.setScalar(pose.scale);

  const velocity = calm ? 0 : motion.velocity;
  card.hover = damp(card.hover, motion.hoverSlot === card.slot ? 1 : 0, 10, delta);

  const uniforms = card.material.uniforms;
  uniforms.uCurvature.value = cardBend(velocity, pose.focus) / SPIRAL.radius;
  uniforms.uBow.value = cardBow(velocity);
  uniforms.uBlur.value = cardBlur(offset, motion.settle);
  uniforms.uStreak.value = cardStreak(velocity);
  uniforms.uBrightness.value = cardBrightness(offset, motion.settle);
  uniforms.uOpacity.value = opacity;
  uniforms.uHover.value = card.hover;
}
