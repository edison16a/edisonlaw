'use client';

import { useCallback } from 'react';
import { useLenis } from 'lenis/react';
import { projects as allProjects } from '@/content/projects';
import type { Project } from '@/content/types';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import { useIsClient } from '@/lib/hooks/useIsClient';
import { useWebGLSupport } from '@/lib/hooks/useWebGLSupport';
import { ProjectsIndex } from './components/ProjectsIndex';
import { ProjectList } from './list/ProjectList';
import { ProjectCarousel } from './mobile/ProjectCarousel';
import { SpiralTrack } from './stage/SpiralTrack';
import { useSpiralStore, type SpiralMode } from './state/spiralStore';
import { useSpiralMode } from './state/useSpiralMode';

/**
 * The first thing visitors see. Desktop gets the spiral, phones a swipeable
 * strip, and list mode a plain index. Every project is real text in every mode.
 */
export function ProjectsSection({ projects = allProjects }: { projects?: Project[] }) {
  const mode = useSpiralMode();
  const isMobile = useIsMobile();
  const isClient = useIsClient();
  const webgl = useWebGLSupport();
  const lenis = useLenis();
  const chooseMode = useSpiralStore((state) => state.chooseMode);
  const openInSpiral = useSpiralStore((state) => state.openInSpiral);

  const toTop = useCallback(() => {
    if (lenis) lenis.scrollTo('#projects', { immediate: true, force: true });
    else document.getElementById('projects')?.scrollIntoView();
  }, [lenis]);

  const changeMode = useCallback(
    (next: SpiralMode) => {
      toTop();
      chooseMode(next);
    },
    [chooseMode, toTop],
  );

  // Until the client knows the screen size both layouts render and CSS picks one, so phones never flash the stage.
  // Meanwhile the stage's title is the h1. Without WebGL the carousel stands in for the spiral on every screen.
  const spiralFits = !isMobile && webgl;
  const showStage = !isClient || spiralFits;
  const showCarousel = !isClient || !spiralFits;

  return (
    <section id="projects" aria-labelledby="projects-title" className="relative pt-nav">
      {mode === 'list' ? (
        <ProjectList projects={projects} onModeChange={changeMode} onOpen={openInSpiral} />
      ) : (
        <>
          {showStage && (
            <div className="max-md:hidden">
              <SpiralTrack projects={projects} onModeChange={changeMode} />
            </div>
          )}
          {showCarousel && (
            <ProjectCarousel
              projects={projects}
              onModeChange={changeMode}
              heading={isClient}
              className={isClient ? undefined : 'md:hidden'}
            />
          )}
          <ProjectsIndex projects={projects} />
        </>
      )}
    </section>
  );
}
