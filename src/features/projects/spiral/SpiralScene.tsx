'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { PlaneGeometry, type PerspectiveCamera } from 'three';
import type { Project } from '@/content/types';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { spiralMotion } from '../state/spiralMotion';
import { useSpiralStore, type FocusSnapshot } from '../state/spiralStore';
import { stageMetrics } from '../state/stageMetrics';
import { createCards, updateCard, type CardRuntime } from './cardFrame';
import { cardViewport } from './cardMaterial';
import { readFocus } from './focus';
import { CARD_HEIGHT, CARD_WIDTH } from './geometry';
import { frameCamera } from './lens';
import { isAtRest, stepMotion } from './motionStep';
import { tickDetents } from './ticks';
import { firstIndex, indexFromScroll } from './track';
import { useCardPictures } from './useCardPictures';

export interface SpiralSceneProps {
  projects: Project[];
  /** Card the spiral opens on. */
  startAt: number;
  /** A card facing the camera was clicked. */
  onSelect: (project: number) => void;
  /** The pointer moved onto a card facing the camera, or off every card. */
  onHover: (project: number | null) => void;
}

/** Cards turned further than this from the camera ignore the pointer. */
const MIN_FACING = 0.2;
/** Pointer travel in pixels beyond which a press is a drag, not a click. */
const CLICK_SLOP = 6;
/** Faster than this, in cards per second, the card under a resting pointer changes too quickly to name. */
const HOVER_SPEED = 1.5;

/** The strand of cards and the one frame loop that drives it. */
export function SpiralScene({ projects, startAt, onSelect, onHover }: SpiralSceneProps) {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const invalidate = useThree((state) => state.invalidate);
  const frameloop = useThree((state) => state.frameloop);
  const reducedMotion = useReducedMotion();
  const syncFocus = useSpiralStore((state) => state.syncFocus);
  const count = projects.length;

  const geometry = useMemo(() => new PlaneGeometry(CARD_WIDTH, CARD_HEIGHT, 32, 12), []);
  const [cards] = useState<CardRuntime[]>(() => createCards(count));
  const [focus] = useState<FocusSnapshot>(() => ({ focused: 0, panel: null, settled: null, inIntro: true }));
  const uploadNext = useCardPictures(projects, cards, gl, startAt);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => cards.forEach((card) => card.material.dispose()), [cards]);

  // The canvas only draws while something moves. Scrolling, resizing and the pointer wake it.
  const resting = useRef(false);
  useEffect(() => {
    const wake = () => invalidate();
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', wake);
    return () => {
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', wake);
    };
  }, [invalidate]);
  // Coming back on screen switches the loop on again, which should draw at least once.
  useEffect(() => invalidate(), [frameloop, invalidate]);

  useFrame((state, rawDelta) => {
    // A long pause (a hidden tab, or the canvas resting) should not fling the spiral.
    const delta = resting.current ? 1 / 60 : Math.min(rawDelta, 0.1);
    const previous = spiralMotion.value;
    const target = indexFromScroll(window.scrollY, stageMetrics);
    stepMotion(spiralMotion, target, count, delta, reducedMotion);
    tickDetents(previous, spiralMotion.value, spiralMotion.velocity, performance.now());
    syncFocus(readFocus(spiralMotion.value, spiralMotion.velocity, spiralMotion.settle, count, focus));
    if (spiralMotion.hoverSlot !== null && Math.abs(spiralMotion.velocity) > HOVER_SPEED) {
      spiralMotion.hoverSlot = null;
      onHover(null);
    }
    if (Math.abs(target - firstIndex()) > 0.04 && !useSpiralStore.getState().hasScrolled) {
      useSpiralStore.getState().markScrolled();
    }

    const { focusShift, focusLift } = stageMetrics;
    const engaged = spiralMotion.engaged;
    frameCamera(camera, state.size.width, state.size.height, focusShift * engaged, focusLift * engaged);
    gl.getDrawingBufferSize(cardViewport);
    let busy = uploadNext();
    for (const card of cards) busy = updateCard(card, spiralMotion, cards.length, count, delta, reducedMotion) || busy;
    const hovered = spiralMotion.hoverSlot === null ? null : cards[spiralMotion.hoverSlot];
    if (hovered?.scenery) {
      spiralMotion.hoverSlot = null;
      onHover(null);
    }

    resting.current = !busy && isAtRest(spiralMotion);
    if (!resting.current) state.invalidate();
  });

  const hover = (card: CardRuntime) => (event: ThreeEvent<PointerEvent>) => {
    if (card.facing < MIN_FACING) return;
    event.stopPropagation();
    if (card.scenery) return;
    spiralMotion.hoverSlot = card.slot;
    onHover(card.project);
    invalidate();
  };

  const leave = (card: CardRuntime) => () => {
    if (spiralMotion.hoverSlot !== card.slot) return;
    spiralMotion.hoverSlot = null;
    onHover(null);
    invalidate();
  };

  const select = (card: CardRuntime) => (event: ThreeEvent<MouseEvent>) => {
    if (card.facing < MIN_FACING) return;
    event.stopPropagation();
    if (!card.scenery && event.delta <= CLICK_SLOP) onSelect(card.project);
  };

  return cards.map((card) => (
    <mesh
      key={card.slot}
      ref={(mesh) => {
        card.mesh = mesh;
      }}
      geometry={geometry}
      material={card.material}
      visible={false}
      onPointerOver={hover(card)}
      onPointerOut={leave(card)}
      onClick={select(card)}
    />
  ));
}
