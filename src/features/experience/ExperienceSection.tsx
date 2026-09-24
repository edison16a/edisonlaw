import { AmbientSection } from '@/components/layout/AmbientSection';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ExperienceTimeline } from './ExperienceTimeline';

/** Timeline on the left, desk scene pinned on the right, with the desk ambience while in view. */
export function ExperienceSection() {
  return (
    <AmbientSection
      id="experience"
      labelledBy="experience-title"
      loop="desk"
      className="relative flex flex-col lg:grid lg:grid-cols-2"
    >
      <ExperienceTimeline
        header={
          <SectionHeader
            id="experience-title"
            title="Work Experience"
            lead="Startups, research labs and open source, newest first."
            className="mb-20"
          />
        }
      />
    </AmbientSection>
  );
}
