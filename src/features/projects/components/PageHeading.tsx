import { site } from '@/content/site';

/**
 * The page's h1, Edison's name with the tagline under it, then the hidden
 * Projects h2 the section is labelled by, so project h3s nest under it. All of
 * it is for screen readers and search engines only: the navbar already shows
 * his name, and the projects speak for themselves.
 */
export function PageHeading() {
  return (
    <div className="sr-only">
      <h1>{site.name}</h1>
      <p>{site.tagline}</p>
      <h2 id="projects-title">Projects</h2>
    </div>
  );
}
