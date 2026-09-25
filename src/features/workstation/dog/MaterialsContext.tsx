'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useDisposable } from '../useDisposable';
import { createDogMaterials, type CoatLight, type DogMaterials } from './materials';

const MaterialsContext = createContext<DogMaterials | null>(null);

/** Creates one material set for the dog, its coat lit by `coatLight` when given, and shares it with every part below. */
export function DogMaterialsProvider({ children, coatLight }: { children: ReactNode; coatLight?: CoatLight }) {
  const materials = useDisposable(() => createDogMaterials(coatLight));
  return <MaterialsContext.Provider value={materials}>{children}</MaterialsContext.Provider>;
}

export function useDogMaterials() {
  const materials = useContext(MaterialsContext);
  if (!materials) throw new Error('Dog parts must render inside DogMaterialsProvider.');
  return materials;
}
