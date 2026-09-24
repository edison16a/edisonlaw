import type { Mesh } from 'three';
import { clamp, smoothstep } from '@/lib/math';
import type { CardPicture } from '../media/cardPicture';
import type { SpiralMotion } from '../state/spiralMotion';
import { cardBend, cardBow, cardBrightness } from './appearance';
import { createCardMaterial, type CardMaterial, type CardUniforms } from './cardMaterial';
import { cardPose, createPose, SPIRAL, slotOffset } from './geometry';
import { createSwap, requestSwap, stepSwap, type PictureSwap } from './pictureSwap';

/** Everything one card on the strand keeps between frames. */
export interface CardRuntime {
  slot: number;
  /** Index of the project this card shows. */
  project: number;
  material: CardMaterial;
  mesh: Mesh | null;
  /** The picture on the card, and the crossfade to another one. */
  swap: PictureSwap<CardPicture>;
  /** Seconds since the first picture reached the GPU, or -1 while it is on its way. */
  shownFor: number;
  /** Distance from the continuous index this frame, in cards, so a click knows where the card sits. */
  offset: number;
}

/** Seconds a card takes to fade in once its picture is ready. */
const FADE_IN = 0.7;
/** Seconds a crossfade to another picture takes. Short, so picking a screenshot feels immediate. */
const SWAP_TIME = 0.28;
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
    swap: createSwap<CardPicture>(),
    shownFor: -1,
    offset: 0,
  }));
}

/** True once the card in the focus slot has its picture and has begun to fade in. */
export function focusCardShown(cards: CardRuntime[]) {
  return cards.some((card) => card.shownFor >= 0 && Math.abs(card.offset) < 0.5);
}

/**
 * Asks the card to show `picture`. The first one fades the card in, and any
 * later one crossfades over what it shows.
 */
export function showPicture(card: CardRuntime, picture: CardPicture) {
  if (card.shownFor < 0) card.shownFor = 0;
  requestSwap(card.swap, picture);
}

function writePictures(uniforms: CardUniforms, { current, next, blend }: PictureSwap<CardPicture>) {
  if (current) {
    uniforms.uMap.value = current.texture;
    uniforms.uImageAspect.value = current.aspect;
    uniforms.uFlipY.value = current.flipY ? 1 : 0;
  }
  uniforms.uMapNext.value = next?.texture ?? null;
  if (next) {
    uniforms.uNextAspect.value = next.aspect;
    uniforms.uNextFlipY.value = next.flipY ? 1 : 0;
  }
  uniforms.uBlend.value = next ? smoothstep(0, 1, blend) : 0;
}

/**
 * Places one card for this frame and writes its uniforms. `calm` drops the
 * speed effects for visitors who prefer reduced motion. Returns true while the
 * card is still fading in or crossfading, so the canvas knows to draw another frame.
 */
export function updateCard(card: CardRuntime, motion: SpiralMotion, slots: number, delta: number, calm: boolean): boolean {
  const mesh = card.mesh;
  if (!mesh) return false;

  const offset = slotOffset(card.slot, motion.value, slots);
  card.offset = offset;
  // Cards rise into place in four small waves on the way in.
  const stagger = (card.slot % 4) * ((1 - RISE) / 3);
  const rise = clamp((motion.reveal - stagger) / RISE);
  const hidden = 1 - rise * (2 - rise);
  cardPose(offset, motion.settle, hidden, pose);

  if (card.shownFor >= 0) card.shownFor += delta;
  const swapping = stepSwap(card.swap, delta, SWAP_TIME);
  const fading = (card.shownFor >= 0 && card.shownFor < FADE_IN) || swapping;
  const opacity = smoothstep(0, FADE_IN, card.shownFor) * rise;
  mesh.visible = opacity > 0.001 && Math.abs(offset) < VISIBLE_RANGE;
  if (!mesh.visible) return fading;

  mesh.position.set(pose.x, pose.y, pose.z);
  mesh.rotation.y = pose.rotationY;
  mesh.scale.setScalar(pose.scale);

  const velocity = calm ? 0 : motion.velocity;
  const uniforms = card.material.uniforms;
  uniforms.uCurvature.value = cardBend(velocity, pose.focus) / SPIRAL.radius;
  uniforms.uBow.value = cardBow(velocity, pose.focus);
  uniforms.uFlat.value = pose.focus;
  uniforms.uBrightness.value = cardBrightness(offset, motion.settle);
  uniforms.uOpacity.value = opacity;
  writePictures(uniforms, card.swap);
  return fading;
}
