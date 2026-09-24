import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Providers } from '@/components/layout/Providers';
import { SkipLink } from '@/components/layout/SkipLink';
import { AboutSection } from '@/features/about/AboutSection';
import { ExperienceSection } from '@/features/experience/ExperienceSection';
import { ProjectsSection } from '@/features/projects/ProjectsSection';
import { SoundToggle } from '@/features/sound';

export default function Home() {
  return (
    <Providers>
      <div id="top" />
      <SkipLink />
      <Navbar />
      <main>
        <ProjectsSection />
        <ExperienceSection />
        <AboutSection />
      </main>
      <Footer />
      <SoundToggle />
    </Providers>
  );
}
