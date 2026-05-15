'use client';

import { useEffect, useState } from 'react';

/**
 * Mobile breakpoint tracker. The v155 early resize guard (installed in
 * app/layout.tsx) already swallows mobile browser-chrome height-only resizes
 * before listeners see them; this hook exposes the resulting "is this a
 * mobile width" boolean to React components.
 *
 * Breakpoints match the source CSS:
 *   - isMobile1050: <= 1050px (sidebar hidden, mobile-nav shown)
 *   - isMobile900:  <= 900px  (used inside several vNNN scripts)
 *   - isMobile700:  <= 700px  (modal-fullscreen breakpoint)
 *   - isMobile620:  <= 620px  (compact summaries)
 */
export interface MobileFlags {
  isMobile1050: boolean;
  isMobile900: boolean;
  isMobile700: boolean;
  isMobile620: boolean;
}

const initial: MobileFlags = {
  isMobile1050: false,
  isMobile900: false,
  isMobile700: false,
  isMobile620: false,
};

function read(): MobileFlags {
  if (typeof window === 'undefined' || !window.matchMedia) return initial;
  return {
    isMobile1050: window.matchMedia('(max-width: 1050px)').matches,
    isMobile900: window.matchMedia('(max-width: 900px)').matches,
    isMobile700: window.matchMedia('(max-width: 700px)').matches,
    isMobile620: window.matchMedia('(max-width: 620px)').matches,
  };
}

export function useMobileGuard(): MobileFlags {
  const [flags, setFlags] = useState<MobileFlags>(initial);

  useEffect(() => {
    setFlags(read());
    const onResize = () => setFlags(read());
    // The v155 guard wraps this listener and drops height-only mobile resizes.
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return flags;
}
