import { SkillCard } from '@/components/skills/SkillCard';
import { cn } from '@/lib/cn';

/** What a project is built with, as the very cards About Me uses for skills, two to a row. */
export function ProjectStack({ items, className }: { items: string[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <ul aria-label="Built with" className={cn('grid grid-cols-2 gap-2', className)}>
      {items.map((item) => (
        <SkillCard key={item} name={item} />
      ))}
    </ul>
  );
}
