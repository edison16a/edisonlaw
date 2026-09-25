import type { Project } from '@/content/types';

export interface ProjectBadge {
  label: string;
  /** True for a hackathon win or prize, drawn with a trophy. */
  trophy: boolean;
}

/** A project's badges in the order they show: its hackathon win and prizes first, then status. */
export function projectBadges({ win, badges }: Pick<Project, 'win' | 'badges'>): ProjectBadge[] {
  const wins = win ? [`Winner, ${win.hackathon}`, ...(win.prizes ?? [])] : [];
  return [
    ...wins.map((label) => ({ label, trophy: true })),
    ...badges.map((label) => ({ label, trophy: false })),
  ];
}
