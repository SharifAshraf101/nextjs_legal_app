'use client';

import { useState, type FormEvent } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { useT } from '@/hooks/useT';
import { portalAccessText, portalClientMatchesCredentials } from '@/lib/portal';

/**
 * Port of renderPortalClientLoginCard (source line 4736) + handlePortalClientLogin
 * (4739). Lets a client log into the bot using ID number + phone instead of
 * the operator's manual picker. Renders below the search list on the portal
 * tab.
 */
export function PortalLoginCard() {
  const { state, dispatch } = useAppState();
  const { lang } = useT();
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const client = state.clients.find((c) =>
      portalClientMatchesCredentials(c, idNumber, phone),
    );
    if (!client) {
      setMessage({ kind: 'error', text: portalAccessText('bad', lang) });
      return;
    }
    setMessage({ kind: 'ok', text: portalAccessText('ok', lang) });
    // Slight delay so the success message shows before swapping panels.
    setTimeout(() => {
      dispatch({ type: 'SET_PORTAL_CLIENT', clientId: client.id });
    }, 250);
  };

  return (
    <div className="portal-client-login-card">
      <div className="portal-client-login-head">
        <span className="portal-client-login-icon">
          <i className="fas fa-user-lock" />
        </span>
        <div>
          <div>{portalAccessText('title', lang)}</div>
          <div className="portal-client-login-sub">
            {portalAccessText('sub', lang)}
          </div>
        </div>
      </div>
      <form className="portal-client-login-form" id="portalClientLoginForm" onSubmit={onSubmit}>
        <div className="portal-client-login-field">
          <label>{portalAccessText('id', lang)}</label>
          <input
            id="portalLoginId"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
          />
        </div>
        <div className="portal-client-login-field">
          <label>{portalAccessText('phone', lang)}</label>
          <input
            id="portalLoginPhone"
            type="tel"
            autoComplete="off"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <button type="submit">
          <i className="fas fa-right-to-bracket" />
          <span>{portalAccessText('login', lang)}</span>
        </button>
      </form>
      {message && (
        <div
          className={
            'portal-login-message ' + (message.kind === 'ok' ? 'ok' : 'error')
          }
          id="portalLoginMessage"
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
