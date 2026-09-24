'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import type { Project } from '@/content/types';
import { CanvasBoundary } from '@/components/three/CanvasBoundary';
import { useInView } from '@/lib/hooks/useInView';
import { useOpeningCard } from '../hooks/useOpeningCard';
import { useSpiralSounds } from '../hooks/useSpiralSounds';
import { useStageMetrics } from '../hooks/useStageMetrics';
import { moveSpiralTo } from '../input/steering';
import { useStepKeys } from '../input/useStepKeys';
import { useSpiralStore } from '../state/spiralStore';
import { DetailPanel } from './DetailPanel';
import { StageBackdrop } from './StageBackdrop';
import { StageSurface } from './StageSurface';
import { StageTitle } from './StageTitle';
import { StepArrows } from './StepArrows';

const SpiralCanvas = dynamic(() => import('../spiral/SpiralCanvas').then((loaded) => loaded.SpiralCanvas), {
  ssr: false,
});

/**
 * One viewport under the navbar, and the page scrolls past it like any other
 * section. The spiral always shows one project up close, starting on the
 * featured one. The arrows beside it, the left and right arrow keys, sideways
 * swipes and clicks on the cards around it turn the spiral from project to
 * project, round and round forever.
 */
export function SpiralStage({ projects }: { projects: Project[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const column = useRef<HTMLDivElement>(null);

  useStageMetrics(stage, column);
  const startAt = useOpeningCard(projects);
  useStepKeys(stage);
  useSpiralSounds();

  const near = useInView(stage, { rootMargin: '25% 0px' });
  const [mounted, setMounted] = useState(false);
  if (near && !mounted) setMounted(true);

  const fallBack = useSpiralStore((state) => state.failSpiral);

  return (
    // On wide screens the panel sits beside the spiral. It keeps to a composition at most
    // 160dvh wide, so on screens wider than 16:10 it does not drift away to the far edge.
    // Touch screens pan the page up and down here, and sideways swipes turn the spiral.
    <div
      ref={stage}
      role="group"
      aria-roledescription="carousel"
      aria-label="Project spiral"
      className="relative h-[calc(100dvh-var(--spacing-nav))] touch-pan-y touch-pinch-zoom overflow-hidden [--panel-r:max(0px,calc((100%-160dvh)/2))] [--panel-w:clamp(21rem,29vw,27rem)]"
    >
      <StageBackdrop />
      <StageSurface>
        {mounted && (
          <CanvasBoundary label="project spiral" onFail={fallBack}>
            <SpiralCanvas projects={projects} startAt={startAt} active={near} onSelect={moveSpiralTo} />
          </CanvasBoundary>
        )}
      </StageSurface>
      {/* The stage melts into the black page below, so the handoff to the next section has no hard edge. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[12%] bg-linear-to-b from-transparent to-black" />
      <StageTitle />
      <StepArrows />
      <DetailPanel projects={projects} columnRef={column} />
    </div>
  );
}
