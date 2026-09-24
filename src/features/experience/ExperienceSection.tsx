import { experience } from '@/content/experience';
import { DateRange } from '@/components/ui/DateRange';
import { TagList } from '@/components/ui/Tag';
import { WorkstationStage } from '@/features/workstation';

/** Work Experience as plain text next to the desk scene. */
export function ExperienceSection() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="relative lg:grid lg:grid-cols-2">
      <div className="gutter pt-nav pb-24">
        <h2 id="experience-title" className="py-12 text-4xl font-bold">
          Work Experience
        </h2>
        <ol className="flex flex-col gap-12">
          {experience.map((entry) => (
            <li key={entry.id} className="flex flex-col gap-2">
              <DateRange entry={entry} />
              <h3 className="text-xl font-bold">{entry.role}</h3>
              <p className="text-grey-300">{entry.company}</p>
              <p className="max-w-prose text-grey-300">{entry.summary}</p>
              <TagList items={entry.tags} />
            </li>
          ))}
        </ol>
      </div>
      <div className="sticky top-0 hidden h-dvh pt-nav lg:block">
        <WorkstationStage variant="work" />
      </div>
    </section>
  );
}
