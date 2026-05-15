'use client';

import { useCallback } from 'react';
import { useAppState } from './useAppState';
import { settingsText, t, type TKey } from '@/lib/translations';
import type { Lang } from '@/types';

/**
 * Convenience hook so screens don't have to read `state.currentLang` and
 * thread it into every `t()` call. Matches the source's global `t(key)` and
 * `settingsText(he, ar)` usage.
 */
export function useT() {
  const { state } = useAppState();
  const lang = state.currentLang;
  const tt = useCallback((key: string) => t(key, lang), [lang]);
  const st = useCallback(
    (he: string, ar: string) => settingsText(he, ar, lang),
    [lang],
  );
  return { t: tt, settingsText: st, lang } as {
    t: (key: TKey | string) => string;
    settingsText: (he: string, ar: string) => string;
    lang: Lang;
  };
}
