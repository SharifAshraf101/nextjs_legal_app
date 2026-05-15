'use client';

import { useAppState } from '@/hooks/useAppState';
import { useModalStack } from '@/hooks/useModalStack';
import { useT } from '@/hooks/useT';
import { caseStatusView } from '@/lib/cases';
import { Modal } from './Modal';

/**
 * Port of showCaseStatusWarning (source line 4193) + changeCaseStatus
 * (source line 4194). The status toggles between 'active' and 'inactive'.
 */
export function CaseStatusWarning({ caseId }: { caseId: string }) {
  const { state, dispatch } = useAppState();
  const { t, lang } = useT();
  const modalStack = useModalStack();

  const c = state.casesArr.find((x) => x.id === caseId);
  if (!c) return null;

  const view = caseStatusView(c.status, t);
  const nextLabel = view.next === 'inactive' ? t('inactive') : t('active');
  const title =
    lang === 'ar' ? 'تحذير تغيير حالة الملف' : 'אזהרה - שינוי סטטוס תיק';
  const msg =
    lang === 'ar'
      ? `هل تريد تغيير حالة الملف إلى "${nextLabel}"؟`
      : `האם ברצונך לשנות את סטטוס התיק ל־"${nextLabel}"?`;
  const change = lang === 'ar' ? 'تغيير' : 'לשנות';

  const close = () => modalStack.close(modalStack.topId() ?? 0);
  const onConfirm = () => {
    dispatch({
      type: 'SET_CASES',
      cases: state.casesArr.map((x) =>
        x.id === caseId
          ? { ...x, status: x.status === 'inactive' ? 'active' : 'inactive' }
          : x,
      ),
    });
    close();
  };

  return (
    <Modal onClose={close}>
      <div className="case-status-warning">
        <div className="case-status-warning-icon">
          <i className="fas fa-triangle-exclamation" />
        </div>
        <div className="case-status-warning-content">
          <h2>{title}</h2>
          <p>{msg}</p>
        </div>
      </div>
      <div className="case-status-warning-actions">
        <button type="button" className="cancel" onClick={close}>
          {t('cancel')}
        </button>
        <button type="button" className="change" onClick={onConfirm}>
          {change}
        </button>
      </div>
    </Modal>
  );
}
