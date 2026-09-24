import { create } from 'zustand';
import { NO_SELECTION, selectPicture, type GallerySelection } from '../gallery/selection';

export interface FocusSnapshot {
  /** Card whose details the panel shows, or null while the spiral travels. */
  panel: number | null;
  /** Card that has locked into focus, or null while anything is still moving. */
  settled: number | null;
}

interface SpiralState extends FocusSnapshot {
  /** True once the focused card's picture is on screen, so the controls around it can show. */
  ready: boolean;
  /** True once the spiral canvas has failed, so the carousel takes over for the rest of the visit. */
  spiralFailed: boolean;
  /** The screenshot picked for the settled project. It resets whenever the spiral leaves that project. */
  gallery: GallerySelection;

  syncFocus: (snapshot: FocusSnapshot) => void;
  /** Shows picture `picture` of the `count` the settled project `project` has. */
  choosePicture: (project: number, picture: number, count: number) => void;
  /** The canvas has drawn the focused card. */
  markReady: () => void;
  /** The canvas went away, so a later one starts from nothing and the controls wait for it again. */
  resetSpiral: () => void;
  failSpiral: () => void;
}

export const useSpiralStore = create<SpiralState>((set, get) => ({
  panel: null,
  settled: null,
  ready: false,
  spiralFailed: false,
  gallery: NO_SELECTION,

  syncFocus: ({ panel, settled }) => {
    const state = get();
    if (state.panel === panel && state.settled === settled) return;
    // Any move away from the settled project puts its thumbnail back, so it always opens on it.
    set(settled === state.settled ? { panel, settled } : { panel, settled, gallery: NO_SELECTION });
  },

  choosePicture: (project, picture, count) => {
    if (get().settled !== project) return;
    set({ gallery: selectPicture(project, picture, count) });
  },

  markReady: () => {
    if (!get().ready) set({ ready: true });
  },

  resetSpiral: () => set({ panel: null, settled: null, ready: false, gallery: NO_SELECTION }),

  failSpiral: () => set({ spiralFailed: true }),
}));
