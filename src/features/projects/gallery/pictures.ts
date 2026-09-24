import type { Project } from '@/content/types';

/** Most pictures a project shows, the thumbnail included. */
export const MAX_PICTURES = 5;

/**
 * Every picture of a project in order: the thumbnail from `image` first,
 * then its screenshots, never more than MAX_PICTURES.
 */
export function projectPictures(project: Pick<Project, 'image' | 'screenshots'>): string[] {
  return [project.image, ...(project.screenshots ?? [])].slice(0, MAX_PICTURES);
}

/** True for a project with screenshots to flip through, which gets the row under its card. */
export function hasGallery(project: Pick<Project, 'image' | 'screenshots'>) {
  return projectPictures(project).length > 1;
}
