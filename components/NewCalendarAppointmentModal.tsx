'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { useModalStack } from '@/hooks/useModalStack';
import { useT } from '@/hooks/useT';
import { caseName } from '@/lib/cases';
import { clientDisplayName } from '@/lib/clients';
import { composeDateTime, localDateParts, limitedHourOptions, minuteOptions } from '@/lib/dates';
import { pad } from '@/lib/utils';
import { Modal } from './Modal';
import type { CalendarEvent } from '@/types';

/**
 * Port of showNewCalendarAppointmentModal (source line 4419).
 *
 * Calendar tab quick-action. Constrained to "court-day hours" 07-20.
 * Inline client search dropdown; once a client is chosen the case dropdown
 * populates with only that client's cases.
 */

const NATURE_AR_MAP: Record<string, string> = {
  'דיון מקדמי': 'جلسة تمهيدية',
  'דיון הוכחות': 'جلسة إثباتات',
  'סיכומים בעל פה': 'تلخيصات شفوية',
  'פגישה עם הלקוח': 'اجتماع مع الموكل',
};

function nextEventId(events: CalendarEvent[]): string {
  let max = 0;
  for (const e of events) {
    const n = parseInt(String(e.id || '').replace(/\D/g, ''), 10);
    if (!isNaN(n) && n > max) max = n;
  }
  return 'EV-' + (max + 1);
}

