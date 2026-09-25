import { SectionHeader } from '@/components/ui/SectionHeader';
import { ExperienceTimeline } from './ExperienceTimeline';

/** Timeline on the left, desk scene pinned on the right. */
export function ExperienceSection() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="relative flex flex-col lg:grid lg:grid-cols-2">
      <ExperienceTimeline
        header={
          <SectionHeader
            id="experience-title"
            title="Work Experience"
            className="mb-20"
          />
        }
      />
    </section>
  );
}
