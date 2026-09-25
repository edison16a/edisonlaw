import type { ReactNode } from 'react';
import { StarIcon, TrophyIcon, UserIcon } from '@/components/icons';
import { cn } from '@/lib/cn';

/** Solid white pill for awards and status. It is the loudest element a card gets. */
export function Badge({ children, icon, className }: { children: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium leading-5 text-black',
        icon && 'pl-2',
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export interface BadgeItem {
  label: string;
  /** A trophy for a hackathon win or prize, a star for a store feature, a person for users. */
  mark?: 'trophy' | 'star' | 'users';
}

const MARKS = {
  trophy: <TrophyIcon size={13} strokeWidth={2} />,
  star: <StarIcon size={13} strokeWidth={2} />,
  users: <UserIcon size={13} strokeWidth={2} />,
};

export function BadgeList({ items, className }: { items: BadgeItem[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)} aria-label="Awards and status">
      {items.map((item) => (
        <li key={item.label} className="flex">
          <Badge icon={item.mark ? MARKS[item.mark] : undefined}>{item.label}</Badge>
        </li>
      ))}
    </ul>
  );
}
