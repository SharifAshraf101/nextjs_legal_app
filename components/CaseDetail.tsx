'use client';

import { useAppState } from '@/hooks/useAppState';
import { useModalStack } from '@/hooks/useModalStack';
import { useT } from '@/hooks/useT';
import { caseName, caseStatusView, clientName, money } from '@/lib/cases';
import { Modal } from './Modal';
import { CaseLastHearingCard } from './CaseLastHearingCard';
import { CaseEdit } from './CaseEdit';
import { CaseStatusWarning } from './CaseStatusWarning';
import { TaskModal } from './TaskModal';
import { NewEventModal } from './NewEventModal';
import { CaseDocumentsModal } from './CaseDocumentsModal';
import {
  caseDocumentsForCase,
  documentTypeLabel,
  formatDocumentDate,
  formatDocumentSize,
} from '@/lib/documents';
import {
  caseTaskItems,
  taskDueInfo,
  taskPriorityClass,
  taskPriorityLabel,
  taskStatusClass,
  taskStatusLabel,
  taskText,
  tasksLabel,
} from '@/lib/tasks';

/**
 * Port of showCase (source line 4195).
 *
 * The original modal accumulated nine vNNN behavior layers (v140, v141, v142,
 * v143, v210, v215, v216, v219, v220) and a flash-fix patch (this conversation,
 * Stage 1 §11). In the React port:
 *
 *   - All vNNN marker classes ("case-detail-mobile-v140",
 *     "case-detail-desktop-v215", "case-detail-mobile-fields-v220",
 *     "case-main-detail-grid-v219", etc.) are applied as static React
 *     classNames so the CSS rules in globals.css apply on first paint.
 *   - No MutationObservers, no rebuild loops, no destructive remove+reinsert
 *     of field blocks. The detail grid renders the v220 boxed-field layout
 *     directly (v141/v215 hidden blocks aren't needed since CSS only ever
 *     showed v220 once the grid had `.case-main-detail-grid-v220`).
 *   - Only one delete button (`.case-delete-btn-v143`) is rendered — no
 *     v140/v142/v215 alternates fighting over the toolbar slot.
 *
 * Panels deferred to later stages:
 *   - caseDocumentsPanelHtml → Stage 4c (Documents)
 *   - caseTasksPanelHtml → Stage 4b (Tasks)
 *   - caseTimelineSearchHtml + filters + list → Stage 4b (Timeline)
 *
 * For Stage 4a-3 they render as compact placeholders so the visible structure
 * matches and the modal is still usable to view core case data.
 */
export interface CaseDetailProps {
  caseId: string;
}

