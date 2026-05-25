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
  const isReopening = view.next === 'active';

  const title =
    lang === 'ar'
      ? isReopening
        ? 'تحذير مهني — إعادة فتح ملف مغلق'
        : 'تحذير مهني — إغلاق الملف'
      : isReopening
        ? 'אזהרה מקצועית — פתיחה מחדש של תיק סגור'
        : 'אזהרה מקצועית — סגירת תיק';

  const msg = lang === 'ar'
    ? isReopening
      ? `أنت على وشك إعادة فتح هذا الملف وتغيير حالته إلى "${nextLabel}".\n\n• سيظهر الملف مجدداً في قائمة الملفات النشطة وفي جميع التقارير الجارية.\n• ستُستأنف التذكيرات والتنبيهات والمواعيد المرتبطة به.\n• يُسجَّل هذا التغيير في سجل الملف ويبقى مرئياً للمدقّقين.\n\nيرجى التأكيد فقط إذا كانت هناك حاجة مهنية لإعادة فتح الملف.`
      : `أنت على وشك إغلاق هذا الملف وتغيير حالته إلى "${nextLabel}".\n\n• سيُخفى الملف من قائمة الملفات النشطة وستتوقف التنبيهات المرتبطة به.\n• تبقى المهام والمواعيد والمستندات محفوظة، لكنّها لن تُعرض ضمن العمل اليومي.\n• يُسجَّل الإغلاق في سجل الملف وتبقى المسؤولية المهنية على ما تمّ توثيقه حتى هذه اللحظة.\n\nأكّد الإغلاق فقط بعد التحقق من إتمام جميع الإجراءات المهنية المطلوبة.`
    : isReopening
      ? `הינך עומד לפתוח מחדש תיק זה ולשנות את סטטוסו ל־"${nextLabel}".\n\n• התיק יחזור להופיע ברשימת התיקים הפעילים ובכל הדוחות השוטפים.\n• תזכורות, התראות ופגישות הקשורות לתיק יתחדשו.\n• השינוי יירשם בהיסטוריית התיק וייוותר גלוי לכל מבקר.\n\nאשר רק במידה וקיים צורך מקצועי בפתיחה מחדש של התיק.`
      : `הינך עומד לסגור תיק זה ולשנות את סטטוסו ל־"${nextLabel}".\n\n• התיק ייעלם מרשימת התיקים הפעילים, וההתראות הקשורות אליו ייפסקו.\n• משימות, אירועים ומסמכים יישמרו במלואם, אך לא יוצגו בעבודה השוטפת.\n• הסגירה תירשם בהיסטוריית התיק והאחריות המקצועית נותרת על המתועד עד לרגע זה.\n\nאשר את הסגירה רק לאחר שווידאת השלמת כל הפעולות המקצועיות הנדרשות.`;

  const change = lang === 'ar'
    ? isReopening ? 'إعادة الفتح' : 'إغلاق الملف'
    : isReopening ? 'פתיחה מחדש' : 'אשר סגירה';

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
          <p style={{ whiteSpace: 'pre-line' }}>{msg}</p>
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
