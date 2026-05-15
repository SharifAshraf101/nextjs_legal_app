'use client';

import { useState, type FormEvent } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { useModalStack } from '@/hooks/useModalStack';
import { useT } from '@/hooks/useT';
import { caseName } from '@/lib/cases';
import { clientDisplayName } from '@/lib/clients';
import { defaultPaymentDescription, nextPaymentId } from '@/lib/finance';
import { Modal } from './Modal';
import type { Finance } from '@/types';

/**
 * Port of showAddPaymentModal (source line 4024).
 *
 * Pulls the case from `selectedFinanceCaseId`, locks client and case-type as
 * read-only inputs, and stamps the payment with today's ISO date. Falls back
 * to the type-label as description when the user leaves it blank.
 */
export function AddPaymentModal() {
  const { state, dispatch } = useAppState();
  const { t, lang } = useT();
  const modalStack = useModalStack();

  const c = state.casesArr.find((x) => x.id === state.selectedFinanceCaseId);
  const close = () => modalStack.close(modalStack.topId() ?? 0);

  if (!c) {
    // Source alerts here; we close immediately and surface the alert too.
    if (typeof window !== 'undefined') {
      window.alert(lang === 'ar' ? 'اختر ملفاً أولاً' : 'יש לבחור תיק קודם');
    }
    setTimeout(close, 0);
    return null;
  }

  const client = state.clients.find((x) => x.id === c.clientId);

  const [paymentType, setPaymentType] = useState('fee');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      window.alert(lang === 'ar' ? 'أدخل مبلغاً صحيحاً' : 'יש להזין סכום תקין');
      return;
    }
    const desc = description.trim();
    const today = new Date().toISOString().slice(0, 10);
    const heLabel = defaultPaymentDescription(paymentType, 'he');
    const arLabel = defaultPaymentDescription(paymentType, 'ar');
    const newPayment: Finance & { paid?: boolean } = {
      id: nextPaymentId(state.finances),
      caseId: c.id,
      description: desc || heLabel,
      descriptionAr: desc || arLabel,
      amount: amt,
      type: paymentType,
      date: today,
      paid: true,
    };
    dispatch({ type: 'SET_FINANCES', finances: [...state.finances, newPayment] });
    close();
  };

  return (
    <Modal onClose={close}>
      <h2>{lang === 'ar' ? 'إضافة دفعة' : 'הוספת תשלום'}</h2>
      <form id="addPaymentForm" className="form-grid finance-add-form" onSubmit={onSubmit}>
        <div className="form-field">
          <label>{t('clientName')}</label>
          <input value={clientDisplayName(client || ({} as never), lang)} readOnly />
        </div>
        <div className="form-field">
          <label>{t('caseType')}</label>
          <input value={caseName(c, lang)} readOnly />
        </div>
        <div className="form-field">
          <label>{lang === 'ar' ? 'نوع الدفعة' : 'סוג התשלום'}</label>
          <select
            id="paymentTypeInput"
            required
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
          >
            <option value="fee">{lang === 'ar' ? 'أتعاب' : 'שכר טרחה'}</option>
            <option value="court_fee">{lang === 'ar' ? 'رسوم' : 'אגרה'}</option>
            <option value="deposit">{lang === 'ar' ? 'وديعة' : 'פיקדון'}</option>
            <option value="misc">{lang === 'ar' ? 'متفرقات' : 'שונות'}</option>
          </select>
        </div>
        <div className="form-field">
          <label>{t('amount')}</label>
          <input
            id="paymentAmountInput"
            type="number"
            min="0"
            step="1"
            required
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label>{t('description')}</label>
          <textarea
            id="paymentDescInput"
            placeholder={lang === 'ar' ? 'وصف الدفعة' : 'תיאור התשלום'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button type="submit" className="save-payment">
            {t('save')}
          </button>
          <button
            type="button"
            className="cancel-payment"
            id="cancelPaymentBtn"
            onClick={close}
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
