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
      'I own and develop the core full-stack production platform across backend APIs, databases, authentication, billing, cloud infrastructure, security, observability and analytics, working directly with the CEO and CTO on engineering and product. I architect and ship production systems including Stripe subscriptions and usage metering, multi-user organizations, project ingestion, database migrations, internal admin and analytics tooling, and Amazon SES/SNS email infrastructure.',
    earlier: {
      role: 'Software Engineer Intern',
      summary:
        'Built and deployed the full-stack web app and production infrastructure for a computational design platform with Google Cloud Run, Cloud SQL, Next.js, Vercel and OAuth. Integrated cloud-hosted scientific algorithms through authenticated services and production APIs, with streaming run state and cost tracking, and improved reliability, scalability and security through testing, rate limiting, access controls and deployment safeguards.',
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
      "Developed machine learning pipelines in Python on Linux in Google Cloud that score ultrasound scan quality and segment medical images with Meta's Segment Anything Model 3. Redesigned the frontend and built the authentication and database infrastructure with OAuth and Supabase.",
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
      'Developed an open source CLI dashboard for Weighted Ensemble simulation workflows that processes molecular dynamics data, and worked with the core maintainers on GitHub.',
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
      'Built data processing pipelines that analyze correlations and volatility between stocks and VIX futures, a Flutter iOS app that charts trading metrics, and C# backend features with LINQ that process market data for trading infrastructure.',
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
      'Built, launched and iterated on 10+ mobile apps and browser extensions used by 5,000+ people across many releases, including education, productivity and food allergy tools. Several extensions were featured by Google.',
    screen: 'apps',
  },
];
