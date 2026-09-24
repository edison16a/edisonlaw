'use client';

import { motion, type Variants } from 'motion/react';
import type { Project } from '@/content/types';
import { BadgeList } from '@/components/ui/Badge';
import { TagList } from '@/components/ui/Tag';
import { cn } from '@/lib/cn';
import { padIndex } from '@/lib/format';
import { ProjectLinks } from './ProjectLinks';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const group: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
  gone: { opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.2, ease: 'easeIn' } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  shown: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
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
 */
export function ProjectDetails({ project, index, total, className }: ProjectDetailsProps) {
  return (
    <motion.div
      variants={group}
      initial="hidden"
      animate="shown"
      exit="gone"
      className={cn('flex flex-col items-start gap-4', className)}
    >
      <motion.p variants={item} className="font-mono text-xs tracking-widest text-grey-500">
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
      <motion.p variants={item} className="max-w-sm text-[15px] leading-relaxed text-grey-300">
        {project.description}
      </motion.p>
      <motion.div variants={item}>
        <TagList items={project.stack} />
      </motion.div>
      {project.links.length > 0 && (
        <motion.div variants={item} className="pt-1">
          <ProjectLinks links={project.links} />
        </motion.div>
      )}
    </motion.div>
  );
}
