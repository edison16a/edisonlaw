'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useDisposable } from '../useDisposable';
import { createCharacterMaterials, type CharacterMaterials } from './materials';

const MaterialsContext = createContext<CharacterMaterials | null>(null);

/** Creates one material set for a character and shares it with every part below. */
export function CharacterMaterialsProvider({ children }: { children: ReactNode }) {
  const materials = useDisposable(createCharacterMaterials);

  return <MaterialsContext.Provider value={materials}>{children}</MaterialsContext.Provider>;
}

export function useCharacterMaterials() {
  const materials = useContext(MaterialsContext);
  if (!materials) throw new Error('Character parts must render inside CharacterMaterialsProvider.');
  return materials;
}
