'use client';

import dynamic from 'next/dynamic';
import { useCallback, useRef, useState } from 'react';
import type { Project } from '@/content/types';
import { useInView } from '@/lib/hooks/useInView';
import { CanvasBoundary } from '@/components/three/CanvasBoundary';
import { sound } from '@/features/sound';
import { ModeToggle } from '../components/ModeToggle';
import { useOpeningCard } from '../hooks/useOpeningCard';
import { useScrollSnap } from '../hooks/useScrollSnap';
import { useScrollToCard } from '../hooks/useScrollToCard';
import { useSpiralSounds } from '../hooks/useSpiralSounds';
import { useTrackMetrics } from '../hooks/useTrackMetrics';
import { TRACK, trackSpan } from '../spiral/track';
import { useSpiralStore, type SpiralMode } from '../state/spiralStore';
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
  onModeChange: (mode: SpiralMode) => void;
}

/**
 * The tall scroll track with the sticky full-viewport stage below the navbar.
 * Scrolling through the track turns the spiral one card at a time.
 */
export function SpiralTrack({ projects, onModeChange }: SpiralTrackProps) {
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
  const chooseMode = useSpiralStore((state) => state.chooseMode);
  const fallBack = useCallback(() => chooseMode('list'), [chooseMode]);

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
      <div ref={stage} className="sticky top-nav h-[calc(100dvh-var(--spacing-nav))] overflow-hidden">
        <StageBackdrop />
        <StageSurface count={count}>
          {mounted && (
            <CanvasBoundary label="project spiral" onFail={fallBack}>
              <SpiralCanvas projects={projects} startAt={startAt} active={near} onSelect={scrollToCard} onHover={onHover} />
            </CanvasBoundary>
          )}
        </StageSurface>
        <div className="pointer-events-none absolute inset-x-0 top-5 flex justify-center">
          <ModeToggle mode="spiral" onChange={onModeChange} className="pointer-events-auto" />
        </div>
        <IntroCaption />
        <HoverLabel projects={projects} />
        <DetailPanel projects={projects} columnRef={column} />
      </div>
    </div>
  );
}
