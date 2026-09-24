'use client';

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { createCharacterMaterials, disposeCharacterMaterials, type CharacterMaterials } from './materials';
import { createShirtTexture } from './textures/shirtPrint';

const MaterialsContext = createContext<CharacterMaterials | null>(null);

/** Creates one material set for a character and shares it with every part below. */
export function CharacterMaterialsProvider({ children }: { children: ReactNode }) {
  const { materials, shirtMap } = useMemo(() => {
    const map = createShirtTexture();
    return { materials: createCharacterMaterials(map), shirtMap: map };
  }, []);

  useEffect(
    () => () => {
      disposeCharacterMaterials(materials);
      shirtMap.dispose();
    },
    [materials, shirtMap],
  );

  return <MaterialsContext.Provider value={materials}>{children}</MaterialsContext.Provider>;
}

export function useCharacterMaterials() {
  const materials = useContext(MaterialsContext);
  if (!materials) throw new Error('Character parts must render inside CharacterMaterialsProvider.');
  return materials;
}
