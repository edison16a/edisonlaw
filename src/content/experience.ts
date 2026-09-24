import type { Experience } from './types';

/** Work Experience timeline, newest first. */
export const experience: Experience[] = [
  {
    id: 'optagon',
    role: 'Software Engineer',
    company: 'Optagon Labs',
    context: 'Berkeley SkyDeck Batch 22',
    start: { year: 2026, month: 5 },
    end: 'present',
    summary:
      'I own the core full-stack platform, from APIs, databases and auth to billing, cloud infrastructure and analytics, and I work directly with the CEO and CTO. I shipped Stripe subscriptions, usage metering, multi-user organizations, project ingestion, admin tooling and SES/SNS email.',
    earlier: {
      role: 'Software Engineer Intern',
      summary:
        'Built and deployed the core app and cloud infrastructure for an AI computational design platform, and hooked up cloud-hosted scientific algorithms with streaming run state and cost tracking.',
    },
    screen: 'optagon',
  },
  {
    id: 'enhanced-ultrasound',
    role: 'Machine Learning Engineer Intern',
    company: 'Enhanced Ultrasound',
    context: 'Berkeley SkyDeck Incubator',
    start: { year: 2026, month: 6 },
    end: { year: 2026, month: 8 },
    summary:
      "Built AI and ML pipelines on Google Cloud that score ultrasound quality and segment medical images with Meta's SAM 3 on a Linux VM. Redesigned the frontend and built the auth and database infrastructure.",
    screen: 'ultrasound',
  },
  {
    id: 'westpa',
    role: 'Open Source Contributor',
    company: 'MDAnalysis & WESTPA',
    context: 'NumFOCUS',
    start: { year: 2026, month: 3 },
    end: { year: 2026, month: 6 },
    summary:
      'Architected a CLI dashboard for Weighted Ensemble simulation workflows. Worked with the core maintainers on requirements, issues and milestones.',
    screen: 'westpa',
  },
  {
    id: 'ucla',
    role: 'Researcher',
    company: 'UCLA Applications of Nanoscience',
    start: { year: 2025, month: 7 },
    end: { year: 2025, month: 7 },
    summary:
      'Prototyped and tested silver nanoparticle hydrogels for wound care, measuring stretchability, antimicrobial performance and biocompatibility.',
    screen: 'nanoscience',
  },
  {
    id: 'tanius',
    role: 'Software Engineer Intern',
    company: 'Tanius Technology LLC',
    start: { year: 2024, month: 6 },
    end: { year: 2024, month: 7 },
    summary:
      'Built data pipelines that measure correlation and volatility between stocks and VIX futures, a Flutter iOS app that charts trading metrics, and C# backend features with LINQ.',
    screen: 'tanius',
  },
  {
    id: 'cisco',
    role: 'Apprentice',
    company: 'Cisco Career Exploration Program',
    start: { year: 2024, month: 6 },
    end: { year: 2024, month: 8 },
    dateLabel: 'Summer 2024',
    summary:
      'A fully sponsored program. I joined workshops, hackathons and presentations, and met one-on-one with Cisco engineers and executives.',
    screen: 'cisco',
  },
  {
    id: 'stanford',
    role: 'Research Shadow',
    company: 'Stanford IFSS',
    start: { year: 2024, month: 6 },
    end: { year: 2024, month: 8 },
    dateLabel: 'Summer 2024',
    summary: 'Assisted Ph.D. researchers in chemistry and biology labs with wet lab work and data collection.',
    screen: 'stanford',
  },
  {
    id: 'app-developer',
    role: 'App Developer',
    company: 'Independent',
    context: 'Chrome Web Store and App Store',
    start: { year: 2022, month: 9 },
    end: 'present',
    summary:
      'Built, launched and kept improving 10+ mobile apps and browser extensions used by 5,000+ people, including education, productivity and food allergy tools. Several extensions were featured by Google.',
    screen: 'apps',
  },
];
