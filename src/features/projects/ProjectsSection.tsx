'use client';

import { projects as allProjects } from '@/content/projects';
import type { Project } from '@/content/types';
import { useIsClient } from '@/lib/hooks/useIsClient';
import { PageHeading } from './components/PageHeading';
import { ProjectsIndex } from './components/ProjectsIndex';
import { CAROUSEL_ONLY, STAGE_ONLY, useSpiralFits } from './hooks/useSpiralFits';
import { ProjectCarousel } from './mobile/ProjectCarousel';
import { SpiralStage } from './stage/SpiralStage';

/**
 * The first thing visitors see. Desktops and tablets get the spiral, phones
 * (upright or on their side) a swipeable strip. Every project is also real
 * text for screen readers and search engines.
 */
export function ProjectsSection({ projects = allProjects }: { projects?: Project[] }) {
  const spiralFits = useSpiralFits();
  const isClient = useIsClient();

  // Until the client knows the screen, both layouts render and CSS picks one, so nothing
  // flashes or jumps in height. Without WebGL the carousel stands in for the spiral on every screen.
  const showStage = !isClient || spiralFits;
  const showCarousel = !isClient || !spiralFits;

  return (
    <section id="projects" aria-labelledby="projects-title" className="relative pt-nav">
      <PageHeading />
      {showStage && (
        <div className={isClient ? undefined : STAGE_ONLY}>
          <SpiralStage projects={projects} />
        </div>
      )}
      {showCarousel && (
        <ProjectCarousel projects={projects} className={isClient ? undefined : CAROUSEL_ONLY} />
      )}
      <ProjectsIndex projects={projects} />
    </section>
  );
}
