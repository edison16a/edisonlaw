import type { Activity, Education, Honor, SkillGroup, Social } from './types';

export const intro = [
  "I'm a Bioengineering student at UC Berkeley, working toward a second major in EECS, and a software engineer.",
  'I like building where software, AI and biology meet, from production platforms for drug developers to robots that keep neuron cultures alive.',
];

export const email = 'edisonlaw@berkeley.edu';

export const socials: Social[] = [
  { kind: 'email', label: 'Email', href: `mailto:${email}`, display: email },
  { kind: 'github', label: 'GitHub', href: 'https://github.com/edison16a', display: 'github.com/edison16a' },
  {
    kind: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/edison-law-04a3ab290',
    display: 'linkedin.com/in/edison-law-04a3ab290',
  },
];

export const education: Education[] = [
  {
    school: 'University of California, Berkeley',
    detail: 'B.S. Bioengineering, intended second major in EECS',
    coursework: [
      'Structure and Interpretation of Computer Programs',
      'Linear Algebra & Differential Equations',
      'Multivariable Calculus',
    ],
  },
  {
    school: 'CodePath',
    detail: 'TIP102: Advanced Data Structures & Algorithms in Python',
    when: 'Summer 2026',
  },
];

export const skills: SkillGroup[] = [
  {
    category: 'Languages',
    items: ['TypeScript', 'JavaScript', 'Python', 'C++', 'C', 'C#', 'Java', 'SQL', 'Swift', 'HTML', 'CSS'],
  },
  {
    category: 'Web & Backend',
    items: ['React', 'Next.js', 'React Native', 'Node.js', 'FastAPI', 'Flask', 'Flutter', 'REST APIs'],
  },
  { category: 'Databases', items: ['PostgreSQL', 'Supabase', 'Cloud SQL'] },
  {
    category: 'AI & Data',
    items: ['PyTorch', 'NumPy', 'Pandas', 'OpenAI API', 'Google Vertex AI', 'Meta SAM 3'],
  },
  {
    category: 'Cloud & Infrastructure',
    items: ['Google Cloud Platform', 'Cloud Run', 'AWS', 'Docker', 'Vercel', 'Stripe', 'OAuth', 'Linux'],
  },
  { category: 'Dev Tools', items: ['Git', 'VS Code', 'Claude Code', 'Codex'] },
  { category: 'Scientific', items: ['MDAnalysis', 'WESTPA', 'Raspberry Pi'] },
];

export const honors: Honor[] = [
  { name: 'Disney Scholar', year: 2026 },
  { name: "UC Regents' Scholar", year: 2026 },
  { name: 'Eagle Scout', year: 2024 },
];

export const activities: Activity[] = [
  { name: 'CSUA', since: 'Sep 2026' },
  { name: 'IEEE', since: 'Sep 2026' },
  { name: 'BMES', since: 'Sep 2026' },
  { name: 'Poker at Berkeley', since: 'Sep 2026' },
  { name: 'Intramural Soccer', since: 'Sep 2026' },
];