export function NewCalendarAppointmentModal() {
  const { state, dispatch } = useAppState();
  const { t, lang } = useT();
  const modalStack = useModalStack();

  const nowParts = localDateParts();
  const currentHour = Number(nowParts.hour);
  const selectedHourInitial =
    currentHour >= 7 && currentHour <= 20 ? nowParts.hour : '07';

  const [dateStr, setDateStr] = useState(nowParts.date);
  const [hour, setHour] = useState(selectedHourInitial);
  const [minute, setMinute] = useState(nowParts.minute);
  const [nature, setNature] = useState('דיון מקדמי');
  const [clientQuery, setClientQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState('');

  const close = () => modalStack.close(modalStack.topId() ?? 0);

  const clientResults = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();
    const list = q
      ? state.clients.filter((c) =>
          [c.name, c.nameAr, c.idNumber, c.phone]
            .filter(Boolean)
            .join(' · ')
            .toLowerCase()
            .includes(q),
        )
      : state.clients;
    return list.slice(0, 12);
  }, [state.clients, clientQuery]);

  const clientCases = useMemo(
    () => state.casesArr.filter((c) => c.clientId === selectedClientId),
    [state.casesArr, selectedClientId],
  );

  const onChooseClient = (id: string) => {
    const c = state.clients.find((x) => x.id === id);
    if (!c) return;
    setSelectedClientId(c.id);
    setClientQuery(clientDisplayName(c, lang));
    setShowResults(false);
    // Default-select first case of this client, mirroring source.
    const first = state.casesArr.find((cs) => cs.clientId === c.id);
    setSelectedCaseId(first?.id ?? '');
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      window.alert(
        lang === 'ar' ? 'يجب اختيار موكل من القائمة' : 'יש לבחור לקוח מהרשימה',
      );
      return;
    }
    if (!selectedCaseId) {
      window.alert(
        lang === 'ar'
          ? 'يجب اختيار نوع الدعوى المرتبطة'
          : 'יש לבחור את סוג התביעה הקשורה ללקוח',
      );
      return;
    }
    const dtStr = composeDateTime(dateStr, hour, minute);
    if (!dtStr) {
      window.alert(
        lang === 'ar' ? 'أدخل تاريخ ووقت الجلسة' : 'יש להזין תאריך ושעת דיון',
      );
      return;
    }
    const composed = new Date(dtStr);
    const natureAr = NATURE_AR_MAP[nature] || nature;
    const type = nature === 'פגישה עם הלקוח' ? 'meeting' : 'hearingMeeting';
    const ev: CalendarEvent = {
      id: nextEventId(state.eventsList),
      caseId: selectedCaseId,
      clientId: selectedClientId,
      client_source_id: selectedClientId,
      case_source_id: selectedCaseId,
      title: nature,
      titleAr: natureAr,
      dateTime: composed.toISOString(),
      description: nature,
      descriptionAr: natureAr,
      type,
    };
    dispatch({ type: 'SET_EVENTS', events: [...state.eventsList, ev] });
    dispatch({ type: 'SET_TAB', tab: 'calendar' });
    dispatch({ type: 'SET_CALENDAR_VIEW', view: 'list' });
    dispatch({ type: 'SET_CALENDAR_FOCUS', date: composed });
    close();
  };

  const dateLabel = lang === 'ar' ? 'تاريخ ووقت الجلسة' : 'תאריך ושעת דיון';
  const hourLabel = lang === 'ar' ? 'الساعة' : 'שעה';
  const minuteLabel = lang === 'ar' ? 'الدقائق' : 'דקות';
  const natureLabel =
    lang === 'ar' ? 'ماهية الموعد الجديد' : 'מהות המועד החדש';
  const clientSearchLabel =
    lang === 'ar' ? 'بحث عن الموكل' : 'חיפוש שם הלקוח';
  const caseTypeLabel =
    lang === 'ar'
      ? 'نوع الدعوى المرتبطة بالموكل'
      : 'סוג התביעה הקשורה לאותו לקוח';
  const formTitle = lang === 'ar' ? 'إضافة موعد جديد' : 'הוספת מועד חדש';
  const clientPlaceholder =
    lang === 'ar'
      ? 'اكتب اسم الموكل، رقم الهوية أو الهاتف'
      : 'הקלד שם לקוח, תעודת זהות או טלפון';

  // Hour options dangerously SetInnerHTML-style → we expand for React clarity.
  const hourOptionsHtml = limitedHourOptions(selectedHourInitial, 7, 20);
  const minuteOptionsHtml = minuteOptions(nowParts.minute);

  return (
    <Modal onClose={close}>
      <h2>{formTitle}</h2>
      <form id="newCalendarAppointmentForm" className="form-grid" onSubmit={onSubmit}>
        <div className="form-field">
          <label>{dateLabel}</label>
          <div className="time-row">
            <div>
              <label>{t('date')}</label>
              <input
                id="appointmentDateInput"
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                required
              />
            </div>
            <div>
              <label>{hourLabel}</label>
              <select
                id="appointmentHourInput"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                dangerouslySetInnerHTML={{ __html: hourOptionsHtml }}
              />
            </div>
            <div>
              <label>{minuteLabel}</label>
              <select
                id="appointmentMinuteInput"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                dangerouslySetInnerHTML={{ __html: minuteOptionsHtml }}
              />
            </div>
          </div>
        </div>

        <div className="form-field">
          <label>{natureLabel}</label>
          <select
            id="appointmentNatureInput"
            required
            value={nature}
            onChange={(e) => setNature(e.target.value)}
          >
            <option value="דיון מקדמי">דיון מקדמי</option>
            <option value="דיון הוכחות">דיון הוכחות</option>
            <option value="סיכומים בעל פה">סיכומים בעל פה</option>
            <option value="פגישה עם הלקוח">פגישה עם הלקוח</option>
          </select>
        </div>

        <div className="form-field search-box">
          <label>{clientSearchLabel}</label>
          <input
            id="appointmentClientSearchInput"
            autoComplete="off"
            placeholder={clientPlaceholder}
            required
            value={clientQuery}
            onChange={(e) => {
              setClientQuery(e.target.value);
              setSelectedClientId('');
              setSelectedCaseId('');
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 180)}
          />
          <div
            id="appointmentClientResults"
            className={'case-results' + (showResults ? '' : ' is-hidden')}
          >
            {clientResults.length === 0 ? (
              <div className="case-result">
                <strong>{lang === 'ar' ? 'لا توجد نتائج' : 'לא נמצאו תוצאות'}</strong>
              </div>
            ) : (
              clientResults.map((c) => (
                <div
                  key={c.id}
                  className="case-result"
                  data-client-id={c.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChooseClient(c.id);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    onChooseClient(c.id);
                  }}
                >
                  <strong>{clientDisplayName(c, lang)}</strong>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="form-field">
          <label>{caseTypeLabel}</label>
          <select
            id="appointmentCaseInput"
            required
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
          >
            {!selectedClientId ? (
              <option value="">
                {lang === 'ar' ? 'اختر موكلاً أولاً' : 'בחר לקוח תחילה'}
              </option>
            ) : clientCases.length === 0 ? (
              <option value="">
                {lang === 'ar' ? 'لا توجد قضايا لهذا الموكل' : 'אין תיקים ללקוח זה'}
              </option>
            ) : (
              clientCases.map((c) => (
                <option key={c.id} value={c.id}>
                  {caseName(c, lang)} · {c.caseNumber || ''}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-calendar-yellow">
            <i className="fas fa-check" />
            {t('save')}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            id="cancelAppointmentBtn"
            onClick={close}
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
