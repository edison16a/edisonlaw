import { create } from 'zustand';

export type SpiralMode = 'spiral' | 'list';

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
  /** Mode the visitor picked. Null until they use the toggle, so reduced motion can choose the default. */
  chosenMode: SpiralMode | null;
  /** True after the first scroll or drag inside the section. */
  hasScrolled: boolean;
  /** Card the spiral should open on, set when a list row is chosen. */
  pendingFocus: number | null;
  /** Project under the pointer in the spiral, or null. */
  hovered: number | null;

  chooseMode: (mode: SpiralMode) => void;
  openInSpiral: (index: number) => void;
  /** Returns the pending card, if any, and clears it. */
  takePendingFocus: () => number | null;
  syncFocus: (snapshot: FocusSnapshot) => void;
  markScrolled: () => void;
  setHovered: (index: number | null) => void;
}

export const useSpiralStore = create<SpiralState>((set, get) => ({
  chosenMode: null,
  focused: 0,
  panel: null,
  settled: null,
  inIntro: true,
  hasScrolled: false,
  pendingFocus: null,
  hovered: null,

  chooseMode: (mode) => set({ chosenMode: mode }),

  openInSpiral: (index) => set({ chosenMode: 'spiral', pendingFocus: index }),

  takePendingFocus: () => {
    const { pendingFocus } = get();
    if (pendingFocus !== null) set({ pendingFocus: null });
    return pendingFocus;
  },

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
}));
