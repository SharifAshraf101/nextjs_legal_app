'use client';

import { useEffect } from 'react';
import { useAppState } from './useAppState';
import { loadSavedLegalOfficeDirectoryHandle } from '@/lib/disk';

// Source line 8098: setInterval(autoSyncAllSilent, AUTO_SYNC_INTERVAL_MS).
// The source uses 5 minutes; we keep that interval.
const AUTO_SYNC_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Periodic auto-sync. Mirrors the source's autoSyncAllSilent loop (line 8098).
 * Skipped when the document is hidden (`document.hidden`) and when no
 * directory handle has been chosen yet — same checks as the source.
 *
 * The actual file write integration ships in a follow-up. This hook handles
 * the timer and the visibility guard; when the FS write lands it gets called
 * from here.
 */
export function useAutoSync(): void {
  const { state } = useAppState();

  useEffect(() => {
    if (!state.hydrated) return;
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      if (typeof document === 'undefined') return;
      if (document.hidden) return;
      try {
        const handle = await loadSavedLegalOfficeDirectoryHandle();
        if (!handle) return;
        // Hook point for full FS Access write in a follow-up. The handle is
        // healthy at this point.
      } catch (err) {
        console.warn('[LegalOffice] auto-sync tick failed', err);
      }
    };

    const id = window.setInterval(tick, AUTO_SYNC_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [state.hydrated]);
}
