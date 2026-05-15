'use client';

import { useMemo, useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { useModalStack } from '@/hooks/useModalStack';
import { useT } from '@/hooks/useT';
import { caseName, caseSearchText, clientName } from '@/lib/cases';
import { CaseDetail } from './CaseDetail';

/**
 * Port of renderCases (source line 3898) + caseRows (line 3780) +
 * filterCasesScreen (line 4599).
 *
 * Source markup:
 *   <section class="panel cases-screen-panel">
 *     <div class="panel-body cases-panel-body">
 *       <div class="case-search-wrap"> label + input + meta </div>
 *       <div id="casesTableWrap" class="cases-scroll-list">
 *         <table class="table"> ... </table>
 *       </div>
 *     </div>
 *   </section>
 */
export function CasesScreen() {
  const { state } = useAppState();
  const { t, lang } = useT();
  const modalStack = useModalStack();
  const [query, setQuery] = useState('');

  const placeholder =
    lang === 'ar'
      ? 'بحث حسب اسم الموكل، رقم الهوية، الهاتف، نوع الدعوى، المحكمة أو رقم الملف في المحكمة'
      : 'חיפוש לפי שם לקוח, תעודת זהות, טלפון, סוג תביעה, בית משפט או מספר תיק בבית המשפט';
  const hint =
    lang === 'ar'
      ? 'يمكن البحث أيضاً حسب التفاصيل غير الظاهرة في الجدول.'
      : 'ניתן לחפש גם לפי פרטים שאינם מוצגים בטבלה.';
  const searchLabel = lang === 'ar' ? 'بحث في قضايا الموكلون' : 'חיפוש בתיקי הלקוחות';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return state.casesArr;
    return state.casesArr.filter((c) =>
      caseSearchText(c, state.clients).toLowerCase().includes(q),
    );
  }, [state.casesArr, state.clients, query]);

  const openCase = (id: string) => {
    modalStack.open(<CaseDetail caseId={id} />);
  };

  return (
    <section className="panel cases-screen-panel">
      <div className="panel-body cases-panel-body">
        <div className="case-search-wrap">
          <label>{searchLabel}</label>
          <input
            id="casesSearchInput"
            className="case-search-input"
            type="search"
            autoComplete="off"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="case-search-meta" id="casesSearchMeta">
            {hint}
          </div>
        </div>
        <div id="casesTableWrap" className="cases-scroll-list">
          <table className="table">
            <thead>
              <tr>
                <th>{t('caseType')}</th>
                <th>{t('clientName')}</th>
                <th>{t('court')}</th>
                <th>{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const court = lang === 'ar' ? c.courtAr || c.court : c.court;
                const statusKey =
                  c.status === 'active'
                    ? 'active'
                    : c.status === 'pending'
                      ? 'pending'
                      : 'inactive';
                return (
                  <tr
                    key={c.id}
                    className="case-row"
                    data-id={c.id}
                    onClick={() => openCase(c.id)}
                  >
                    <td>
                      <div className="row-title">{caseName(c, lang)}</div>
                      <div className="sub">
                        {t('caseNumber')}: {c.caseNumber}
                      </div>
                    </td>
                    <td>{clientName(c.clientId, state.clients, lang)}</td>
                    <td>{court}</td>
                    <td>
                      <span className={'status ' + statusKey}>{t(statusKey)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
