import { useCallback, useEffect, useState } from 'react';

import { localStore } from '@services/storage';

/**
 * `useState` clone that persists to localStorage and syncs across tabs.
 * Returns `[value, setValue, remove]` for symmetry with the underlying store.
 */
export const useLocalStorage = <T,>(
  key: string,
  initial: T,
): readonly [T, (next: T | ((prev: T) => T)) => void, () => void] => {
  const [value, setValue] = useState<T>(() => {
    const persisted = localStore.get<T>(key);
    return persisted ?? initial;
  });

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        localStore.set(key, v);
        return v;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    localStore.remove(key);
    setValue(initial);
  }, [key, initial]);

  useEffect(() => {
    const handler = (e: StorageEvent): void => {
      if (e.key !== key || e.newValue === null) return;
      try {
        setValue(JSON.parse(e.newValue) as T);
      } catch {
        /* ignore cross-tab parse mishaps */
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);

  return [value, set, remove] as const;
};
