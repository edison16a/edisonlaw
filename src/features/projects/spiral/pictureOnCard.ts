import { shownPicture, type GallerySelection } from '../gallery/selection';
import { FOCUS, slotOffset } from './geometry';

/**
 * Which of its project's `count` pictures a card shows. Every card shows the
 * thumbnail, except the card in the focus slot, which shows the screenshot
 * picked in the row. The same project further along the strand keeps its
 * thumbnail. `value` is the spiral's continuous index and `slots` the number
 * of cards on the strand. Pure, so it is unit tested.
 */
export function pictureOnCard(
  card: { slot: number; project: number },
  count: number,
  value: number,
  slots: number,
  selection: GallerySelection,
) {
  const inSlot = Math.abs(slotOffset(card.slot, value, slots)) < FOCUS.reach;
  return inSlot ? Math.min(shownPicture(selection, card.project), count - 1) : 0;
}
