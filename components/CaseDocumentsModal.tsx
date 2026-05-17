'use client';

import { useAppState } from '@/hooks/useAppState';
import { useModalStack } from '@/hooks/useModalStack';
import { useT } from '@/hooks/useT';
import { caseName, clientName } from '@/lib/cases';
import { caseDocumentsForCase } from '@/lib/documents';
import { openDocumentFromLegalOfficeFolder } from '@/lib/disk';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
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
  const confirmDelete = useDeleteConfirm();

  const c = state.casesArr.find((x) => String(x.id) === String(caseId));
  if (!c) return null;

  const docs = caseDocumentsForCase(caseId, state.documentsArr, state.tasksArr);
  const close = () => modalStack.close(modalStack.topId() ?? 0);

  const title = lang === 'ar' ? 'مستندات القضية' : 'מסמכי התיק';
  const sub = [caseName(c, lang), c.caseNumber, clientName(c.clientId, state.clients, lang)]
    .filter(Boolean)
    .join(' · ');

  const onDelete = async (docId: string) => {
    const ok = await confirmDelete(
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

  const onOpen = async (relativePath: string | undefined) => {
    if (!relativePath) {
      window.alert(
        lang === 'ar'
          ? 'لم يتم حفظ ملف لهذا المستند.'
          : 'לא נשמר קובץ עבור מסמך זה.',
      );
      return;
    }
    // Mobile docs store the Dropbox share URL — navigate directly.
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      window.open(relativePath, '_blank', 'noopener,noreferrer');
      return;
    }
    // Dropbox internal cloud path: open directly in Dropbox web UI.
    if (relativePath.startsWith('/')) {
      window.open(
        'https://www.dropbox.com/home' + relativePath,
        '_blank',
        'noopener,noreferrer',
      );
      return;
    }
    // Desktop path — local Dropbox folder via FS Access
    const ok = await openDocumentFromLegalOfficeFolder(relativePath, lang);
    if (!ok) {
      window.alert(
        lang === 'ar'
          ? 'تعذر فتح الملف من مجلد Dropbox.'
          : 'פתיחת הקובץ מתיקיית Dropbox נכשלה.',
      );
    }
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
            const openTitle = lang === 'ar' ? 'افتح المستند' : 'פתח מסמך';
            return (
              <div
                key={doc.id}
                className="case-docs-modal-row"
                data-case-doc-row={doc.id}
              >
                <div>
                  <div className="case-docs-modal-title">
                    <i className="fas fa-file-lines" />
                    <span
                      title={openTitle}
                      onDoubleClick={() => onOpen(doc.relativePath)}
                      style={{
                        cursor: 'pointer',
                        color: 'var(--primary)',
                        fontWeight: 700,
                      }}
                      aria-label={openTitle + ' — ' + fileName}
                    >
                      {titleStr}
                    </span>
                  </div>
                </div>
                <div className="case-docs-modal-row-actions">
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
