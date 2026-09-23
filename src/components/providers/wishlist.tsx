'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import { useLocalStorage } from './use-local-storage';

// Čuvaju se samo ID-jevi — podaci (cena, slika) se uvek čitaju sveži iz baze
type WishlistContextValue = {
  ids: string[];
  hydrated: boolean;
  has: (id: string) => boolean;
  toggle: (id: string) => boolean; // vraća true ako je dodat
  remove: (id: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds, hydrated] = useLocalStorage<string[]>('furlada:wishlist', []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    (id: string) => {
      const adding = !ids.includes(id);
      setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
      return adding;
    },
    [ids, setIds],
  );

  const remove = useCallback(
    (id: string) => setIds((prev) => prev.filter((x) => x !== id)),
    [setIds],
  );

  const value = useMemo(
    () => ({ ids, hydrated, has, toggle, remove }),
    [ids, hydrated, has, toggle, remove],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist mora biti unutar WishlistProvider');
  return ctx;
}
