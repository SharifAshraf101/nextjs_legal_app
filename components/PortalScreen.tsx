'use client';

import { useAppState } from '@/hooks/useAppState';
import { useT } from '@/hooks/useT';
import { PortalSearch } from './PortalSearch';
import { PortalCommunication } from './PortalCommunication';
import { portalLabel } from '@/lib/portal';

/**
 * Portal screen entry point. Mirrors source line 4966:
 *   renderPortal = selectedPortalClientId ? renderPortalCommunication() : renderPortalSearch();
 *
 * The portal panel uses the same `clients-screen-panel` shell class as the
 * Contacts screen plus its own `portal-screen-panel` modifier.
 */
export function PortalScreen() {
  const { state } = useAppState();
  const { lang } = useT();
  // Pinned screen title via the panel-head — actual content swap below.
  void portalLabel(lang);

  if (state.selectedPortalClientId) {
    return <PortalCommunication />;
  }
  return <PortalSearch />;
}
