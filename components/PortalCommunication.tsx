'use client';

import { useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { useT } from '@/hooks/useT';
import { caseName } from '@/lib/cases';
import { normalizePhoneForLinks, whatsappUrl } from '@/lib/clients';
import { portalDefaultMessage, portalLabel } from '@/lib/portal';
import { PortalBot } from './PortalBot';

/**
 * Port of renderPortalCommunication (source line 4946).
 *
 * Shows the chosen client's communication hub: avatar / meta, WhatsApp +
 * phone buttons, embedded WhatsApp panel, cases list, then the bot card.
 */

function whatsappWebUrlLocal(phone: string, text: string): string {
  const p = normalizePhoneForLinks(phone);
  return 'https://web.whatsapp.com/send?phone=' + p + (text ? '&text=' + encodeURIComponent(text) : '');
}

export function PortalCommunication() {
  const { state, dispatch } = useAppState();
  const { lang } = useT();

  const c = state.clients.find(
    (x) => String(x.id) === String(state.selectedPortalClientId),
  );
  const [waPanelOpen, setWaPanelOpen] = useState(false);

  if (!c) {
    // selectedPortalClientId references a missing client → reset and fall back
    // to search. Same effect as the source's check in renderPortalCommunication.
    dispatch({ type: 'SET_PORTAL_CLIENT', clientId: '' });
    return null;
  }

  const name = lang === 'ar' ? c.nameAr || c.name : c.name || c.nameAr || '';
  const phone = c.phone || '';
  const msg = portalDefaultMessage(c, lang);
  const casesForClient = state.casesArr.filter((x) => x.clientId === c.id);
  const noCases =
    lang === 'ar' ? 'لا توجد ملفات مسجلة لهذا الموكل' : 'אין תיקים רשומים ללקוח זה';
  const waLabel =
    lang === 'ar' ? 'فتح واتساب داخل الشاشة' : 'פתיחת WhatsApp בתוך המסך';
  const callLabel = lang === 'ar' ? 'اتصال هاتفي' : 'שיחה טלפונית';
  const waPanelTitle =
    lang === 'ar' ? 'واتساب بزنس مدمج' : 'WhatsApp Business משולב';
  const waPanelNote =
    lang === 'ar'
      ? 'سيتم عرض واتساب داخل هذا القسم قدر الإمكان. إذا منع المتصفح العرض الداخلي، استخدم زر الفتح المباشر أدناه.'
      : 'WhatsApp יוצג בתוך אזור זה ככל שהדפדפן מאפשר. אם הדפדפן חוסם תצוגה פנימית, השתמש בכפתור הפתיחה הישירה למטה.';
  const waExternalLabel =
    lang === 'ar' ? 'فتح مباشر في واتساب' : 'פתיחה ישירה ב-WhatsApp';
  const closeWaLabel = lang === 'ar' ? 'إغلاق' : 'סגירה';

  return (
    <section className="panel clients-screen-panel portal-screen-panel">
      <div className="panel-head">
        <h2>{portalLabel(lang)}</h2>
        <button
          type="button"
          className="portal-back-btn"
          data-portal-back
          onClick={() => dispatch({ type: 'SET_PORTAL_CLIENT', clientId: '' })}
        >
          <i className="fas fa-arrow-right" />
          <span>{lang === 'ar' ? 'رجوع للبحث' : 'חזרה לחיפוש'}</span>
        </button>
      </div>
      <div className="panel-body clients-panel-body">
        <div className="portal-communication-card">
          <div className="portal-client-hero">
            <div className="portal-client-main">
              <div className="portal-client-avatar">{(name || '').slice(0, 1)}</div>
              <div>
                <div className="portal-client-name">{name}</div>
                <div className="portal-client-meta">
                  {lang === 'ar' ? 'رقم الهوية' : 'תעודת זהות'}: {c.idNumber || ''}
                  <br />
                  {lang === 'ar' ? 'الهاتف' : 'טלפון'}: {phone}
                </div>
              </div>
            </div>
            <div className="portal-communication-actions">
              <button
                type="button"
                className="portal-whatsapp-business-btn"
                data-open-portal-whatsapp={c.id}
                data-wa-url={whatsappWebUrlLocal(phone, msg)}
                data-wa-direct={whatsappUrl(phone, msg)}
                title={waLabel}
                aria-label={waLabel}
                onClick={() => setWaPanelOpen(true)}
              >
                <i className="fab fa-whatsapp" />
                <span>{waLabel}</span>
              </button>
              <a
                className="portal-phone-btn"
                href={'tel:' + normalizePhoneForLinks(phone)}
                title={callLabel}
                aria-label={callLabel}
              >
                <i className="fas fa-phone" />
                <span>{callLabel}</span>
              </a>
            </div>
          </div>

          <div
            className={'portal-wa-panel' + (waPanelOpen ? '' : ' is-hidden')}
            id="portalWhatsappPanel"
          >
            <div className="portal-wa-head">
              <div className="portal-wa-client">
                <span className="portal-wa-client-icon">
                  <i className="fab fa-whatsapp" />
                </span>
                <div>
                  <strong>
                    {waPanelTitle} — {name}
                  </strong>
                  <span>{phone}</span>
                </div>
              </div>
              <button
                type="button"
                className="portal-wa-close"
                aria-label={closeWaLabel}
                onClick={() => setWaPanelOpen(false)}
              >
                <i className="fas fa-xmark" />
              </button>
            </div>
            <div className="portal-wa-body">
              <div className="portal-wa-frame-wrap">
                <iframe
                  className="portal-wa-frame"
                  id="portalWhatsappFrame"
                  title={waPanelTitle}
                  src={waPanelOpen ? whatsappWebUrlLocal(phone, msg) : undefined}
                />
              </div>
              <div className="portal-wa-side">
                <div className="portal-wa-note">{waPanelNote}</div>
                <a
                  className="portal-wa-open-external"
                  href={whatsappUrl(phone, msg)}
                  target="_blank"
                  rel="noopener"
                >
                  <i className="fab fa-whatsapp" />
                  <span>{waExternalLabel}</span>
                </a>
              </div>
            </div>
          </div>

          <div className="portal-message-preview">
            <strong>{lang === 'ar' ? 'ملفات الموكل' : 'תיקי הלקוח'}:</strong>
            <br />
            {casesForClient.length === 0
              ? noCases
              : casesForClient.map((x) => (
                  <span key={x.id}>
                    {caseName(x, lang)} · {x.caseNumber || ''}
                    <br />
                  </span>
                ))}
          </div>

          <PortalBot clientId={c.id} />
        </div>
      </div>
    </section>
  );
}
