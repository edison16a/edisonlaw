import type { Project } from '@/content/types';
import { projectBadges } from '../badges';
import { ProjectLinks } from './ProjectLinks';

/**
 * Every project as plain text for screen readers and search engines, while
 * the spiral or the carousel shows them as pictures. Its links stay out of the
 * tab order because the visible panel already offers them.
 */
export function ProjectsIndex({ projects }: { projects: Project[] }) {
  return (
    <ol className="sr-only">
      {projects.map((project) => {
        const badges = projectBadges(project).map((badge) => badge.label);
        return (
          <li key={project.id}>
            <p>
              <strong>{project.name}</strong>
              {project.org && `, ${project.org}`}
            </p>
            {badges.length > 0 && <p>{badges.join('. ')}.</p>}
            <p>{project.description}</p>
            <p>Built with {project.stack.join(', ')}.</p>
            <ProjectLinks links={project.links} tabIndex={-1} />
          </li>
        );
      })}
    </ol>
  );
}
