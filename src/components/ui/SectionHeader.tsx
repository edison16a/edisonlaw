import { cn } from '@/lib/cn';

interface SectionHeaderProps {
  title: string;
  id: string;
  lead?: string;
  className?: string;
}

/** Section title with an optional one line lead. */
export function SectionHeader({ title, id, lead, className }: SectionHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4', className)}>
      <h2 id={id} className="text-5xl leading-[0.95] font-bold sm:text-6xl">
        {title}
      </h2>
      {lead && <p className="max-w-md text-base text-grey-400">{lead}</p>}
    </header>
  );
}
