import type { Project } from './types';

/** The project the spiral opens on. Change it to lead with a different one. */
export const featuredProjectId = 'backbond';

/**
 * Every project card in the spiral, in display order.
 * Drop a photo into /public/projects and set `image` to replace a generated cover.
 * List up to four more in `screenshots` to give a project a row of screenshots, as Backbond,
 * Standoff and Photo Craft do.
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
    screenshots: ['/projects/backbond-2.webp'],
  },
  {
    id: 'standoff',
    name: 'Standoff',
    badges: [],
    stack: ['Next.js', 'React', 'TypeScript', 'Three.js', 'WebSockets', 'Redis', 'MediaPipe', 'Web Audio API', 'Vercel'],
    description:
      "A games console for the web. Everyone's phone becomes a motion controller, and some games use the computer's camera to track your whole body. There is nothing to install, and up to six players pick from 11 games, including Magic Kart, Fruit Ninja, Zombie Survival and Shooting Gallery.",
    links: [
      { label: 'standoff-five.vercel.app', href: 'https://standoff-five.vercel.app' },
      { label: 'GitHub', href: 'https://github.com/edison16a/standoff' },
    ],
    image: '/projects/standoff.webp',
    screenshots: [
      '/projects/standoff-2.webp',
      '/projects/standoff-3.webp',
      '/projects/standoff-4.webp',
      '/projects/standoff-5.webp',
    ],
  },
  {
    id: 'photo-craft',
    name: 'Photo Craft',
    badges: [],
    stack: ['Next.js', 'React', 'TypeScript', 'Konva', 'ONNX Runtime Web', 'Vercel'],
    description:
      'Free photo editor with one-click background removal that runs entirely in the browser, so nothing gets uploaded. It exports transparent PNGs at any size, which Canva charges for.',
    links: [
      { label: 'photo-craft.vercel.app', href: 'https://photo-craft.vercel.app' },
      { label: 'GitHub', href: 'https://github.com/edison16a/photo-craft' },
    ],
    image: '/projects/photo-craft.webp',
    screenshots: [
      '/projects/photo-craft-2.webp',
      '/projects/photo-craft-3.webp',
      '/projects/photo-craft-4.webp',
      '/projects/photo-craft-5.webp',
    ],
  },
  {
    id: 'personal-website',
    name: 'Personal Website',
    badges: [],
    stack: ['Next.js', 'React', 'TypeScript', 'Three.js', 'React Three Fiber', 'Tailwind CSS', 'Web Audio API', 'Vercel'],
    description:
      'The site you are on. Projects turn on a WebGL spiral, the desk scenes are 3D rooms built by hand in code, and every sound is synthesized from scratch.',
    links: [{ label: 'GitHub', href: 'https://github.com/edison16a/edisonlaw' }],
    image: '/projects/personal-website.webp',
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
    id: 'safeeats',
    name: 'SafeEats',
    badges: ['App Store'],
    stack: ['Swift', 'SwiftUI', 'Vision', 'AVFoundation'],
    description:
      'iOS food label scanner that flags allergens on ingredient lists in real time. It checks about 1,500 allergen keywords in six languages against the allergens you choose.',
    links: [
      { label: 'App Store', href: 'https://apps.apple.com/us/app/safeeats-food-scanner/id6739729515' },
      { label: 'GitHub', href: 'https://github.com/edison16a/SafeEats' },
    ],
    image: '/projects/safeeats.webp',
  },
  {
    id: 'text-image-replacer',
    name: 'Text & Image Replacer',
    badges: ['Featured on the Chrome Web Store'],
    stack: ['JavaScript', 'HTML', 'CSS', 'Chrome Extensions API'],
    description:
      'Chrome extension that replaces the text and images on any page with whatever you want, text, images or both, in one click from the toolbar. Nearly 900 people use it, and Google features it on the Chrome Web Store.',
    links: [
      {
        label: 'Chrome Web Store',
        href: 'https://chromewebstore.google.com/detail/text-image-replacer-exten/glamceigjodgbnfondkfloeoiikmlfno',
      },
    ],
    image: '/projects/text-image-replacer.webp',
  },
  {
    id: 'sunblock',
    name: 'SunBlock',
    badges: ['Featured on the Chrome Web Store', '5.0 stars'],
    stack: ['JavaScript', 'HTML', 'CSS', 'Chrome Extensions API'],
    description:
      "Ad and tracker blocker built on Chrome's declarativeNetRequest, so ads are dropped before they ever load. It counts everything it blocks, pauses on any site you choose, and has a Zapper that removes any element you click.",
    links: [{ label: 'Chrome Web Store', href: 'https://chromewebstore.google.com/detail/sunblock/dokdhfglhjcdfjblneeaglmhbchkkafk' }],
    image: '/projects/sunblock.webp',
  },
  {
    id: 'poker-strategy-trainer',
    name: 'Poker Strategy Trainer',
    badges: [],
    stack: ['Next.js', 'React', 'TypeScript', 'CSS', 'Vercel'],
    description:
      'Poker puzzle trainer with an AI Coach that scores every fold, call or raise out of 100 and gives the best action with its reasons. Your Elo rank climbs from Bronze to Champion, an Outs Trainer drills the maths, and Hands, Playthrough and Full Game modes go from single spots to whole hands.',
    links: [
      { label: 'poker-strats.vercel.app', href: 'https://poker-strats.vercel.app' },
      { label: 'GitHub', href: 'https://github.com/edison16a/poker-strategy-trainer' },
    ],
    image: '/projects/poker-strategy-trainer.webp',
  },
  {
    id: 'clue-ai',
    name: 'Clue.ai',
    badges: [],
    stack: ['Next.js', 'React', 'TypeScript', 'OpenAI API', 'Vercel'],
    description:
      'AI learning assistant that helps students get unstuck on assignments with hints, clarifying questions and step-by-step guidance, without giving away the answer.',
    links: [],
    image: '/projects/clue-ai.webp',
  },
  {
    id: 'betterbart',
    name: 'BetterBART',
    badges: ['UI mockup'],
    stack: ['Next.js', 'React', 'JavaScript', 'SVG', 'Vercel'],
    description:
      'A UI mockup of a focused BART map, departures viewer and trip planner. Pick an origin and a destination, drag between stations, and follow one clear instruction at a time. Its train times are placeholders until it gets BART API access.',
    links: [
      { label: 'betterbart.vercel.app', href: 'https://betterbart.vercel.app' },
      { label: 'GitHub', href: 'https://github.com/edison16a/BetterBart' },
    ],
    image: '/projects/betterbart.webp',
  },
  {
    id: 'trashgo',
    name: 'TrashGo',
    badges: ['App Store'],
    win: { hackathon: 'CruzHacks 2023', prizes: ['Best Lightship AR VPS Game'] },
    stack: ['Unity', 'C#', 'Niantic Lightship', 'VPS'],
    description:
      'Sustainability AR game on the App Store as Trash Go. You pick up trash in a virtual park and sort it into AR bins. It won the CruzHacks 2023 hackathon and Best Lightship AR VPS Game, beating 650+ hackers.',
    links: [
      { label: 'App Store', href: 'https://apps.apple.com/us/app/trash-go/id6452390061' },
      { label: 'GitHub', href: 'https://github.com/Aldicodi/Cruzhacks-2023-TrashGo' },
    ],
    image: '/projects/trashgo.webp',
  },
  {
    id: 'senseplan',
    name: 'SensePlan',
    badges: [],
    win: { hackathon: 'Luma A2A Agents Hackathon 2025', prizes: ['Best Use of Vapi'] },
    stack: ['Next.js', 'React', 'TypeScript', 'Google Gemini API', 'Vapi', 'Bright Data', 'Model Context Protocol', 'Tailwind CSS'],
    description:
      'AI agent that finds reputable local providers, from clinics to barbershops, with Bright Data search, books the appointment over a real phone call with Vapi, and adds it to Google Calendar. It won the Luma A2A Agents Hackathon 2025 against 130+ engineers, and Best Use of Vapi too.',
    links: [],
    image: '/projects/senseplan.webp',
  },
  {
    id: 'callsense',
    name: 'CallSense',
    badges: [],
    win: { hackathon: 'Milpitas Hacks 2025' },
    stack: ['Next.js', 'React', 'TypeScript', 'Google Gemini API', 'Web Speech API'],
    description:
      'Live call transcription for 911 dispatchers. Google Gemini pulls out the key details as the caller talks, suggests follow-up questions, and ranks incidents in a priority queue. It won the Milpitas Hacks 2025 hackathon.',
    links: [{ label: 'GitHub', href: 'https://github.com/edison16a/CallSense' }],
    image: '/projects/callsense.webp',
  },
  {
    id: 'flamesense',
    name: 'FlameSense',
    badges: [],
    win: { hackathon: 'Los Altos Hacks 2025' },
    stack: ['JavaScript', 'HTML', 'CSS', 'Leaflet', 'Palantir AIP'],
    description:
      'Wildfire spread simulator built on a neural network trained in Palantir AIP on historical burns and conditions like temperature, humidity and wind. Pick a spot on the map and the predicted spread grows as a heat map, using the live weather there. It won the Los Altos Hacks 2025 hackathon against 350+ competitors.',
    links: [{ label: 'GitHub', href: 'https://github.com/edison16a/FlameSense' }],
    image: '/projects/flamesense.webp',
  },
];
