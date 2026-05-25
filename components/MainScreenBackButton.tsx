'use client';

import { useAppState } from '@/hooks/useAppState';
import { useT } from '@/hooks/useT';

/**
 * Back-arrow button shown at the top-LEFT of every main tab screen
 * (Search / Clients / Cases / Documents / Calendar / Tasks / Finance).
 * Clicking it returns the user to the Home dashboard.
 *
 * Visual style mirrors `.client-detail-back-btn` — same height,
 * icon, padding, and hover treatment — but positioned on the left
 * edge of the screen panel via `.main-screen-back-btn` (see
 * globals.css). The parent panel must be `position: relative` for
 * the absolute positioning to anchor correctly.
 */
export function MainScreenBackButton() {
  const { dispatch } = useAppState();
  const { lang } = useT();
  const label = lang === 'ar' ? 'رجوع' : 'חזרה';
  return (
    <button
      type="button"
      className="main-screen-back-btn"
      aria-label={label}
      title={label}
      onClick={() => dispatch({ type: 'SET_TAB', tab: 'home' })}
    >
      <i className="fas fa-arrow-left" />
      <span>{label}</span>
    </button>
  );
}
