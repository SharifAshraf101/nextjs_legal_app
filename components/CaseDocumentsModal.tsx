'use client';

import { useAppState } from '@/hooks/useAppState';
import { useModalStack } from '@/hooks/useModalStack';
import { useT } from '@/hooks/useT';
import { caseName, clientName } from '@/lib/cases';
import {
  caseDocumentsForCase,
  documentTypeLabel,
  formatDocumentDate,
  formatDocumentSize,
} from '@/lib/documents';
import { Modal } from './Modal';

/**
 * Port of showCaseDocumentsModal (source line 3717) + caseDocumentsModalRows
 * (3704) + deleteDocumentFromCaseDocumentsModal (3763).
 *
 * The actual upload-file-to-disk flow lands in Stage 5 with the full FS
 * Access integration. For now the upload button surfaces a friendly notice
 * and the sync button uses the same handle dance as the Documents screen.
 */
export interface CaseDocumentsModalProps {
  caseId: string;
}

export function CaseDocumentsModal({ caseId }: CaseDocumentsModalProps) {
  const { state, dispatch } = useAppState();
  const { lang } = useT();
  const modalStack = useModalStack();

  const c = state.casesArr.find((x) => String(x.id) === String(caseId));
  if (!c) return null;

  const docs = caseDocumentsForCase(caseId, state.documentsArr, state.tasksArr);
  const close = () => modalStack.close(modalStack.topId() ?? 0);

  const uploadLabel = lang === 'ar' ? 'رفع مستند جديد' : 'העלאת מסמך חדש';
  const syncLabel = lang === 'ar' ? 'مزامنة القضية' : 'סנכרון תיק';
  const title = lang === 'ar' ? 'مستندات القضية' : 'מסמכי התיק';
  const sub = [caseName(c, lang), c.caseNumber, clientName(c.clientId, state.clients, lang)]
    .filter(Boolean)
    .join(' · ');

  const onUpload = () => {
    window.alert(
      lang === 'ar'
        ? 'رفع المستند يتطلب اختيار مجلد Dropbox أولاً. الميزة الكاملة في Stage 5.'
        : 'העלאת המסמך דורשת בחירת תיקיית Dropbox. הפעולה המלאה ב-Stage 5.',
    );
  };
  const onSync = () => {
    window.alert(
      lang === 'ar'
        ? 'سنقوم بإكمال هذه الميزة في Stage 5.'
        : 'נשלים את הפעולה הזו ב-Stage 5.',
    );
  };

  const onDelete = (docId: string) => {
    const ok = window.confirm(
      lang === 'ar'
        ? 'حذف المستند من قائمة القضية؟'
        : 'למחוק את המסמך מרשימת התיק?',
    );
    if (!ok) return;
    dispatch({
      type: 'SET_DOCUMENTS',
      documents: state.documentsArr.filter((d) => String(d.id) !== String(docId)),
    });
  };

  const onOpen = () => {
    window.alert(
      lang === 'ar'
        ? 'فتح المستند يتطلب اختيار مجلد Dropbox أولاً.'
        : 'פתיחת המסמך דורשת בחירת תיקיית Dropbox.',
    );
  };

  return (
    <Modal onClose={close}>
      <div className="case-docs-modal-head">
        <div>
          <h2>
            <i className="fas fa-folder-open" /> {title}
          </h2>
          <div className="case-docs-modal-sub">
            {sub}
            <br />
            {lang === 'ar' ? `عدد المستندات: ${docs.length}` : `מספר מסמכים: ${docs.length}`}
          </div>
        </div>
        <div className="case-docs-modal-actions">
          <button type="button" className="btn btn-primary" onClick={onUpload}>
            <i className="fas fa-upload" />
            {uploadLabel}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onSync}>
            <i className="fas fa-rotate" />
            {syncLabel}
          </button>
        </div>
      </div>

      {docs.length === 0 ? (
        <div className="case-docs-modal-empty">
          {lang === 'ar'
            ? 'لا توجد مستندات محفوظة لهذه القضية.'
            : 'אין מסמכים שמורים לתיק זה.'}
        </div>
      ) : (
        <div className="case-docs-modal-list">
          {docs.map((doc) => {
            const fileName =
              doc.fileName ||
              (doc as { storedFileName?: string }).storedFileName ||
              doc.title ||
              '';
            const titleStr = doc.title || doc.fileName || '';
            const path = doc.relativePath || '';
            return (
              <div
                key={doc.id}
                className="case-docs-modal-row"
                data-case-doc-row={doc.id}
              >
                <div>
                  <div className="case-docs-modal-title">
                    <i className="fas fa-file-lines" />
                    <span title={fileName}>{titleStr}</span>
                  </div>
                  <div className="case-docs-modal-meta">
                    <span>{documentTypeLabel(doc, lang)}</span>
                    <span>·</span>
                    <span>
                      {formatDocumentDate(
                        (doc as { uploadedAt?: string }).uploadedAt,
                        lang,
                      )}
                    </span>
                    <span>·</span>
                    <span>
                      {formatDocumentSize((doc as { size?: number }).size, lang)}
                    </span>
                  </div>
                  {path && <div className="case-docs-modal-path">{path}</div>}
                </div>
                <div className="case-docs-modal-row-actions">
                  <button
                    type="button"
                    className="case-docs-modal-btn open"
                    onClick={onOpen}
                  >
                    <i className="fas fa-folder-open" />
                    {lang === 'ar' ? 'فتح' : 'פתח'}
                  </button>
                  {!doc.isTask && (
                    <button
                      type="button"
                      className="case-docs-modal-btn delete"
                      onClick={() => onDelete(doc.id)}
                    >
                      <i className="fas fa-trash" />
                      {lang === 'ar' ? 'حذف' : 'מחק'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
