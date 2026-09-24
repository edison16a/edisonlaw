import { intro, skills } from '@/content/about';
import { AmbientSection } from '@/components/layout/AmbientSection';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { WorkstationStage } from '@/features/workstation';
import { AboutBlock } from './AboutBlock';
import { ContactLinks } from './ContactLinks';
import { EducationList } from './EducationList';
import { ActivitiesList, HonorsList } from './RecognitionLists';
import { SkillGrid } from './SkillGrid';

/** Standing scene pinned on the left, the story and details scrolling on the right. */
export function AboutSection() {
  return (
    <AmbientSection
      id="about"
      labelledBy="about-title"
      loop="room"
      className="relative flex flex-col lg:grid lg:grid-cols-2"
    >
      <div className="mt-nav aspect-[4/3] w-full lg:sticky lg:top-nav lg:mt-0 lg:aspect-auto lg:h-[calc(100dvh-var(--spacing-nav))]">
        <WorkstationStage variant="about" />
      </div>
      <div className="gutter flex flex-col gap-16 pt-16 pb-24 lg:pt-[calc(var(--spacing-nav)+4rem)]">
        <SectionHeader id="about-title" title="About Me" />
        <div className="flex max-w-xl flex-col gap-4 text-lg leading-relaxed text-grey-100 sm:text-xl">
          {intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <AboutBlock label="Contact">
          <ContactLinks />
        </AboutBlock>
        <AboutBlock label="Education">
          <EducationList />
        </AboutBlock>
        <AboutBlock label="Skills">
          <SkillGrid groups={skills} />
        </AboutBlock>
        <AboutBlock label="Honors">
          <HonorsList />
        </AboutBlock>
        <AboutBlock label="Activities">
          <ActivitiesList />
        </AboutBlock>
      </div>
    </AmbientSection>
  );
}
