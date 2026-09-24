'use client';

import type { Ref } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Project } from '@/content/types';
import { ProjectDetails } from '../components/ProjectDetails';
import { ProjectStatus } from '../components/ProjectStatus';
import { useSpiralStore } from '../state/spiralStore';

interface DetailPanelProps {
  projects: Project[];
  /** The column the panel lives in, measured to know how far the scene has to slide. */
  columnRef: Ref<HTMLDivElement>;
}

/**
 * The focused project's details on the right of the stage. A scrim that is
 * darkest under the column keeps the text readable over the cards, and every
 * change of card plays the exit before the next project rises in.
 */
export function DetailPanel({ projects, columnRef }: DetailPanelProps) {
  const panel = useSpiralStore((state) => state.panel);
  const project = panel === null ? null : projects[panel];

  return (
    <>
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ opacity: project ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        className="pointer-events-none absolute inset-y-0 right-0 w-full bg-linear-to-t from-black/85 via-black/30 to-transparent lg:w-[calc(var(--panel-r)+var(--panel-w)+8rem)] lg:bg-[linear-gradient(to_left,rgb(0_0_0/0.85),rgb(0_0_0/0.7)_calc(100%_-_8rem),transparent)]"
      />
      {/* Below lg the panel sits at the bottom, and its right padding keeps the tags clear of the sound toggle. */}
      <div
        ref={columnRef}
        className="pointer-events-none absolute right-0 bottom-0 flex w-full justify-end pr-24 pb-8 pl-8 lg:inset-y-0 lg:right-(--panel-r) lg:w-(--panel-w) lg:items-center lg:pr-12 lg:pb-0 lg:pl-0"
      >
        <AnimatePresence mode="wait">
          {project && panel !== null && (
            <div key={project.id} className="pointer-events-auto w-full max-w-sm lg:max-w-none">
              <ProjectDetails project={project} index={panel} total={projects.length} />
            </div>
          )}
        </AnimatePresence>
      </div>
      <ProjectStatus project={project} index={panel ?? 0} total={projects.length} />
    </>
  );
}
