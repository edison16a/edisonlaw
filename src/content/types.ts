/** Shared shapes for everything the site renders as text. */

export interface Link {
  label: string;
  href: string;
}

/** A hackathon a project won, shown as badges with a trophy. */
export interface HackathonWin {
  /** The hackathon and its year, like "CruzHacks 2023". The badge reads "Winner, CruzHacks 2023". */
  hackathon: string;
  /** Track prizes won on top of it, like "Best Use of Vapi". Each gets a trophy badge of its own. */
  prizes?: string[];
}

export interface Project {
  /** Stable slug. It also names the photo file in /public/projects. */
  id: string;
  name: string;
  /** Organisation or team the project belongs to, if any. */
  org?: string;
  /** Status and store honours, like "In progress" or "Featured on the Chrome Web Store", as small badges. */
  badges: string[];
  /** Set when the project won a hackathon. Its badges come first and carry a trophy. */
  win?: HackathonWin;
  stack: string[];
  description: string;
  links: Link[];
  /**
   * Picture in /public/projects, 16:10. It is the thumbnail every card in the
   * spiral and the phone carousel shows, and the first screenshot.
   */
  image: string;
  /**
   * Up to four more screenshots in /public/projects, shown after the thumbnail
   * in a row under the focused card. Most projects have none and show no row.
   */
  screenshots?: string[];
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
  /** Bullet points, one short sentence each. */
  points: string[];
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
