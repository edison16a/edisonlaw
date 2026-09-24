import { create } from 'zustand';
import type { SectionId } from '@/content/site';

interface NavState {
  active: SectionId;
  /** While a nav click is scrolling the page, the tracker leaves `active` alone. */
  lockedUntil: number;
  setActive: (id: SectionId) => void;
  lockTo: (id: SectionId, ms: number) => void;
}

export const useNavStore = create<NavState>((set) => ({
  active: 'projects',
  lockedUntil: 0,
  setActive: (id) => set((state) => (state.active === id ? state : { active: id })),
  lockTo: (id, ms) => set({ active: id, lockedUntil: performance.now() + ms }),
}));
