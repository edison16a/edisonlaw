import { projects } from '@/content/projects';
import { BadgeList } from '@/components/ui/Badge';
import { TagList } from '@/components/ui/Tag';
import { padIndex } from '@/lib/format';

/** Projects as plain text. The spiral builds on top of this. */
export function ProjectsSection() {
  return (
    <section id="projects" aria-labelledby="projects-title" className="gutter min-h-dvh pt-nav">
      <h2 id="projects-title" className="py-12 text-4xl font-bold">
        Projects
      </h2>
      <ol className="grid gap-10 pb-24 md:grid-cols-2">
        {projects.map((project, index) => (
          <li key={project.id} className="flex flex-col gap-3 border-t border-grey-800 pt-6">
            <span className="font-mono text-xs text-grey-500">{padIndex(index + 1)}</span>
            <h3 className="text-2xl font-bold">{project.name}</h3>
            <BadgeList items={project.badges} />
            <p className="max-w-prose text-grey-300">{project.description}</p>
            <TagList items={project.stack} />
            {project.links.length > 0 && (
              <ul className="flex flex-wrap gap-4 text-sm">
                {project.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
