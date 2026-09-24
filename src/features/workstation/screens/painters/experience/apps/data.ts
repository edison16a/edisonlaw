/**
 * Edison's real Chrome extensions and iOS app. The consoles show listings and settings only:
 * no user counts, ratings or download numbers, since those would be made up.
 */

export interface Extension {
  name: string;
  initials: string;
  color: string;
}

export const EXTENSIONS: Extension[] = [
  { name: 'SafeEats for Chrome', initials: 'SE', color: '#1e8e3e' },
  { name: 'UStock', initials: 'US', color: '#1967d2' },
  { name: 'Text & Image Replacer', initials: 'TR', color: '#e37400' },
];

/** The store listing open under the items table. */
export const LISTING = {
  item: EXTENSIONS[0],
  summary: 'Rewrites online recipes around your allergies.',
  file: 'safeeats-chrome.zip',
};

/** SafeEats on the App Store, matching the live listing. */
export const IOS_APP = {
  name: 'SafeEats: Food Scanner',
  category: 'Food & Drink',
  secondaryCategory: 'Utilities',
  version: '1.1',
  promo: [
    'Point your camera at an ingredient list and SafeEats flags',
    'the allergens you choose, in real time, in six languages.',
  ],
};

/** Allergen toggles on the settings screenshot. */
export const ALLERGENS: [string, boolean][] = [
  ['Peanuts', true],
  ['Milk', false],
  ['Gluten', true],
  ['Shellfish', false],
  ['Soy', false],
];
