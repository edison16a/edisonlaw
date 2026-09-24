import { create } from 'zustand';

export interface FocusSnapshot {
  /** Card nearest the focus slot. */
  focused: number;
  /** Card whose details the panel shows, or null while the spiral travels. */
  panel: number | null;
  /** Card that has locked into focus, or null while anything is still moving. */
  settled: number | null;
  /** True while the spiral rests in the intro, before the first card. */
  inIntro: boolean;
}

interface SpiralState extends FocusSnapshot {
  /** True after the first scroll or drag inside the section. */
  hasScrolled: boolean;
  /** Project under the pointer in the spiral, or null. */
  hovered: number | null;
  /** True once the spiral canvas has failed, so the carousel takes over for the rest of the visit. */
  spiralFailed: boolean;

  syncFocus: (snapshot: FocusSnapshot) => void;
  markScrolled: () => void;
  setHovered: (index: number | null) => void;
  failSpiral: () => void;
}

export const useSpiralStore = create<SpiralState>((set, get) => ({
  focused: 0,
  panel: null,
  settled: null,
  inIntro: true,
  hasScrolled: false,
  hovered: null,
  spiralFailed: false,

  syncFocus: ({ focused, panel, settled, inIntro }) => {
    const state = get();
    const same =
      state.focused === focused && state.panel === panel && state.settled === settled && state.inIntro === inIntro;
    if (!same) set({ focused, panel, settled, inIntro });
  },

  markScrolled: () => {
    if (!get().hasScrolled) set({ hasScrolled: true });
  },

  setHovered: (index) => {
    if (get().hovered !== index) set({ hovered: index });
  },

  failSpiral: () => set({ spiralFailed: true }),
}));
