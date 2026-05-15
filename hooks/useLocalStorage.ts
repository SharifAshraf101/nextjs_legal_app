'use client';

import { useCallback, useEffect, useState } from 'react';
import { lsGet, lsSet } from '@/lib/storage';

/**
 * SSR-safe localStorage hook. Returns the current value (string or null) and
 * a setter. The hook reads on mount (in useEffect) so the server-rendered
 * HTML stays consistent across all clients regardless of their stored value.
 *
 * Use this for plain string settings only. Complex domain data goes through
 * useAppState() which has explicit reducer actions.
 */
export function useLocalStorage(key: string, fallback: string | null = null) {
  const [value, setValue] = useState<string | null>(fallback);

  useEffect(() => {
    setValue(lsGet(key) ?? fallback);
    // We intentionally don't subscribe to `storage` events here — the source
    // app doesn't either, and adding it would change observed behavior.
  }, [key, fallback]);

  const set = useCallback(
    (next: string | null) => {
      setValue(next);
      if (next === null) {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      } else {
        lsSet(key, next);
      }
    },
    [key],
  );

  return [value, set] as const;
}
