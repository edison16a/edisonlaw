import { create } from 'zustand';

export interface FocusSnapshot {
  /** Card whose details the panel shows, or null while the spiral travels. */
  panel: number | null;
  /** Card that has locked into focus, or null while anything is still moving. */
  settled: number | null;
}

interface SpiralState extends FocusSnapshot {
  /** True once the focused card's picture is on screen, so the controls around it can show. */
  ready: boolean;
  /** Project under the pointer in the spiral, or null. */
  hovered: number | null;
  /** True once the spiral canvas has failed, so the carousel takes over for the rest of the visit. */
  spiralFailed: boolean;

  syncFocus: (snapshot: FocusSnapshot) => void;
  /** The canvas has drawn the focused card. */
  markReady: () => void;
  /** The canvas went away, so a later one starts from nothing and the controls wait for it again. */
  resetSpiral: () => void;
  setHovered: (index: number | null) => void;
  failSpiral: () => void;
}

export const useSpiralStore = create<SpiralState>((set, get) => ({
  panel: null,
  settled: null,
  ready: false,
  hovered: null,
  spiralFailed: false,

  syncFocus: ({ panel, settled }) => {
    const state = get();
    if (state.panel === panel && state.settled === settled) return;
    set({ panel, settled });
  },

  markReady: () => {
    if (!get().ready) set({ ready: true });
  },

  resetSpiral: () => set({ panel: null, settled: null, ready: false, hovered: null }),

  setHovered: (index) => {
    if (get().hovered !== index) set({ hovered: index });
  },

  failSpiral: () => set({ spiralFailed: true }),
}));
