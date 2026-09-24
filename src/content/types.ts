/** Shared shapes for everything the site renders as text. */

export interface Link {
  label: string;
  href: string;
}

export interface Project {
  /** Stable slug, also used to seed the generated cover art. */
  id: string;
  name: string;
  /** Organisation or team the project belongs to, if any. */
  org?: string;
  /** Awards and status, shown as small badges. */
  badges: string[];
  stack: string[];
  description: string;
  links: Link[];
  /** Optional photo in /public/projects. When missing, a cover is generated. */
  image?: string;
}

export interface YearMonth {
  year: number;
  /** 1 to 12 */
  month: number;
}

/** Which picture the centre monitor shows while an entry is in view. */
export type ExperienceScreen =
  | 'optagon'
  | 'ultrasound'
  | 'westpa'
  | 'nanoscience'
  | 'tanius'
  | 'cisco'
  | 'stanford'
  | 'apps';

export interface Experience {
  id: string;
  role: string;
  company: string;
  /** Short context line such as the accelerator batch. */
  context?: string;
  start: YearMonth;
  end: YearMonth | 'present';
  /** Overrides the formatted date range, for entries like "Summer 2024". */
  dateLabel?: string;
  summary: string;
  /** An earlier role at the same company. */
  earlier?: { role: string; summary: string };
  screen: ExperienceScreen;
}

export interface Education {
  school: string;
  detail: string;
  when?: string;
  coursework?: string[];
}

export interface Honor {
  name: string;
  year: number;
}

export interface Activity {
  name: string;
  since: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export type SocialKind = 'email' | 'github' | 'linkedin';

export interface Social {
  kind: SocialKind;
  label: string;
  href: string;
  /** Text shown to the reader, for example the address without the scheme. */
  display: string;
}
