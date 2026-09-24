/** `work`: seated and typing, seen from behind. `about`: standing and looking at the screens. */
export type StageVariant = 'work' | 'about';

/** How the canvas schedules frames: continuously, only when asked, or not at all while off-screen. */
export type Frameloop = 'always' | 'demand' | 'never';
