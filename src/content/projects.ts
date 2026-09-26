import type { Project } from './types';

/** The project the spiral opens on. Change it to lead with a different one. */
export const featuredProjectId = 'backbond';

/**
 * Every project card in the spiral, in display order.
 * Drop a photo into /public/projects and set `image` to replace a generated cover.
 * List up to four more in `screenshots` to give a project a row of screenshots.
 */
export const projects: Project[] = [
  {
    id: 'backbond',
    name: 'Backbond',
    badges: [],
    stack: ['Next.js', 'Vercel', 'Google Cloud Run', 'Cloud SQL', 'OAuth', 'Stripe', 'AWS', 'Amazon Bedrock'],
    description:
      'Computational design platform for R&D, developed at Optagon Labs. Built the core infrastructure, security and databases, plus billing, usage metering, organizations and project ingestion.',
    links: [{ label: 'backbond.net', href: 'https://backbond.net' }],
    image: '/projects/backbond.webp',
  },
  {
    id: 'standoff',
    name: 'Standoff',
    badges: [],
    stack: ['Next.js', 'React', 'TypeScript', 'Three.js', 'WebSockets', 'Redis', 'MediaPipe', 'Web Audio API'],
    description:
      'A game console for the web. Multiple phones can be used at the same time as controllers, with motion tracking, and some games use computer vision for movement. No installation needed, and up to six players pick from 11 games, including Magic Kart, Fruit Runner, Subway Runner, Zombie Survival and Shooting Gallery. The 3D games run on Three.js, and WebSockets and Redis keep the phones in sync with the screen.',
    links: [
      { label: 'standoff-five.vercel.app', href: 'https://standoff-five.vercel.app' },
      { label: 'GitHub', href: 'https://github.com/edison16a/standoff' },
    ],
    image: '/projects/standoff.webp',
  },
  {
    id: 'photo-craft',
    name: 'Photo Craft',
    badges: [],
    stack: ['Next.js', 'React', 'TypeScript', 'Konva', 'ONNX Runtime Web', 'Vercel'],
    description:
      'A free photo editor that runs in the browser. Background removal runs on your own device with ONNX Runtime Web, so nothing gets uploaded. It exports transparent PNGs at any size, which Canva charges for.',
    links: [
      { label: 'photo-craft.vercel.app', href: 'https://photo-craft.vercel.app' },
      { label: 'GitHub', href: 'https://github.com/edison16a/photo-craft' },
    ],
    image: '/projects/photo-craft.webp',
  },
  {
    id: 'autolab',
    name: 'AutoLab',
    badges: [],
    stack: ['Python', 'C++', 'Raspberry Pi', 'Computer Vision'],
    description:
      'A low-cost robot for growing neuron cultures, developed at Neurotech@Berkeley. It handles X, Y and Z motion, motorized pipetting, imaging and environmental control, so cultures stay alive and fed for weeks.',
    links: [],
    image: '/projects/autolab.webp',
  },
  {
    id: 'westpa-dashboard',
    name: 'WESTPA CLI Dashboard',
    badges: ['Open source contribution'],
    stack: ['Python', 'WESTPA', 'MDAnalysis', 'NumPy'],
    description:
      'A command line dashboard for Weighted Ensemble simulations, developed in the NumFOCUS ecosystem. It tracks iteration summaries and reports molecular dynamics data. Built with the MDAnalysis and WESTPA maintainers.',
    links: [{ label: 'WESTPA on GitHub', href: 'https://github.com/westpa/westpa' }],
    image: '/projects/westpa-dashboard.webp',
  },
  {
    id: 'senseplan',
    name: 'SensePlan',
    badges: [],
    win: { hackathon: 'Luma A2A Agents Hackathon 2025', prizes: ['Best Use of Vapi'] },
    stack: ['Next.js', 'React', 'TypeScript', 'Google Gemini API', 'Vapi', 'Bright Data', 'Model Context Protocol', 'Tailwind CSS'],
    description:
      'An AI agent that finds local providers, from clinics to barbershops, and books appointments over real phone calls. It searches with Bright Data, makes the calls with Vapi, and adds the booking to Google Calendar. Won the Luma A2A Agents Hackathon 2025 against 130+ engineers, plus Best Use of Vapi.',
    links: [],
    image: '/projects/senseplan.webp',
  },
  {
    id: 'flamesense',
    name: 'FlameSense',
    badges: [],
    win: { hackathon: 'Los Altos Hacks 2025' },
    stack: ['JavaScript', 'HTML', 'CSS', 'Leaflet', 'Palantir AIP', 'OpenStreetMap'],
    description:
      'A wildfire spread simulator. Pick a spot on the map and a model trained in Palantir AIP on past burns predicts how the fire spreads with the live weather there, shown as a heat map. Won Los Altos Hacks 2025 against 350+ competitors.',
    links: [{ label: 'GitHub', href: 'https://github.com/edison16a/FlameSense' }],
    image: '/projects/flamesense.webp',
  },
  {
    id: 'callsense',
    name: 'CallSense',
    badges: [],
    win: { hackathon: 'Milpitas Hacks 2025' },
    stack: ['Next.js', 'React', 'TypeScript', 'Google Gemini API', 'Web Speech API', 'Framer Motion'],
    description:
      'A live call assistant for 911 dispatchers. It transcribes the call as it happens, and Google Gemini pulls out the key details, suggests follow-up questions and ranks incidents by priority. Won Milpitas Hacks 2025.',
    links: [{ label: 'GitHub', href: 'https://github.com/edison16a/CallSense' }],
    image: '/projects/callsense.webp',
  },
  {
    id: 'trashgo',
    name: 'TrashGo',
    badges: [],
    win: { hackathon: 'CruzHacks 2023', prizes: ['Best Lightship AR VPS Game'] },
    stack: ['Unity', 'C#', 'Niantic Lightship', 'VPS'],
    description:
      'A sustainability AR game on the App Store. You pick up trash in a virtual park, then sort it into AR bins around you. Built in Unity with Niantic Lightship. Won CruzHacks 2023 and Best Lightship AR VPS Game against 650+ hackers.',
    links: [
      { label: 'App Store', href: 'https://apps.apple.com/us/app/trash-go/id6452390061' },
      { label: 'GitHub', href: 'https://github.com/Aldicodi/Cruzhacks-2023-TrashGo' },
    ],
    image: '/projects/trashgo.webp',
  },
  {
    id: 'text-image-replacer',
    name: 'Text & Image Replacer',
    badges: ['Featured on the Chrome Web Store'],
    users: '1k+',
    stack: ['JavaScript', 'HTML', 'CSS', 'Extensions API'],
    description:
      'A Chrome extension that swaps the text and images on any website for your own. Over 10,000 lifetime users. Built on Manifest V3, and it updates every open tab while it runs.',
    links: [
      {
        label: 'Chrome Web Store',
        href: 'https://chromewebstore.google.com/detail/text-image-replacer-exten/glamceigjodgbnfondkfloeoiikmlfno',
      },
    ],
    image: '/projects/text-image-replacer.webp',
  },
  {
    id: 'safeeats',
    name: 'SafeEats',
    badges: [],
    stack: ['Swift', 'SwiftUI', 'Vision', 'AVFoundation'],
    description:
      "An iOS app that scans food labels for allergens. It reads ingredient lists with Apple's Vision framework and checks about 1,500 allergen keywords in six languages against the allergens you pick.",
    links: [
      { label: 'App Store', href: 'https://apps.apple.com/us/app/safeeats-food-scanner/id6739729515' },
      { label: 'GitHub', href: 'https://github.com/edison16a/SafeEats' },
    ],
    image: '/projects/safeeats.webp',
  },
  {
    id: 'sunblock',
    name: 'SunBlock',
    badges: ['Featured on the Chrome Web Store'],
    users: '250+',
    stack: ['JavaScript', 'HTML', 'CSS', 'Extensions API'],
    description:
      'An ad blocker for Chrome with over 1,000 lifetime users. Ads get blocked before they load, using Chrome\'s declarativeNetRequest rules. You can pause it on a site, or click any element on a page to remove it.',
    links: [{ label: 'Chrome Web Store', href: 'https://chromewebstore.google.com/detail/sunblock/dokdhfglhjcdfjblneeaglmhbchkkafk' }],
    image: '/projects/sunblock.webp',
  },
  {
    id: 'poker-strategy-trainer',
    name: 'Poker Strategy Trainer',
    badges: [],
    stack: ['Next.js', 'React', 'TypeScript', 'CSS', 'Vercel', 'Vitest'],
    description:
      'A poker trainer with an AI coach that scores each fold, call or raise out of 100 and explains the best play. You climb Elo ranks from Bronze to Champion, and an Outs Trainer drills the odds. The scoring engine runs in the browser.',
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
    stack: ['Next.js', 'React', 'TypeScript', 'OpenAI API', 'Vercel', 'Vitest'],
    description:
      'An AI tutor that helps students get unstuck on assignments without giving away the answer. It gives hints and asks clarifying questions instead, using the OpenAI API.',
    links: [],
    image: '/projects/clue-ai.webp',
  },
  {
    id: 'personal-website',
    name: 'Personal Website',
    badges: [],
    stack: ['Next.js', 'React', 'TypeScript', 'Three.js', 'React Three Fiber', 'Tailwind CSS', 'Web Audio API', 'Vercel'],
    description:
      'This site. A WebGL spiral of projects, 3D desk scenes in React Three Fiber, and synthesized sound and music.',
    links: [{ label: 'GitHub', href: 'https://github.com/edison16a/edisonlaw' }],
    image: '/projects/personal-website.webp',
  },
  {
    id: 'betterbart',
    name: 'BetterBART',
    badges: [],
    stack: ['Next.js', 'React', 'JavaScript', 'SVG', 'CSS', 'Vercel'],
    description:
      'A UI mockup of a simpler BART map and trip planner. Pick two stations and follow one clear step at a time. Train times are placeholders until it gets BART API access.',
    links: [
      { label: 'betterbart.vercel.app', href: 'https://betterbart.vercel.app' },
      { label: 'GitHub', href: 'https://github.com/edison16a/BetterBart' },
    ],
    image: '/projects/betterbart.webp',
  },
];
