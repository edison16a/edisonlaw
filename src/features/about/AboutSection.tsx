import { activities, education, honors, intro, skills, socials } from '@/content/about';
import { WorkstationStage } from '@/features/workstation';

/** About Me as plain text next to the standing scene. */
export function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative lg:grid lg:grid-cols-2">
      <div className="sticky top-0 hidden h-dvh pt-nav lg:block">
        <WorkstationStage variant="about" />
      </div>
      <div className="gutter flex flex-col gap-12 pt-nav pb-24">
        <h2 id="about-title" className="pt-12 text-4xl font-bold">
          About Me
        </h2>
        <div className="flex max-w-prose flex-col gap-4 text-grey-200">
          {intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <ul className="flex flex-col gap-2">
          {socials.map((social) => (
            <li key={social.kind}>
              <a href={social.href} className="underline underline-offset-4">
                {social.display}
              </a>
            </li>
          ))}
        </ul>
        <ul className="flex flex-col gap-4">
          {education.map((item) => (
            <li key={item.school}>
              <p className="font-bold">{item.school}</p>
              <p className="text-grey-300">{item.detail}</p>
            </li>
          ))}
        </ul>
        {skills.map((group) => (
          <div key={group.category}>
            <h3 className="font-bold">{group.category}</h3>
            <p className="text-grey-300">{group.items.join(', ')}</p>
          </div>
        ))}
        <p className="text-grey-300">{honors.map((honor) => `${honor.name} (${honor.year})`).join(', ')}</p>
        <p className="text-grey-300">{activities.map((activity) => activity.name).join(', ')}</p>
      </div>
    </section>
  );
}
