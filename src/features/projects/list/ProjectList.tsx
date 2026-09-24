'use client';

import { motion } from 'motion/react';
import type { Project } from '@/content/types';
import { IntroTitle } from '../components/IntroTitle';
import { ModeToggle } from '../components/ModeToggle';
import type { SpiralMode } from '../state/spiralStore';
import { ProjectRow } from './ProjectRow';

interface ProjectListProps {
  projects: Project[];
  onModeChange: (mode: SpiralMode) => void;
  /** Opens a project in the spiral, or the carousel on phones. */
  onOpen: (index: number) => void;
  /** Word for the picture view in the toggle. See ModeToggle. */
  spiralLabel?: string;
  /** Whether its title is the page's h1. See IntroTitle. */
  heading?: boolean;
}

/** A plain text index for skimmers. Normal height, no 3D. */
export function ProjectList({ projects, onModeChange, onOpen, spiralLabel, heading }: ProjectListProps) {
  return (
    <div className="gutter pb-24">
      <div className="flex justify-center pt-5 pb-14">
        <ModeToggle mode="list" onChange={onModeChange} spiralLabel={spiralLabel} />
      </div>
      {/* On wide screens the rows stop short of the fixed sound toggle in the bottom right corner. */}
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6 xl:mr-8">
        <IntroTitle heading={heading} />
        <p className="font-mono text-xs tracking-widest text-grey-400">{projects.length} projects</p>
      </div>
      <motion.ol
        initial="hidden"
        animate="shown"
        variants={{ shown: { transition: { staggerChildren: 0.035 } } }}
        className="border-b border-grey-900 xl:mr-8"
      >
        {projects.map((project, index) => (
          <ProjectRow key={project.id} project={project} index={index} onOpen={onOpen} />
        ))}
      </motion.ol>
    </div>
  );
}
