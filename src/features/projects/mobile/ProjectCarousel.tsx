'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence } from 'motion/react';
import type { Project } from '@/content/types';
import { sound } from '@/features/sound';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { IntroTitle } from '../components/IntroTitle';
import { ModeToggle } from '../components/ModeToggle';
import { ProjectDetails } from '../components/ProjectDetails';
import { ProjectImage } from '../components/ProjectImage';
import { ProjectStatus } from '../components/ProjectStatus';
import { useSpiralStore, type SpiralMode } from '../state/spiralStore';
import { CarouselControls } from './CarouselControls';
import { slideStride, useActiveSlide } from './useActiveSlide';

interface ProjectCarouselProps {
  projects: Project[];
  onModeChange: (mode: SpiralMode) => void;
  /** Whether its title is the page's h1. See IntroTitle. */
  heading?: boolean;
  className?: string;
}

/**
 * A swipeable strip of photos with the details of the centred one below. No 3D.
 * Phones get it, and so does any screen without WebGL.
 */
export function ProjectCarousel({ projects, onModeChange, heading, className }: ProjectCarouselProps) {
  const strip = useRef<HTMLOListElement>(null);
  // A project chosen in the list opens here, the same way the spiral opens on it.
  const [opening] = useState(() => useSpiralStore.getState().pendingFocus ?? 0);
  const active = useActiveSlide(strip, projects.length, opening);
  const project = projects[active];
  const previous = useRef(active);

  useLayoutEffect(() => {
    const pending = useSpiralStore.getState().takePendingFocus();
    const node = strip.current;
    if (pending !== null && node) node.scrollLeft = pending * slideStride(node);
  }, []);

  useEffect(() => {
    if (previous.current !== active) sound.play('tick', { rate: 1.1, volume: 0.6 });
    previous.current = active;
  }, [active]);

  const reducedMotion = useReducedMotion();
  const moveTo = useCallback(
    (index: number) => {
      const node = strip.current;
      if (!node) return;
      const target = Math.min(projects.length - 1, Math.max(0, index));
      node.scrollTo({ left: target * slideStride(node), behavior: reducedMotion ? 'auto' : 'smooth' });
    },
    [projects.length, reducedMotion],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLOListElement>) => {
    const targets: Record<string, number> = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: projects.length - 1 };
    if (!(event.key in targets)) return;
    event.preventDefault();
    moveTo(targets[event.key]);
  };

  return (
    <div className={cn('flex flex-col pb-16', className)}>
      <div className="flex justify-center pt-5 pb-8">
        <ModeToggle mode="spiral" onChange={onModeChange} spiralLabel="photos" />
      </div>
      <IntroTitle heading={heading} className="gutter mb-8" />
      {/*
        Lenis leaves sideways wheel swipes to the strip. Its stylesheet then sets
        overscroll-behavior: contain, so the inline style hands vertical swipes back to the page.
      */}
      <ol
        ref={strip}
        data-lenis-prevent-horizontal
        style={{ overscrollBehaviorY: 'auto' }}
        tabIndex={0}
        data-focus-on-open
        onKeyDown={onKeyDown}
        aria-label="Project photos. Use the left and right arrow keys to move between projects."
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-[max(9vw,calc(50%-24rem))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((item, index) => (
          <li key={item.id} className="relative w-[82vw] max-w-3xl shrink-0 snap-center">
            <ProjectImage
              project={item}
              sizes="(min-width: 768px) 768px, 82vw"
              priority={index === 0}
              className={cn(
                'aspect-[16/10] rounded-2xl transition-[opacity,transform] duration-500 ease-out-expo',
                index === active ? 'opacity-100' : 'scale-[0.94] opacity-45',
              )}
            />
            {/* The details below already name the project on screen. */}
            <p className="sr-only">{item.name}</p>
          </li>
        ))}
      </ol>
      <div className="gutter mx-auto mt-3 flex w-full max-w-3xl justify-end">
        <CarouselControls index={active} count={projects.length} onMove={moveTo} />
      </div>
      <div className="gutter mx-auto mt-3 min-h-[22rem] w-full max-w-3xl">
        <AnimatePresence mode="wait">
          <ProjectDetails key={project.id} project={project} index={active} total={projects.length} />
        </AnimatePresence>
      </div>
      <ProjectStatus project={project} index={active} total={projects.length} />
    </div>
  );
}
