'use client';

import { motion, type Variants } from 'motion/react';
import type { Project } from '@/content/types';
import { BadgeList } from '@/components/ui/Badge';
import { TagList } from '@/components/ui/Tag';
import { sound } from '@/features/sound';
import { padIndex } from '@/lib/format';
import { EASE_OUT_EXPO } from '@/lib/easing';
import { ProjectLinks } from '../components/ProjectLinks';

/** Rows rise in one after another when the list opens. The list staggers them. */
const rise: Variants = {
  hidden: { opacity: 0, y: 12 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
};

interface ProjectRowProps {
  project: Project;
  index: number;
  onOpen: (index: number) => void;
}

/**
 * One line of the index: number, name, awards, stack and links. The whole row
 * opens the project in the spiral, or the carousel on phones. Links sit above
 * that and open on their own.
 */
export function ProjectRow({ project, index, onOpen }: ProjectRowProps) {
  return (
    <motion.li
      variants={rise}
      className="group relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-t border-grey-900 py-6 transition-colors duration-300 hover:bg-white/[0.025] md:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.4fr)] md:gap-x-6 xl:grid-cols-[3.5rem_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.3fr)_16rem] xl:items-center xl:px-3"
    >
      <span className="font-mono text-xs text-grey-400 transition-colors group-hover:text-white">{padIndex(index + 1)}</span>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-2xl leading-tight font-bold transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">
          <button
            type="button"
            onClick={() => onOpen(index)}
            onPointerEnter={() => sound.play('hover')}
            aria-label={`Show ${project.name}`}
            className="text-left after:absolute after:inset-0 after:content-['']"
          >
            {project.name}
          </button>
        </h3>
        {project.org && <p className="text-sm text-grey-400">{project.org}</p>}
      </div>
      {/*
        Five columns only fit from xl. Narrower screens stack badges, stack and links,
        beside the name on tablets and under it on phones. From xl the wrapper steps
        aside and every cell renders, even empty, so the columns line up from row to row.
      */}
      <div className="col-start-2 flex flex-col gap-3 md:col-start-3 xl:contents">
        <div className="empty:hidden xl:empty:block">
          <BadgeList items={project.badges} />
        </div>
        <TagList items={project.stack} />
        <div className="empty:hidden xl:empty:block">
          <ProjectLinks links={project.links} compact className="relative z-10 xl:flex-nowrap xl:justify-end" />
        </div>
      </div>
    </motion.li>
  );
}
