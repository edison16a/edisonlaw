'use client';

import { motion, type Variants } from 'motion/react';
import type { Project } from '@/content/types';
import { BadgeList } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { padIndex } from '@/lib/format';
import { EASE_OUT_EXPO } from '@/lib/easing';
import { ProjectLinks } from './ProjectLinks';
import { ProjectStack } from './ProjectStack';

const group: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
  gone: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};

interface ProjectDetailsProps {
  project: Project;
  index: number;
  total: number;
  className?: string;
}

/**
 * Counter, name, awards, a short description, the stack and links for one
 * project. Each line rises in on its own beat. Wrap it in AnimatePresence
 * keyed by project so a change plays the exit before the next one enters.
 *
 * Narrow boxes stack everything in one column. Once the box is wide enough,
 * the stack moves into a column of its own beside the text, so the details
 * stay short enough to leave the pictures in view.
 */
export function ProjectDetails({ project, index, total, className }: ProjectDetailsProps) {
  return (
    <motion.div variants={group} initial="hidden" animate="shown" exit="gone" className={cn('@container w-full', className)}>
      <div className="grid gap-4 [grid-template-areas:'head'_'stack'_'links'] @xl:grid-cols-2 @xl:grid-rows-[auto_1fr] @xl:gap-x-10 @xl:[grid-template-areas:'head_stack'_'links_stack']">
        <div className="flex flex-col items-start gap-4 [grid-area:head]">
          <motion.p variants={item} className="text-xs font-medium tracking-widest text-grey-400 tabular-nums">
            <span className="text-white">{padIndex(index + 1)}</span> / {padIndex(total)}
          </motion.p>
          <motion.div variants={item} className="flex flex-col gap-1.5">
            <h3 className="font-display text-4xl leading-[0.95] font-bold xl:text-5xl">{project.name}</h3>
            {project.org && <p className="text-sm text-grey-400">{project.org}</p>}
          </motion.div>
          {project.badges.length > 0 && (
            <motion.div variants={item}>
              <BadgeList items={project.badges} />
            </motion.div>
          )}
          <motion.p variants={item} className="max-w-md text-[15px] leading-relaxed text-grey-300">
            {project.description}
          </motion.p>
        </div>
        <motion.div variants={item} className="[grid-area:stack]">
          <ProjectStack items={project.stack} />
        </motion.div>
        {project.links.length > 0 && (
          <motion.div variants={item} className="pt-1 [grid-area:links]">
            <ProjectLinks links={project.links} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
