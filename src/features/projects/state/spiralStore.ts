import { create } from 'zustand';

export type SpiralMode = 'spiral' | 'list';

export interface FocusSnapshot {
  /** Card nearest the focus slot. */
  focused: number;
  /** Card whose details the panel shows, or null while the spiral travels. */
  panel: number | null;
  /** Card that has locked into focus, or null while anything is still moving. */
  settled: number | null;
}

interface SpiralState extends FocusSnapshot {
  /** Mode the visitor picked. Null until they use the toggle, so reduced motion can choose the default. */
  chosenMode: SpiralMode | null;
  /** Last card that locked into focus. Snapping measures travel from here. */
  anchor: number;
  /** True after the first scroll or drag inside the section. */
  hasScrolled: boolean;
  /** True once the visitor has moved on from the first card, which retires the intro caption. */
  introDone: boolean;
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
  panel: 0,
  settled: 0,
  anchor: 0,
  hasScrolled: false,
  introDone: false,
  pendingFocus: null,
  hovered: null,

  chooseMode: (mode) => set({ chosenMode: mode }),

  openInSpiral: (index) => set({ chosenMode: 'spiral', pendingFocus: index }),

  takePendingFocus: () => {
    const { pendingFocus } = get();
    if (pendingFocus !== null) set({ pendingFocus: null });
    return pendingFocus;
  },

  syncFocus: ({ focused, panel, settled }) => {
    const state = get();
    if (state.focused === focused && state.panel === panel && state.settled === settled) return;
    set({
      focused,
      panel,
      settled,
      anchor: settled ?? state.anchor,
      introDone: state.introDone || focused > 0,
    });
  },

  markScrolled: () => {
    if (!get().hasScrolled) set({ hasScrolled: true });
  },

  setHovered: (index) => {
    if (get().hovered !== index) set({ hovered: index });
  },
}));
