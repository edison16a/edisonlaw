import type { Project } from '@/content/types';

interface ProjectStatusProps {
  /** The project in view, or null while nothing is. */
  project: Project | null;
  index: number;
  total: number;
}

/**
 * Tells screen readers which project is in view, briefly: "2 of 12, AutoLab".
 * The full text already lives in ProjectsIndex, so this never reads it all again.
 */
export function ProjectStatus({ project, index, total }: ProjectStatusProps) {
  return (
    <p role="status" className="sr-only">
      {project ? `${index + 1} of ${total}, ${project.name}` : ''}
    </p>
  );
}
