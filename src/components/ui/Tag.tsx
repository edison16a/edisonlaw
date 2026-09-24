import { cn } from '@/lib/cn';

/** Outlined tech tag in mono type. */
export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-grey-700 px-2.5 py-0.5 font-mono text-[11px] leading-5 tracking-tight text-grey-200',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function TagList({ items, className }: { items: string[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)} aria-label="Technologies">
      {items.map((item) => (
        <li key={item}>
          <Tag>{item}</Tag>
        </li>
      ))}
    </ul>
  );
}