export function CaseDetail({ caseId }: CaseDetailProps) {
  const { state, dispatch } = useAppState();
  const { t, lang } = useT();
  const modalStack = useModalStack();

  const c = state.casesArr.find((x) => x.id === caseId);
  if (!c) return null;

  const status = caseStatusView(c.status, t);
  const close = () => modalStack.close(modalStack.topId() ?? 0);
  const openEdit = () => {
    close();
    modalStack.open(<CaseEdit caseId={caseId} />);
  };
  const openStatusWarning = () => {
    modalStack.open(<CaseStatusWarning caseId={caseId} />);
  };
  const onNewEvent = () => {
    modalStack.open(<NewEventModal preselectedCaseId={caseId} />);
  };
  const onShowDocs = () => {
    modalStack.open(<CaseDocumentsModal caseId={caseId} />);
  };
  const onDeleteDoc = (docId: string) => {
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
  const onNewTask = () => {
    modalStack.open(<TaskModal preselectedCaseId={caseId} />);
  };
  const editTask = (taskId: string) => {
    modalStack.open(<TaskModal editTaskId={taskId} />);
  };
  const markTaskDone = (taskId: string) => {
    dispatch({
      type: 'SET_TASKS',
      tasks: state.tasksArr.map((x) =>
        String(x.id) === String(taskId)
          ? { ...x, status: 'done', doneAt: new Date().toISOString() }
          : x,
      ),
    });
  };
  const removeTask = (taskId: string) => {
    if (
      !window.confirm(
        taskText('למחוק את המשימה מהרשימה?', 'حذف المهمة من القائمة؟', lang),
      )
    )
      return;
    dispatch({
      type: 'SET_TASKS',
      tasks: state.tasksArr.filter((x) => String(x.id) !== String(taskId)),
    });
  };
  const openTasksScreen = () => {
    close();
    dispatch({ type: 'SET_TAB', tab: 'tasks' });
  };
  const onDeleteCase = () => {
    const ok = window.confirm(
      lang === 'ar'
        ? 'هل تريد حذف هذه القضية نهائياً؟'
        : 'האם למחוק את התיק לחלוטין?',
    );
    if (!ok) return;
    dispatch({
      type: 'SET_CASES',
      cases: state.casesArr.filter((x) => x.id !== caseId),
    });
    // Cleanup related rows. Same fan-out as supabase delete (source line 9842).
    dispatch({
      type: 'SET_EVENTS',
      events: state.eventsList.filter((e) => e.caseId !== caseId),
    });
    dispatch({
      type: 'SET_TASKS',
      tasks: state.tasksArr.filter((tk) => tk.caseId !== caseId),
    });
    dispatch({
      type: 'SET_FINANCES',
      finances: state.finances.filter((f) => f.caseId !== caseId),
    });
    dispatch({
      type: 'SET_DOCUMENTS',
      documents: state.documentsArr.filter((d) => d.caseId !== caseId),
    });
    dispatch({
      type: 'SET_TIMELINE',
      timeline: state.timelineItems.filter((ti) => ti.caseId !== caseId),
    });
    close();
  };

  // vNNN class set applied directly — the CSS rules in globals.css use these
  // selectors. Mirrors what v140/v215/v219/v220 scripts used to add at runtime.
  const modalClass =
    'case-detail-mobile-v140 case-detail-desktop-v215 case-detail-open-v210';
  const boxClass = 'case-detail-modal-box';

  const docsLabel = lang === 'ar' ? 'مستندات القضية' : 'מסמכי התיק';
  const newTaskLabel = lang === 'ar' ? 'مهمة جديدة' : 'משימה חדשה';
  const deleteLabel = lang === 'ar' ? 'حذف الملف' : 'מחק תיק';

  const court = lang === 'ar' ? c.courtAr || c.court : c.court || c.courtAr;
  const titleStr = caseName(c, lang);
  const clientLabel = clientName(c.clientId, state.clients, lang);
  const balance = computeBalance(c, state);

  return (
    <Modal onClose={close} className={modalClass} boxClassName={boxClass}>
      <div className="case-detail-dark-wrapper">
        {/* Title block + contextual action buttons (source showCase) */}
        <div className="case-detail-title">
          <h2>{t('caseDetails')}</h2>
          <div className="case-detail-title-actions case-extra-actions-v140 case-extra-actions-v215">
            <button
              type="button"
              className="btn btn-primary case-new-event-btn"
              onClick={onNewEvent}
              aria-label={t('newEvent')}
            >
              <span className="quick-plus">
                <i className="fas fa-plus" />
              </span>
              <span className="quick-label">{t('newEvent')}</span>
            </button>
            <button
              type="button"
              className="btn case-docs-btn"
              onClick={onShowDocs}
              aria-label={docsLabel}
            >
              <span className="quick-plus">
                <i className="fas fa-folder-open" />
              </span>
              <span className="quick-label">{docsLabel}</span>
            </button>
            <button
              type="button"
              className="btn case-docs-btn"
              onClick={onNewTask}
              aria-label={newTaskLabel}
            >
              <span className="quick-plus">
                <i className="fas fa-list-check" />
              </span>
              <span className="quick-label">{newTaskLabel}</span>
            </button>
            <button
              type="button"
              className={'case-status-btn ' + status.cls}
              onClick={openStatusWarning}
            >
              {status.label}
            </button>
          </div>
        </div>

        {/* Edit + delete toolbar. Only the v143 delete button is rendered —
         *  the v140/v142/v215 alternates that used to fight for this slot are
         *  not part of the React port. */}
        <div className="case-edit-toolbar">
          <button type="button" className="case-edit-btn" onClick={openEdit}>
            <i className="fas fa-pen" />
            <span>{t('edit')}</span>
          </button>
          <button
            type="button"
            className="case-delete-btn-v143"
            data-case-delete-v143="1"
            onClick={onDeleteCase}
          >
            <i className="fas fa-trash" />
            <span>{deleteLabel}</span>
          </button>
        </div>

        <CaseLastHearingCard caseId={caseId} />

        {/* Main detail grid. The grid carries all three case-main-detail-grid-vNNN
         *  classes so the chained CSS rules from globals.css apply (v141 → v215
         *  → v219 → v220). Inside, we render only the v220 boxed-field block —
         *  v141 and v215 blocks are intentionally omitted (CSS hid them when
         *  v220 was present anyway). */}
        <div className="detail-grid case-main-detail-grid-v141 case-main-detail-grid-v215 case-main-detail-grid-v219 case-main-detail-grid-v220">
          <div className="case-detail-mobile-fields-v220" data-v220="1">
            <BoxedField label={lang === 'ar' ? 'اسم الموكل' : 'שם לקוח'} value={clientLabel} full />
            <BoxedField label={lang === 'ar' ? 'نوع الدعوى' : 'מהות התביעה'} value={titleStr} />
            <BoxedField label={lang === 'ar' ? 'المحكمة' : 'בית משפט'} value={court || ''} />
            <BoxedField label={lang === 'ar' ? 'رقم الملف' : 'מספר תיק'} value={c.caseNumber || ''} />
            <BoxedField
              label={lang === 'ar' ? 'الرصيد' : 'יתרת חוב'}
              value={money(balance)}
              balance
            />
          </div>
        </div>

        {/* Panels — full functionality lands in 4b / 4c. Markup mirrors the
         *  source so CSS still styles them; the bodies are placeholders. */}
        <CaseRecentDocumentsPanel
          caseId={caseId}
          onShowAll={onShowDocs}
          onDelete={onDeleteDoc}
        />

        <CaseTasksPanel
          caseId={caseId}
          onNewTask={onNewTask}
          onEditTask={editTask}
          onMarkDone={markTaskDone}
          onDeleteTask={removeTask}
          onShowAll={openTasksScreen}
        />


        <div className="case-timeline-search-row">
          <input
            className="case-timeline-search"
            type="search"
            placeholder={
              lang === 'ar'
                ? 'بحث في المستندات، المهام، المكالمات والملاحظات'
                : 'חיפוש במסמכים, משימות, שיחות והערות'
            }
            disabled
          />
        </div>
        <div id="caseTimelineFilters" />
        <div id="caseTimelineList" className="detail-grid">
          <Placeholder stage="4b" name="Timeline" />
        </div>
      </div>
    </Modal>
  );
}

function BoxedField({
  label,
  value,
  full,
  balance,
}: {
  label: string;
  value: string;
  full?: boolean;
  balance?: boolean;
}) {
  return (
    <div
      className={
        'case-field-v220' +
        (full ? ' case-field-full-v220' : '') +
        (balance ? ' case-field-balance-v220' : '')
      }
    >
      <span className="case-field-label-v220">{label}</span>
      <span className="case-field-value-v220">{value || '-'}</span>
    </div>
  );
}

/** Port of caseDocumentsPanelHtml (source line 3657). */
function CaseRecentDocumentsPanel({
  caseId,
  onShowAll,
  onDelete,
}: {
  caseId: string;
  onShowAll: () => void;
  onDelete: (id: string) => void;
}) {
  const { state } = useAppState();
  const { lang } = useT();
  const docs = caseDocumentsForCase(caseId, state.documentsArr, state.tasksArr);
  const recent = docs.slice(0, 5);
  const title = lang === 'ar' ? 'آخر مستندات القضية' : 'מסמכים אחרונים בתיק';
  const countLabel = lang === 'ar' ? `${docs.length} مستندات` : `${docs.length} מסמכים`;
  const showAllLabel = lang === 'ar' ? 'عرض كل المستندات' : 'הצג את כל המסמכים';
  const emptyText =
    lang === 'ar'
      ? 'لا توجد مستندات محفوظة لهذه القضية. اضغط مستندات القضية لرفع مستند أو مزامنة القضية.'
      : 'אין מסמכים שמורים לתיק זה. לחץ מסמכי התיק כדי להעלות מסמך או לבצע סנכרון תיק.';

  const moreCount = Math.max(0, docs.length - recent.length);
  const moreLabel =
    moreCount > 0
      ? lang === 'ar'
        ? `عرض ${moreCount} مستندات إضافية`
        : `הצג ${moreCount} מסמכים נוספים`
      : '';

  return (
    <section
      id={'caseRecentDocumentsPanel_' + caseId}
      data-case-id={caseId}
      className="case-documents-panel case-recent-documents-panel"
    >
      <div className="case-documents-head">
        <h3>
          <i className="fas fa-file-lines" />
          {title}
        </h3>
        <div className="case-documents-head-actions">
          <span className="case-documents-count">{countLabel}</span>
          <button type="button" className="case-document-btn open" onClick={onShowAll}>
            <i className="fas fa-folder-open" />
            {showAllLabel}
          </button>
        </div>
      </div>
      {recent.length === 0 ? (
        <div className="case-documents-empty">{emptyText}</div>
      ) : (
        <div className="case-documents-list">
          {recent.map((doc) => {
            const fileName =
              doc.fileName ||
              (doc as { storedFileName?: string }).storedFileName ||
              '';
            return (
              <div key={doc.id} className="case-document-row" data-doc-id={doc.id}>
                <div className="case-document-main">
                  <div className="case-document-title">
                    <i className="fas fa-file-lines" />
                    <span title={fileName}>{fileName}</span>
                  </div>
                  <div className="case-document-meta">
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
                </div>
                <div className="case-document-actions">
                  <button
                    type="button"
                    className="case-document-btn open"
                    onClick={() =>
                      window.alert(
                        lang === 'ar'
                          ? 'فتح المستند يتطلب اختيار مجلد Dropbox أولاً.'
                          : 'פתיחת המסמך דורשת בחירת תיקיית Dropbox.',
                      )
                    }
                  >
                    <i className="fas fa-folder-open" />
                    {lang === 'ar' ? 'فتح' : 'פתח'}
                  </button>
                  {!doc.isTask && (
                    <button
                      type="button"
                      className="case-document-btn delete"
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
          {moreCount > 0 && (
            <div className="case-documents-more">
              <button type="button" className="case-document-btn open" onClick={onShowAll}>
                <i className="fas fa-layer-group" />
                {moreLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/** Port of caseTasksPanelHtml (source line 5056). */
function CaseTasksPanel({
  caseId,
  onNewTask,
  onEditTask,
  onMarkDone,
  onDeleteTask,
  onShowAll,
}: {
  caseId: string;
  onNewTask: () => void;
  onEditTask: (id: string) => void;
  onMarkDone: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onShowAll: () => void;
}) {
  const { state } = useAppState();
  const { t, lang } = useT();
  const items = caseTaskItems(caseId, state.tasksArr);

  return (
    <section className="case-tasks-panel" id={'caseTasksPanel_' + caseId}>
      <div className="case-tasks-head">
        <h3>
          <i className="fas fa-list-check" />
          {taskText('משימות פתוחות בתיק', 'مهام مفتوحة في القضية', lang)}
        </h3>
        <div className="case-documents-head-actions">
          <span className="case-tasks-count">
            {items.length} {tasksLabel(lang)}
          </span>
          <button type="button" className="case-document-btn" onClick={onNewTask}>
            <i className="fas fa-plus" />
            {taskText('משימה חדשה', 'مهمة جديدة', lang)}
          </button>
          <button type="button" className="case-document-btn" onClick={onShowAll}>
            <i className="fas fa-list" />
            {taskText('כל המשימות', 'كل المهام', lang)}
          </button>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="case-tasks-empty">
          {taskText(
            'אין משימות פתוחות לתיק זה.',
            'لا توجد مهام مفتوحة لهذه القضية.',
            lang,
          )}
        </div>
      ) : (
        <div className="case-tasks-list">
          {items.slice(0, 5).map((task) => {
            const due = taskDueInfo(task, lang);
            return (
              <div key={task.id} className={'case-task-row ' + due.cls}>
                <div>
                  <div className="case-task-title">{task.title || ''}</div>
                  <div className="case-task-meta">
                    <span>{due.text}</span>
                    <span className={'task-status-badge ' + taskStatusClass(task.status)}>
                      {taskStatusLabel(task.status, lang)}
                    </span>
                    <span className={'task-priority-badge ' + taskPriorityClass(task.priority)}>
                      {taskPriorityLabel(task.priority, lang)}
                    </span>
                  </div>
                  {task.notes && <div className="sub">{task.notes}</div>}
                </div>
                <div className="case-task-actions">
                  {task.status !== 'done' && (
                    <button
                      type="button"
                      className="task-mini-action done"
                      onClick={() => onMarkDone(task.id)}
                    >
                      <i className="fas fa-check" />
                      {taskText('בוצע', 'تم', lang)}
                    </button>
                  )}
                  <button
                    type="button"
                    className="task-mini-action edit"
                    onClick={() => onEditTask(task.id)}
                  >
                    <i className="fas fa-pen" />
                    {t('edit')}
                  </button>
                  <button
                    type="button"
                    className="task-mini-action delete"
                    onClick={() => onDeleteTask(task.id)}
                  >
                    <i className="fas fa-trash" />
                    {taskText('מחק', 'حذف', lang)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Placeholder({ stage, name }: { stage: string; name: string }) {
  return (
    <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)' }}>
      {name} — coming in Stage {stage}.
    </div>
  );
}

/** Compute remaining balance = agreedFee − sum(payments for this case).
 *  Mirrors the source's financeCaseBalance (in lib/finance.ts in Stage 4b)
 *  but kept inline here so CaseDetail doesn't depend on the unported file. */
function computeBalance(
  c: { agreedFee?: number; id: string },
  state: { finances: { caseId: string; amount: number; type?: string }[] },
): number {
  const paid = state.finances
    .filter((f) => f.caseId === c.id && (f.type === 'fee' || !f.type))
    .reduce((s, f) => s + Number(f.amount || 0), 0);
  return Number(c.agreedFee || 0) - paid;
}
