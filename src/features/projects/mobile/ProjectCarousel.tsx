'use client';

import { getImageProps } from 'next/image';
import { useCallback, useRef, useState, type KeyboardEvent } from 'react';
import { preload } from 'react-dom';
import { AnimatePresence } from 'motion/react';
import type { Project } from '@/content/types';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { ProjectDetails } from '../components/ProjectDetails';
import { ProjectImage } from '../components/ProjectImage';
import { ProjectStatus } from '../components/ProjectStatus';
import { featuredIndex } from '../featured';
import { hasGallery, projectPictures } from '../gallery/pictures';
import { NO_SELECTION, selectPicture, shownPicture } from '../gallery/selection';
import { CAROUSEL_QUERY } from '../hooks/useSpiralFits';
import { CarouselControls } from './CarouselControls';
import { CarouselGallery } from './CarouselGallery';
import { slideStride, useActiveSlide } from './useActiveSlide';
import { useStripSound } from './useStripSound';

/** Slide widths for next/image, so phones download a sensible size. */
const SLIDE_SIZES = '(min-width: 768px) 768px, 82vw';

/**
 * Asks for the opening photo early, but only on screens that show the carousel.
 * Desktops render it too until the client knows the screen, and should not fetch it.
 */
function preloadPhoto(project: Project) {
  const { props } = getImageProps({ src: project.image, alt: '', fill: true, sizes: SLIDE_SIZES });
  if (!props.src) return;
  preload(props.src, {
    as: 'image',
    imageSrcSet: props.srcSet,
    imageSizes: props.sizes,
    fetchPriority: 'high',
    media: CAROUSEL_QUERY,
  });
}

interface ProjectCarouselProps {
  projects: Project[];
  className?: string;
}

/**
 * A swipeable strip of photos with the details of the centred one below. No 3D.
 * Phones get it, and so does any screen without WebGL. Like the spiral, it
 * opens on the featured project.
 */
export function ProjectCarousel({ projects, className }: ProjectCarouselProps) {
  const strip = useRef<HTMLOListElement>(null);
  const opening = featuredIndex(projects);
  const active = useActiveSlide(strip, projects.length, opening);
  preloadPhoto(projects[opening]);
  const project = projects[active];
  useStripSound(strip, active);

  // A screenshot picked under the current slide. Moving to another slide puts its thumbnail back.
  const [gallery, setGallery] = useState(NO_SELECTION);
  if (gallery.project !== null && gallery.project !== active) setGallery(NO_SELECTION);

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
    <div className={cn('flex flex-col pt-10 pb-16', className)}>
      {/*
        Lenis leaves sideways wheel swipes to the strip. Its stylesheet then sets
        overscroll-behavior: contain, so the inline style hands vertical swipes back to the page.
        Slides stay short enough to fit a phone on its side, and the padding centres the first and last.
      */}
      <ol
        ref={strip}
        data-lenis-prevent-horizontal
        style={{ overscrollBehaviorY: 'auto' }}
        tabIndex={0}
        data-focus-on-open
        onKeyDown={onKeyDown}
        aria-label="Project photos. Use the left and right arrow keys to move between projects."
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-[calc((100%_-_var(--slide))/2)] [--slide:min(82vw,48rem,calc((100dvh_-_8rem)*1.6))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((item, index) => (
          <li key={item.id} className="relative w-(--slide) shrink-0 snap-center">
            <ProjectImage
              project={item}
              sizes={SLIDE_SIZES}
              shown={index === active && hasGallery(item) ? shownPicture(gallery, index) : undefined}
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
      <CarouselGallery
        project={project}
        shown={shownPicture(gallery, active)}
        onChoose={(picture) => setGallery(selectPicture(active, picture, projectPictures(project).length))}
      />
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
