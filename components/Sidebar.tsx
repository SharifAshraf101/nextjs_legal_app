'use client';

import { useAppState } from '@/hooks/useAppState';
import { useT } from '@/hooks/useT';
import { NavButtons } from './NavButtons';

/**
 * Desktop sidebar. Matches the structure of the source's renderShell()
 * sidebar block (line 3868):
 *
 *   .side-brand.office-side-brand
 *     .mark.office-logo-mark  (office logo image — placeholder for Stage 4a-1)
 *     <div>
 *       <b class="office-brand-name">{officeName || t('firmName')}</b>
 *       <span class="office-brand-address">{officeAddress || default address}</span>
 *     </div>
 *   .side-nav
 *     ...navButtons()
 *   .sidebar-footer
 *
 * The original embeds the office logo as a giant base64 PNG inline. We
 * preserve the layout and read the office name/address from app state so
 * editing them in Settings updates the brand block immediately, just like
 * the source's updateOfficeHeaderLive (line 5083).
 *
 * Hidden at widths ≤900px by the source CSS (`.sidebar { display: none; }`
 * inside `@media(max-width:1050px)` — see globals.css).
 */
export function Sidebar() {
  const { state } = useAppState();
  const { t, settingsText } = useT();

  const brandName = state.officeName || t('firmName');
  const defaultAddress = settingsText('הסורג 2, ירושלים', 'السورج 2، القدس');
  const brandAddress = state.officeAddress || defaultAddress;

  return (
    <aside className="sidebar" id="sidebar">
      <div className="side-brand office-side-brand">
        <div className="mark office-logo-mark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/office-logo.png" alt={brandName} />
        </div>
        <div>
          <b className="office-brand-name">{brandName}</b>
          <span className="office-brand-address">{brandAddress}</span>
        </div>
      </div>
      <div className="side-nav">
        <NavButtons />
      </div>
      <div className="sidebar-footer" />
    </aside>
  );
}
