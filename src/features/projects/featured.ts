import { featuredProjectId } from '@/content/projects';
import type { Project } from '@/content/types';

/** Index of the project the spiral and the carousel open on. The first one if `id` is not in the list. */
export function featuredIndex(projects: Project[], id = featuredProjectId) {
  return Math.max(0, projects.findIndex((project) => project.id === id));
}
