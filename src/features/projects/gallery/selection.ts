/**
 * Which screenshot the visitor picked for the project in focus. Every other
 * project, and this one once it leaves focus, shows its thumbnail. Pure, so
 * the spiral store and the phone carousel share it and it is unit tested.
 */
export interface GallerySelection {
  /** The project the choice belongs to, or null for no choice at all. */
  project: number | null;
  /** Index into that project's pictures. 0 is the thumbnail. */
  picture: number;
}

/** Nothing picked, so every project shows its thumbnail. */
export const NO_SELECTION: GallerySelection = { project: null, picture: 0 };

/** The picture `project` shows: the one picked for it, or else its thumbnail. */
export function shownPicture(selection: GallerySelection, project: number) {
  return selection.project === project ? selection.picture : 0;
}

/** Picks picture `picture` of the `count` that `project` has, kept in range. */
export function selectPicture(project: number, picture: number, count: number): GallerySelection {
  const index = Math.min(Math.max(0, Math.round(picture)), Math.max(0, count - 1));
  return index === 0 ? NO_SELECTION : { project, picture: index };
}
