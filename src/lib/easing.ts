/** The site's one easing curve: a fast start that settles softly. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** The same curve for CSS and the Web Animations API. */
export const EASE_OUT_EXPO_CSS = 'cubic-bezier(0.16, 1, 0.3, 1)';
