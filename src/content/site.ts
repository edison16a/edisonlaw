export const site = {
  name: 'Edison Law',
  tagline: 'Bioengineering and EECS at UC Berkeley. Software engineer.',
  description:
    'Edison Law is a Berkeley Bioengineering and EECS student and software engineer who builds where software, AI and biology meet.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://edisonlaw.vercel.app',
  locale: 'en_US',
} as const;

export const sections = [
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Work Experience' },
  { id: 'about', label: 'About Me' },
] as const;

export type SectionId = (typeof sections)[number]['id'];
