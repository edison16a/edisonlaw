'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { PlaneGeometry, type PerspectiveCamera } from 'three';
import type { Project } from '@/content/types';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { spiralMotion } from '../state/spiralMotion';
import { useSpiralStore, type FocusSnapshot } from '../state/spiralStore';
import { onSpiralWake } from '../state/spiralWake';
import { stageMetrics } from '../state/stageMetrics';
import { createCards, focusCardShown, updateCard, type CardRuntime } from './cardFrame';
import { bentCardRaycast } from './cardHit';
import { cardViewport } from './cardMaterial';
import { readFocus } from './focus';
import { CARD_HEIGHT, CARD_WIDTH } from './geometry';
import { frameCamera } from './lens';
import { createPointerCursor } from './pointerCursor';
import { isAtRest, stepMotion } from './motionStep';
import { tickDetents } from './ticks';
import { useCardPictures } from './useCardPictures';

export interface SpiralSceneProps {
  projects: Project[];
  /** Project whose picture loads first. */
  startAt: number;
  /** A card was clicked. Receives the card's place on the looping index. */
  onSelect: (index: number) => void;
}

/** Pointer travel in pixels beyond which a press is a swipe, not a click. */
const CLICK_SLOP = 6;

/**
 * The strand of cards and the one frame loop that drives it. A click on any
 * card in sight, near or far, turns the spiral straight to it. The card in
 * front wins where cards overlap.
 */
export function SpiralScene({ projects, startAt, onSelect }: SpiralSceneProps) {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const invalidate = useThree((state) => state.invalidate);
  const frameloop = useThree((state) => state.frameloop);
  const reducedMotion = useReducedMotion();
  const syncFocus = useSpiralStore((state) => state.syncFocus);
  const markReady = useSpiralStore((state) => state.markReady);
  const resetSpiral = useSpiralStore((state) => state.resetSpiral);
  const count = projects.length;

  const geometry = useMemo(() => new PlaneGeometry(CARD_WIDTH, CARD_HEIGHT, 32, 12), []);
  const [cards] = useState<CardRuntime[]>(() => createCards(count));
  const [focus] = useState<FocusSnapshot>(() => ({ panel: null, settled: null }));
  const handOutPictures = useCardPictures(projects, cards, gl, startAt);
  const [cursor] = useState(createPointerCursor);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => cards.forEach((card) => card.material.dispose()), [cards]);
  // A stage that comes back later mounts a new canvas, whose controls wait for its own first card.
  useEffect(() => resetSpiral, [resetSpiral]);

  // The canvas only draws while something moves. Input and resizes wake it.
  const resting = useRef(false);
  useEffect(() => onSpiralWake(() => invalidate()), [invalidate]);
  // Coming back on screen switches the loop on again, which should draw at least once.
  useEffect(() => invalidate(), [frameloop, invalidate]);
  // A screenshot picked in the row swaps the focused card's picture.
  useEffect(
    () =>
      useSpiralStore.subscribe((state, previous) => {
        if (state.gallery !== previous.gallery) invalidate();
      }),
    [invalidate],
  );

  useFrame((state, rawDelta) => {
    // A long pause (a hidden tab, or the canvas resting) should not fling the spiral.
    const delta = resting.current ? 1 / 60 : Math.min(rawDelta, 0.1);
    const previous = spiralMotion.value;
    stepMotion(spiralMotion, delta, reducedMotion);
    tickDetents(previous, spiralMotion.value, spiralMotion.velocity, performance.now());
    const { value, velocity, settle } = spiralMotion;
    syncFocus(readFocus(value, velocity, settle, count, focus));

    frameCamera(camera, state.size.width, state.size.height, stageMetrics.focusShift, stageMetrics.focusLift);
    gl.getDrawingBufferSize(cardViewport);
    let busy = handOutPictures(value, focus.panel, useSpiralStore.getState().gallery);
    for (const card of cards) busy = updateCard(card, spiralMotion, cards.length, delta, reducedMotion) || busy;
    if (focusCardShown(cards)) markReady();
    cursor.update(velocity, gl.domElement);

    resting.current = !busy && isAtRest(spiralMotion);
    if (!resting.current) state.invalidate();
  });

  const point = (card: CardRuntime) => (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    cursor.enter(card);
    invalidate();
  };

  const unpoint = (card: CardRuntime) => () => {
    cursor.leave(card);
    invalidate();
  };

  const select = (card: CardRuntime) => (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (event.delta <= CLICK_SLOP) onSelect(Math.round(spiralMotion.value + card.offset));
  };

  return cards.map((card) => (
    <mesh
      key={card.slot}
      ref={(mesh) => {
        card.mesh = mesh;
        // The pointer tests the card as drawn, bent and swept, not the flat plane underneath.
        if (mesh) mesh.raycast = bentCardRaycast(mesh, card.material.uniforms);
      }}
      geometry={geometry}
      material={card.material}
      visible={false}
      onPointerOver={point(card)}
      onPointerOut={unpoint(card)}
      onClick={select(card)}
    />
  ));
}
