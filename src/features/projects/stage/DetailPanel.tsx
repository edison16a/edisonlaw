'use client';

import type { Ref } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Project } from '@/content/types';
import { ProjectDetails } from '../components/ProjectDetails';
import { useSpiralStore } from '../state/spiralStore';

interface DetailPanelProps {
  projects: Project[];
  /** The column the panel lives in, measured to know how far the scene has to slide. */
  columnRef: Ref<HTMLDivElement>;
}

/**
 * The focused project's details on the right of the stage. A soft scrim keeps
 * the text readable over the cards, and every change of card plays the exit
 * before the next project rises in.
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
        className="pointer-events-none absolute inset-y-0 right-0 w-full bg-linear-to-t from-black/85 via-black/30 to-transparent lg:w-[55%] lg:bg-linear-to-l lg:via-black/40"
      />
      <div
        ref={columnRef}
        aria-live="polite"
        className="pointer-events-none absolute right-0 bottom-0 flex w-full justify-end px-8 pb-8 lg:inset-y-0 lg:w-[clamp(21rem,29vw,27rem)] lg:items-center lg:px-0 lg:pr-12 lg:pb-0"
      >
        <AnimatePresence mode="wait">
          {project && panel !== null && (
            <div key={project.id} className="pointer-events-auto w-full max-w-sm lg:max-w-none">
              <ProjectDetails project={project} index={panel} total={projects.length} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
