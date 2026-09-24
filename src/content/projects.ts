import type { Project } from './types';

/** The project the spiral opens on. Change it to lead with a different one. */
export const featuredProjectId = 'backbond';

/**
 * Every project card in the spiral, in display order.
 * Drop a photo into /public/projects and set `image` to replace a generated cover.
 */
export const projects: Project[] = [
  {
    id: 'backbond',
    name: 'Backbond',
    org: 'Optagon Labs',
    badges: [],
    stack: ['Next.js', 'Vercel', 'Google Cloud Run', 'Cloud SQL', 'OAuth', 'Stripe', 'Amazon SES', 'Amazon SNS'],
    description:
      "Production platform for Optagon Labs' AI-native R&D for drug developers. I built the core infrastructure, including billing, usage metering, organizations and project ingestion.",
    links: [{ label: 'backbond.net', href: 'https://backbond.net' }],
    image: '/projects/backbond.webp',
  },
  {
    id: 'autolab',
    name: 'AutoLab',
    org: 'Neurotech@Berkeley',
    badges: ['In progress'],
    stack: ['Python', 'C++', 'Raspberry Pi', 'Computer Vision'],
    description:
      'Low-cost robotic platform for growing neuron cultures. It handles X, Y and Z motion, motorized pipetting, imaging and environmental control, so cultures can be kept alive and fed automatically for weeks.',
    links: [],
    image: '/projects/autolab.webp',
  },
  {
    id: 'westpa-dashboard',
    name: 'WESTPA CLI Dashboard',
    org: 'NumFOCUS',
    badges: [],
    stack: ['Python', 'WESTPA', 'MDAnalysis'],
    description:
      'Command line dashboard for Weighted Ensemble simulations. It tracks iteration summaries and reports molecular dynamics data, and I built it with the MDAnalysis and WESTPA maintainers.',
    links: [{ label: 'WESTPA on GitHub', href: 'https://github.com/westpa/westpa' }],
    image: '/projects/westpa-dashboard.webp',
  },
  {
    id: 'senseplan',
    name: 'SensePlan',
    badges: ['Winner, Luma A2A Agents Hackathon 2025', 'Best Use of Vapi'],
    stack: ['React', 'Next.js', 'Bright Data', 'Vapi'],
    description:
      'Autonomous AI agent that finds reputable local providers, from medical clinics to barbershops, and books appointments end to end over real phone calls. It beat 130+ engineers.',
    links: [],
    image: '/projects/senseplan.webp',
  },
  {
    id: 'callsense',
    name: 'CallSense',
    badges: ['Winner, Milpitas Hacks 2025'],
    stack: ['React', 'Next.js', 'Google Gemini API'],
    description:
      'Real-time transcription and summaries of 911 dispatcher calls. It highlights the key details, suggests follow-up questions and ranks incidents by priority.',
    links: [{ label: 'GitHub', href: 'https://github.com/edison16a/CallSense' }],
    image: '/projects/callsense.webp',
  },
  {
    id: 'flamesense',
    name: 'FlameSense',
    badges: ['Winner, Los Altos Hacks 2025'],
    stack: ['HTML/CSS', 'Keras'],
    description:
      'Wildfire spread simulator built on a sequential neural network trained on historical burn data and live weather. Pick a location and the predicted spread shows up as a heat map. It beat 350+ competitors.',
    links: [{ label: 'GitHub', href: 'https://github.com/edison16a/FlameSense' }],
    image: '/projects/flamesense.webp',
  },
  {
    id: 'safeeats',
    name: 'SafeEats',
    badges: ['App Store'],
    stack: ['Swift', 'SwiftUI', 'Vision'],
    description:
      'iOS food label scanner that flags allergens on ingredient lists in real time. It checks about 1,500 allergen keywords in six languages against the allergens you choose.',
    links: [
      { label: 'App Store', href: 'https://apps.apple.com/us/app/safeeats-food-scanner/id6739729515' },
      { label: 'GitHub', href: 'https://github.com/edison16a/SafeEats' },
    ],
    image: '/projects/safeeats.webp',
  },
  {
    id: 'betterbart',
    name: 'BetterBART',
    badges: [],
    stack: ['Next.js', 'React', 'JavaScript', 'SVG'],
    description:
      'A focused BART map, departures viewer and trip planner. Pick an origin and a destination, drag between stations, and follow one clear instruction at a time.',
    links: [
      { label: 'betterbart.vercel.app', href: 'https://betterbart.vercel.app' },
      { label: 'GitHub', href: 'https://github.com/edison16a/BetterBart' },
    ],
    image: '/projects/betterbart.webp',
  },
  {
    id: 'photo-craft',
    name: 'Photo Craft',
    badges: [],
    stack: ['Next.js', 'TypeScript', 'Konva', 'ONNX Runtime Web'],
    description:
      'Free photo editor with one-click background removal that runs entirely in the browser, so nothing gets uploaded. It exports transparent PNGs at any size, which Canva charges for.',
    links: [
      { label: 'photo-craft.vercel.app', href: 'https://photo-craft.vercel.app' },
      { label: 'GitHub', href: 'https://github.com/edison16a/photo-craft' },
    ],
    image: '/projects/photo-craft.webp',
  },
  {
    id: 'clue-ai',
    name: 'Clue.ai',
    badges: [],
    stack: ['Next.js', 'TypeScript', 'OpenAI API'],
    description:
      'AI learning assistant that helps students get unstuck on assignments with hints, clarifying questions and step-by-step guidance, without giving away the answer.',
    links: [{ label: 'GitHub', href: 'https://github.com/edison16a/clue-ai' }],
    image: '/projects/clue-ai.webp',
  },
  {
    id: 'trashgo',
    name: 'TrashGo',
    badges: ['Winner, CruzHacks 2023', 'Best Lightship AR VPS Game'],
    stack: ['Unity', 'C#', 'Niantic Lightship', 'VPS'],
    description:
      'Mobile AR game that discourages littering and rewards people for throwing trash away properly. It won out over 650+ participants.',
    links: [{ label: 'GitHub', href: 'https://github.com/Aldicodi/Cruzhacks-2023-TrashGo' }],
    image: '/projects/trashgo.webp',
  },
  {
    id: 'chrome-extensions',
    name: 'Chrome Extensions',
    badges: ['Featured by Google'],
    stack: ['JavaScript', 'HTML/CSS', 'Chrome Extensions API'],
    description:
      'A collection of browser extensions, part of the 10+ apps and extensions used by 5,000+ people. It includes SafeEats for Chrome, which rewrites online recipes around your allergies.',
    links: [],
    image: '/projects/chrome-extensions.webp',
  },
];
