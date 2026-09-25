import type { Project } from '@/content/types';

/** The mark drawn before a badge: a trophy for hackathon wins, a star for store features, a person for users. */
export type BadgeMark = 'trophy' | 'star' | 'users';

export interface ProjectBadge {
  label: string;
  mark?: BadgeMark;
}

/** Store features, like "Featured on the Chrome Web Store", get a star. */
const FEATURED = /^Featured\b/;

/** A project's badges in the order they show: its hackathon win and prizes first, then status. */
export function projectBadges({ win, badges, users }: Pick<Project, 'win' | 'badges' | 'users'>): ProjectBadge[] {
  const wins = win ? [`Winner, ${win.hackathon}`, ...(win.prizes ?? [])] : [];
  return [
    ...wins.map((label): ProjectBadge => ({ label, mark: 'trophy' })),
    ...badges.map((label): ProjectBadge => (FEATURED.test(label) ? { label, mark: 'star' } : { label })),
    ...(users ? [{ label: users, mark: 'users' } as const] : []),
  ];
}
