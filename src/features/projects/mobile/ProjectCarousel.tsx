'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import type { Project } from '@/content/types';
import { sound } from '@/features/sound';
import { cn } from '@/lib/cn';
import { IntroTitle } from '../components/IntroTitle';
import { ModeToggle } from '../components/ModeToggle';
import { ProjectDetails } from '../components/ProjectDetails';
import { ProjectImage } from '../components/ProjectImage';
import type { SpiralMode } from '../state/spiralStore';
import { useActiveSlide } from './useActiveSlide';

interface ProjectCarouselProps {
  projects: Project[];
  onModeChange: (mode: SpiralMode) => void;
  className?: string;
}

/** Phones: a swipeable strip of photos with the details of the centred one below. No 3D. */
export function ProjectCarousel({ projects, onModeChange, className }: ProjectCarouselProps) {
  const strip = useRef<HTMLOListElement>(null);
  const active = useActiveSlide(strip, projects.length);
  const project = projects[active];
  const previous = useRef(active);

  useEffect(() => {
    if (previous.current !== active) sound.play('tick', { rate: 1.1, volume: 0.6 });
    previous.current = active;
  }, [active]);

  return (
    <div className={cn('flex flex-col pb-16', className)}>
      <div className="flex justify-center pt-5 pb-8">
        <ModeToggle mode="spiral" onChange={onModeChange} />
      </div>
      <IntroTitle className="gutter mb-8" />
      <ol
        ref={strip}
        data-lenis-prevent
        aria-label="Project photos"
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-[9vw] pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((item, index) => (
          <li key={item.id} className="w-[82vw] shrink-0 snap-center">
            <ProjectImage
              project={item}
              sizes="82vw"
              priority={index === 0}
              className={cn(
                'aspect-[16/10] rounded-2xl transition-[opacity,transform] duration-500 ease-out-expo',
                index === active ? 'opacity-100' : 'scale-[0.94] opacity-45',
              )}
            />
            <p className="mt-3 text-center text-sm text-grey-400">{item.name}</p>
          </li>
        ))}
      </ol>
      <div className="gutter mt-6 min-h-[22rem]">
        <AnimatePresence mode="wait">
          <ProjectDetails key={project.id} project={project} index={active} total={projects.length} />
        </AnimatePresence>
      </div>
    </div>
  );
}
