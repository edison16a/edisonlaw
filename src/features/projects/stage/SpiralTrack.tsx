'use client';

import dynamic from 'next/dynamic';
import { useCallback, useRef, useState } from 'react';
import type { Project } from '@/content/types';
import { useInView } from '@/lib/hooks/useInView';
import { CanvasBoundary } from '@/components/three/CanvasBoundary';
import { sound } from '@/features/sound';
import { useOpeningCard } from '../hooks/useOpeningCard';
import { useScrollSnap } from '../hooks/useScrollSnap';
import { useScrollToCard } from '../hooks/useScrollToCard';
import { useSpiralSounds } from '../hooks/useSpiralSounds';
import { useTrackMetrics } from '../hooks/useTrackMetrics';
import { TRACK, trackSpan } from '../spiral/track';
import { useSpiralStore } from '../state/spiralStore';
import { DetailPanel } from './DetailPanel';
import { HoverLabel } from './HoverLabel';
import { IntroCaption } from './IntroCaption';
import { StageBackdrop } from './StageBackdrop';
import { StageSurface } from './StageSurface';

const SpiralCanvas = dynamic(() => import('../spiral/SpiralCanvas').then((loaded) => loaded.SpiralCanvas), {
  ssr: false,
});

interface SpiralTrackProps {
  projects: Project[];
}

/**
 * The tall scroll track with the sticky full-viewport stage below the navbar.
 * Scrolling through the track turns the spiral one card at a time.
 */
export function SpiralTrack({ projects }: SpiralTrackProps) {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const column = useRef<HTMLDivElement>(null);
  const count = projects.length;

  useTrackMetrics({ track, stage, column }, count);
  const startAt = useOpeningCard();
  useScrollSnap();
  useSpiralSounds();

  const near = useInView(track, { rootMargin: '25% 0px' });
  const [mounted, setMounted] = useState(false);
  if (near && !mounted) setMounted(true);

  const scrollToCard = useScrollToCard();
  const setHovered = useSpiralStore((state) => state.setHovered);
  const fallBack = useSpiralStore((state) => state.failSpiral);

  const onHover = useCallback(
    (project: number | null) => {
      setHovered(project);
      if (project !== null) sound.play('hover');
    },
    [setHovered],
  );

  const height = `calc(100dvh - var(--spacing-nav) + ${trackSpan(count) * TRACK.perCardVh}vh)`;

  return (
    <div ref={track} className="relative" style={{ height }}>
      {/*
        On wide screens the panel sits beside the spiral. It keeps to a composition
        at most 160dvh wide, so on screens wider than 16:10 it does not drift away
        from the card to the far edge.
      */}
      <div
        ref={stage}
        className="sticky top-nav h-[calc(100dvh-var(--spacing-nav))] overflow-hidden [--panel-r:max(0px,calc((100%-160dvh)/2))] [--panel-w:clamp(21rem,29vw,27rem)]"
      >
        <StageBackdrop />
        <StageSurface count={count}>
          {mounted && (
            <CanvasBoundary label="project spiral" onFail={fallBack}>
              <SpiralCanvas projects={projects} startAt={startAt} active={near} onSelect={scrollToCard} onHover={onHover} />
            </CanvasBoundary>
          )}
        </StageSurface>
        {/* The stage melts into the black page below, so the handoff to the next section has no hard edge. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[12%] bg-linear-to-b from-transparent to-black" />
        <IntroCaption />
        <HoverLabel projects={projects} />
        <DetailPanel projects={projects} columnRef={column} />
      </div>
    </div>
  );
}
