'use client';

import { NavButtons } from './NavButtons';

/**
 * Bottom navigation. Visible only at ≤1050px per source CSS (line 68 of the
 * source's main stylesheet). Uses the same NavButtons component as the
 * desktop sidebar, so the active-tab logic stays consistent.
 */
export function MobileNav() {
  return (
    <nav className="mobile-nav" id="mobileNav">
      <NavButtons mobile />
    </nav>
  );
}
