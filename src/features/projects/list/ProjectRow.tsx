'use client';

import { motion, type Variants } from 'motion/react';
import type { Project } from '@/content/types';
import { BadgeList } from '@/components/ui/Badge';
import { TagList } from '@/components/ui/Tag';
import { padIndex } from '@/lib/format';
import { playHover } from '../components/hoverSound';
import { ProjectLinks } from '../components/ProjectLinks';

/** Rows rise in one after another when the list opens. The list staggers them. */
const rise: Variants = {
  hidden: { opacity: 0, y: 12 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

interface ProjectRowProps {
  project: Project;
  index: number;
  onOpen: (index: number) => void;
}

/**
 * One line of the index: number, name, awards, stack and links. The whole row
 * opens the project in the spiral. Links sit above that and open on their own.
 */
export function ProjectRow({ project, index, onOpen }: ProjectRowProps) {
  return (
    <motion.li
      variants={rise}
      className="group relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-t border-grey-900 py-6 transition-colors duration-300 hover:bg-white/[0.025] md:grid-cols-[3.5rem_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto] md:items-center md:gap-x-6 md:px-3"
    >
      <span className="font-mono text-xs text-grey-500 transition-colors group-hover:text-white">{padIndex(index + 1)}</span>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-2xl leading-tight font-bold transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">
          <button
            type="button"
            onClick={() => onOpen(index)}
            onPointerEnter={playHover}
            aria-label={`Show ${project.name} in the spiral`}
            className="text-left after:absolute after:inset-0 after:content-['']"
          >
            {project.name}
          </button>
        </h3>
        {project.org && <p className="text-sm text-grey-500">{project.org}</p>}
      </div>
      <BadgeList items={project.badges} className="col-start-2 md:col-start-auto" />
      <TagList items={project.stack} className="col-start-2 md:col-start-auto" />
      <ProjectLinks links={project.links} className="relative z-10 col-start-2 md:col-start-auto md:justify-end" />
    </motion.li>
  );
}
