'use client';

import { useAppState } from '@/hooks/useAppState';
import { useModalStack } from '@/hooks/useModalStack';
import { useT } from '@/hooks/useT';
import { caseName, money } from '@/lib/cases';
import { clientDisplayName } from '@/lib/clients';
import {
  financeNonFeePaidItemsForCase,
  financePaidItemsForCase,
  financePaymentsForCase,
  paymentTypeLabel,
} from '@/lib/finance';
import { FinanceEdit } from './FinanceEdit';

/**
 * Port of renderFinanceDetail (source line 3900). Shown when currentTab is
 * `financeDetail`. Lists payments for the selected case + summary cards.
 */
export function FinanceDetail() {
  const { state } = useAppState();
  const { t, lang } = useT();
  const modalStack = useModalStack();

  const c =
    state.casesArr.find((x) => x.id === state.selectedFinanceCaseId) || state.casesArr[0];
  if (!c) {
    return (
      <section className="panel">
        <div className="panel-body">
          {lang === 'ar' ? 'لم يتم اختيار ملف' : 'לא נבחר תיק'}
        </div>
      </section>
    );
  }

  const client = state.clients.find((x) => x.id === c.clientId) || ({} as never);
  const payments = financePaymentsForCase(c.id, state.finances);
  const feeTotal = financePaidItemsForCase(c.id, state.finances).reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0,
  );
  const nonFeeTotal = financeNonFeePaidItemsForCase(c.id, state.finances).reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0,
  );
  const debt = Math.max(0, Number(c.agreedFee || 0) - feeTotal);
  const debtClass = debt > 0 ? 'debt' : 'clear';
  const zero = lang === 'ar' ? '0 ₪' : '0 ש״ח';

  return (
    <section className="panel finance-detail-panel">
      <div className="panel-body finance-detail-body">
        <h2 className="finance-detail-title">
          {lang === 'ar' ? 'الأتعاب' : 'שכר טרחה'}
        </h2>
        <div className="case-edit-toolbar finance-edit-toolbar">
          <button
            type="button"
            className="case-edit-btn"
            onClick={() => modalStack.open(<FinanceEdit caseId={c.id} />)}
          >
            <i className="fas fa-pen" />
            <span>{t('edit')}</span>
          </button>
        </div>
        <div className="finance-detail-grid">
          <div className="finance-detail-card">
            <span>{t('clientName')}</span>
            <strong>{clientDisplayName(client, lang)}</strong>
          </div>
          <div className="finance-detail-card">
            <span>{lang === 'ar' ? 'الملف المرتبط' : 'התיק הקשור'}</span>
            <strong>
              {caseName(c, lang)} · {c.caseNumber}
            </strong>
          </div>
          <div className="finance-detail-card">
            <span>{t('agreedFee')}</span>
            <strong>{money(c.agreedFee || 0)}</strong>
          </div>
          <div className="finance-detail-card">
            <span>
              {lang === 'ar'
                ? 'مجموع دفعات الأتعاب'
                : 'סך הכל תשלומי שכר טרחה'}
            </span>
            <strong>{money(feeTotal)}</strong>
          </div>
          <div className="finance-detail-card">
            <span>
              {lang === 'ar'
                ? 'رسوم، ودائع ومتفرقات'
                : 'סך תשלומי אגרות, פיקדונות ושונות'}
            </span>
            <strong>{money(nonFeeTotal)}</strong>
          </div>
          <div className="finance-detail-card">
            <span>{lang === 'ar' ? 'الدين المتبقي' : 'החוב הנותר'}</span>
            <button
              type="button"
              className={'finance-debt-pill ' + debtClass}
            >
              {debt > 0 ? money(debt) : zero}
            </button>
          </div>
        </div>

        <div className="finance-payments-section">
          <div className="finance-payments-divider" />
          <h3 className="finance-payments-title">
            {lang === 'ar' ? 'قائمة الدفعات' : 'רשימת התשלומים'}
          </h3>
          <div className="finance-payments-subtitle">
            {lang === 'ar'
              ? 'الدفعات التي دفعها الموكل'
              : 'התשלומים ששולמו על ידי הלקוח'}
          </div>
          <div className="finance-payments-list">
            {payments.length === 0 ? (
              <div className="case-empty">
                {lang === 'ar' ? 'لا توجد دفعات مسجلة' : 'אין תשלומים רשומים'}
              </div>
            ) : (
              payments.map((p) => {
                const desc = String(
                  (p.description || p.descriptionAr || '') as string,
                ).trim();
                return (
                  <div key={p.id} className="finance-payment-row">
                    <span className="payment-info">
                      <span className="payment-date">
                        {p.date || ''} · {paymentTypeLabel(p.type, lang)}
                      </span>
                      {desc && <span className="payment-desc">{desc}</span>}
                    </span>
                    <span className="payment-amount">{money(p.amount || 0)}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
