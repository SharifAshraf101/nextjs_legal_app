'use client';

import { useState, type FormEvent } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { useModalStack } from '@/hooks/useModalStack';
import { useT } from '@/hooks/useT';
import { caseName, clientName } from '@/lib/cases';
import { nextTaskId, taskPriorityLabel, taskStatusLabel, taskText } from '@/lib/tasks';
import { Modal } from './Modal';
import type { Task } from '@/types';

/**
 * Port of showTaskModal (source line 5058) + saveTaskForm (around 5060).
 *
 * Opens for both "new task" (no editTaskId) and "edit existing task" flows.
 * If a `preselectedCaseId` is passed (e.g. clicked "new task" from inside
 * CaseDetail) the case selector starts on that case.
 */
export interface TaskModalProps {
  preselectedCaseId?: string;
  editTaskId?: string;
}

export function TaskModal({ preselectedCaseId = '', editTaskId = '' }: TaskModalProps) {
  const { state, dispatch } = useAppState();
  const { t, lang } = useT();
  const modalStack = useModalStack();

  const existing = (state.tasksArr || []).find((x) => String(x.id) === String(editTaskId));
  const defaultCaseId = existing?.caseId || preselectedCaseId || state.casesArr[0]?.id || '';

  const [title, setTitle] = useState(existing?.title || '');
  const [caseId, setCaseId] = useState(defaultCaseId);
  const [dueDate, setDueDate] = useState(existing?.dueDate || '');
  const [status, setStatus] = useState(existing?.status || 'open');
  const [priority, setPriority] = useState(existing?.priority || 'normal');
  const [notes, setNotes] = useState(existing?.notes || '');

  const close = () => modalStack.close(modalStack.topId() ?? 0);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    const c = state.casesArr.find((x) => String(x.id) === String(caseId));
    const isDone = status === 'done';

    if (existing) {
      const next = state.tasksArr.map((x) => {
        if (String(x.id) !== String(existing.id)) return x;
        return {
          ...x,
          title: trimmedTitle,
          caseId,
          clientId: c?.clientId || x.clientId || '',
          dueDate,
          status,
          priority,
          notes: notes.trim(),
          doneAt: isDone ? x.doneAt || new Date().toISOString() : '',
        };
      });
      dispatch({ type: 'SET_TASKS', tasks: next });
    } else {
      const newTask: Task = {
        id: nextTaskId(),
        createdAt: new Date().toISOString(),
        title: trimmedTitle,
        caseId,
        clientId: c?.clientId || '',
        dueDate,
        status,
        priority,
        notes: notes.trim(),
        doneAt: isDone ? new Date().toISOString() : '',
      };
      dispatch({ type: 'SET_TASKS', tasks: [...state.tasksArr, newTask] });
    }
    close();
  };

  const titleLabel = existing
    ? taskText('עריכת משימה', 'تعديل مهمة', lang)
    : taskText('משימה חדשה', 'مهمة جديدة', lang);

  return (
    <Modal onClose={close}>
      <h2>{titleLabel}</h2>
      <form className="task-form" onSubmit={onSubmit}>
        <label className="full">
          {taskText('שם המשימה', 'اسم المهمة', lang)}
          <input
            id="taskTitleInput"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={taskText(
              'לדוגמה: הכנת תגובה לבקשה',
              'مثال: إعداد رد على طلب',
              lang,
            )}
          />
        </label>
        <label>
          {t('caseDetails')}
          <select
            id="taskCaseInput"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
          >
            {state.casesArr.map((c) => (
              <option key={c.id} value={c.id}>
                {clientName(c.clientId, state.clients, lang)} · {c.caseNumber || ''} ·{' '}
                {caseName(c, lang)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {taskText('תאריך יעד', 'تاريخ الاستحقاق', lang)}
          <input
            id="taskDueInput"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>
        <label>
          {t('status')}
          <select
            id="taskStatusInput"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="open">{taskStatusLabel('open', lang)}</option>
            <option value="progress">{taskStatusLabel('progress', lang)}</option>
            <option value="done">{taskStatusLabel('done', lang)}</option>
          </select>
        </label>
        <label>
          {taskText('עדיפות', 'الأولوية', lang)}
          <select
            id="taskPriorityInput"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="normal">{taskPriorityLabel('normal', lang)}</option>
            <option value="urgent">{taskPriorityLabel('urgent', lang)}</option>
            <option value="critical">{taskPriorityLabel('critical', lang)}</option>
          </select>
        </label>
        <label className="full">
          {t('notes')}
          <textarea
            id="taskNotesInput"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
        <div className="task-form-actions">
          <button type="button" className="cancel" onClick={close}>
            {t('cancel')}
          </button>
          <button type="submit" className="save">
            {t('save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
