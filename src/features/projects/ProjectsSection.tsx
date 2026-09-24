'use client';

import { useRef } from 'react';
import { projects as allProjects } from '@/content/projects';
import type { Project } from '@/content/types';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import { useIsClient } from '@/lib/hooks/useIsClient';
import { useWebGLSupport } from '@/lib/hooks/useWebGLSupport';
import { ProjectsIndex } from './components/ProjectsIndex';
import { useViewSwitch } from './hooks/useViewSwitch';
import { ProjectList } from './list/ProjectList';
import { ProjectCarousel } from './mobile/ProjectCarousel';
import { SpiralTrack } from './stage/SpiralTrack';
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
  const section = useRef<HTMLElement>(null);
  const { changeMode, openProject } = useViewSwitch(section);

  // Until the client knows the screen size both layouts render and CSS picks one, so phones never flash the stage.
  // Meanwhile the stage's title is the h1. Without WebGL the carousel stands in for the spiral on every screen.
  const spiralFits = !isMobile && webgl;
  const showStage = !isClient || spiralFits;
  const showCarousel = !isClient || !spiralFits;

  return (
    <section ref={section} id="projects" aria-labelledby="projects-title" className="relative pt-nav">
      {mode === 'list' ? (
        <ProjectList
          projects={projects}
          onModeChange={changeMode}
          onOpen={openProject}
          spiralLabel={spiralFits ? 'spiral' : 'photos'}
        />
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
