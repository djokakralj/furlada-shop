'use client';

import { useCallback, useEffect, useState } from 'react';

// Stanje koje se čuva u localStorage. Na serveru i pri prvom renderu je
// `initial` (da ne bi bilo hydration greške); `hydrated` postaje true kad
// se vrednost učita iz browsera. Sinhronizuje se i između otvorenih tabova.
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- jednokratno čitanje iz browsera posle hidracije
      if (raw) setValue(JSON.parse(raw));
    } catch {
      // oštećen ili nedostupan storage — ostaje početna vrednost
    }
    setHydrated(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        setValue(e.newValue ? JSON.parse(e.newValue) : initial);
      } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}
