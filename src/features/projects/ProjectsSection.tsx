'use client';

import { useRef } from 'react';
import { projects as allProjects } from '@/content/projects';
import type { Project } from '@/content/types';
import { useIsClient } from '@/lib/hooks/useIsClient';
import { ProjectsIndex } from './components/ProjectsIndex';
import { CAROUSEL_ONLY, STAGE_ONLY, useSpiralFits } from './hooks/useSpiralFits';
import { useViewSwitch } from './hooks/useViewSwitch';
import { ProjectList } from './list/ProjectList';
import { ProjectCarousel } from './mobile/ProjectCarousel';
import { SpiralTrack } from './stage/SpiralTrack';
import { useSpiralStore } from './state/spiralStore';
import { useSpiralMode } from './state/useSpiralMode';

/**
 * The first thing visitors see. Desktop gets the spiral, phones (upright or on
 * their side) a swipeable strip, and list mode a plain index. Every project is real text in every mode.
 */
export function ProjectsSection({ projects = allProjects }: { projects?: Project[] }) {
  const mode = useSpiralMode();
  const chosen = useSpiralStore((state) => state.chosenMode);
  const spiralFits = useSpiralFits();
  const isClient = useIsClient();
  const section = useRef<HTMLElement>(null);
  const { changeMode, openProject } = useViewSwitch(section);

  // Until the client knows the screen and the motion preference, every layout that might
  // apply renders and CSS picks one, so nothing flashes or jumps in height. Meanwhile the
  // stage's title is the h1. Without WebGL the carousel stands in for the spiral on every screen.
  const undecided = !isClient && chosen === null;
  const showList = mode === 'list' || undecided;
  const showPictures = mode === 'spiral' || undecided;
  const showStage = !isClient || spiralFits;
  const showCarousel = !isClient || !spiralFits;

  return (
    <section ref={section} id="projects" aria-labelledby="projects-title" className="relative pt-nav">
      {showList && (
        <div className={undecided ? 'motion-safe:hidden' : undefined}>
          <ProjectList
            projects={projects}
            onModeChange={changeMode}
            onOpen={openProject}
            heading={isClient}
            spiralLabel={spiralFits ? 'spiral' : 'photos'}
          />
        </div>
      )}
      {showPictures && (
        <div className={undecided ? 'motion-reduce:hidden' : undefined}>
          {showStage && (
            <div className={isClient ? undefined : STAGE_ONLY}>
              <SpiralTrack projects={projects} onModeChange={changeMode} />
            </div>
          )}
          {showCarousel && (
            <ProjectCarousel
              projects={projects}
              onModeChange={changeMode}
              heading={isClient}
              className={isClient ? undefined : CAROUSEL_ONLY}
            />
          )}
          <ProjectsIndex projects={projects} />
        </div>
      )}
    </section>
  );
}
