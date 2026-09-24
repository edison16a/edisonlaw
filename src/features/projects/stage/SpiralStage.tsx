'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Project } from '@/content/types';
import { CanvasBoundary } from '@/components/three/CanvasBoundary';
import { sound } from '@/features/sound';
import { useInView } from '@/lib/hooks/useInView';
import { useOpeningCard } from '../hooks/useOpeningCard';
import { useSpiralSounds } from '../hooks/useSpiralSounds';
import { useStageMetrics } from '../hooks/useStageMetrics';
import { spinTo, stopSpin } from '../input/steering';
import { useSpinKeys } from '../input/useSpinKeys';
import { useStageHome } from '../input/useStageHome';
import { useWheelSpin } from '../input/useWheelSpin';
import { useSpiralStore } from '../state/spiralStore';
import { DetailPanel } from './DetailPanel';
import { HoverLabel } from './HoverLabel';
import { IntroCaption } from './IntroCaption';
import { NextSectionCue } from './NextSectionCue';
import { StageBackdrop } from './StageBackdrop';
import { StageSurface } from './StageSurface';

const SpiralCanvas = dynamic(() => import('../spiral/SpiralCanvas').then((loaded) => loaded.SpiralCanvas), {
  ssr: false,
});

/**
 * One viewport under the navbar, and the page stands still on it. The wheel,
 * the trackpad, drags and the arrow keys spin the spiral through the projects
 * forever, in either direction. The cue at the bottom, the navbar, the
 * scrollbar and PageDown carry on to Work Experience.
 */
export function SpiralStage({ projects }: { projects: Project[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const column = useRef<HTMLDivElement>(null);
  const count = projects.length;

  useStageMetrics(stage, column);
  const startAt = useOpeningCard(count);
  const home = useStageHome(stage);
  useWheelSpin(stage);
  useSpinKeys(stage, surface, count);
  useSpiralSounds();
  useEffect(() => stopSpin, []);

  const near = useInView(stage, { rootMargin: '25% 0px' });
  const [mounted, setMounted] = useState(false);
  if (near && !mounted) setMounted(true);

  const setHovered = useSpiralStore((state) => state.setHovered);
  const fallBack = useSpiralStore((state) => state.failSpiral);

  const onHover = useCallback(
    (project: number | null) => {
      setHovered(project);
      if (project !== null) sound.play('hover');
    },
    [setHovered],
  );

  return (
    // On wide screens the panel sits beside the spiral. It keeps to a composition at most
    // 160dvh wide, so on screens wider than 16:10 it does not drift away to the far edge.
    <div
      ref={stage}
      className="relative h-[calc(100dvh-var(--spacing-nav))] overflow-hidden [--panel-r:max(0px,calc((100%-160dvh)/2))] [--panel-w:clamp(21rem,29vw,27rem)]"
    >
      <StageBackdrop />
      <StageSurface ref={surface} home={home}>
        {mounted && (
          <CanvasBoundary label="project spiral" onFail={fallBack}>
            <SpiralCanvas projects={projects} startAt={startAt} active={near} onSelect={spinTo} onHover={onHover} />
          </CanvasBoundary>
        )}
      </StageSurface>
      {/* The stage melts into the black page below, so the handoff to the next section has no hard edge. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[12%] bg-linear-to-b from-transparent to-black" />
      <IntroCaption />
      <HoverLabel projects={projects} />
      <DetailPanel projects={projects} columnRef={column} />
      <NextSectionCue />
    </div>
  );
}
