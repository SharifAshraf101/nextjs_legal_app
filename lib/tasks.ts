// Task helpers. Ports of source 5017-5025, 5038-5040, 5055. Names preserved.

import type { Case, Client, Lang, Task } from '@/types';
import { calendarLocale } from './calendar';
import { caseName, clientName } from './cases';
import { clientDisplayName } from './clients';

/** Source line 5017. */
export function tasksLabel(lang: Lang): string {
  return lang === 'ar' ? 'المهام' : 'משימות';
}

/** Source line 5018. */
export function taskText(he: string, ar: string, lang: Lang): string {
  return lang === 'ar' ? ar : he;
}

/** Source line 5019. */
export function taskStatusLabel(status: string | undefined, lang: Lang): string {
  const map: Record<string, string> = {
    open: taskText('פתוחה', 'مفتوحة', lang),
    progress: taskText('בטיפול', 'قيد المعالجة', lang),
    done: taskText('בוצעה', 'تمت', lang),
  };
  return map[status ?? 'open'] || map.open;
}

/** Source line 5020. */
export function taskPriorityLabel(priority: string | undefined, lang: Lang): string {
  const map: Record<string, string> = {
    normal: taskText('רגילה', 'عادية', lang),
    urgent: taskText('דחופה', 'مستعجلة', lang),
    critical: taskText('דחופה מאוד', 'عاجلة جداً', lang),
  };
  return map[priority ?? 'normal'] || map.normal;
}

/** Source line 5021. */
export function taskStatusClass(status: string | undefined): string {
  return status === 'done'
    ? 'task-status-done'
    : status === 'progress'
      ? 'task-status-progress'
      : 'task-status-open';
}

/** Source line 5022. */
export function taskPriorityClass(priority: string | undefined): string {
  return priority === 'critical'
    ? 'task-priority-critical'
    : priority === 'urgent'
      ? 'task-priority-urgent'
      : 'task-priority-normal';
}

/** Source line 5023. */
export function taskClient(
  task: Task,
  cases: Case[],
  clients: Client[],
): Client {
  const c = cases.find((x) => String(x.id) === String(task.caseId || ''));
  return (
    clients.find(
      (x) => String(x.id) === String(task.clientId || c?.clientId || ''),
    ) || ({} as Client)
  );
}

/** Source line 5024. */
export function taskCase(task: Task, cases: Case[]): Case {
  return cases.find((x) => String(x.id) === String(task.caseId || '')) || ({} as Case);
}

/** Source line 5025. Due-date display + row class for overdue / today / no-date. */
export function taskDueInfo(
  task: Task,
  lang: Lang,
): { text: string; cls: string } {
  if (!task.dueDate) return { text: '-', cls: '' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(task.dueDate + 'T00:00:00');
  if (isNaN(d.getTime())) return { text: task.dueDate, cls: '' };
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  let suffix = '';
  if (task.status !== 'done') {
    if (diff < 0) suffix = taskText(' · באיחור', ' · متأخرة', lang);
    else if (diff === 0) suffix = taskText(' · היום', ' · اليوم', lang);
    else if (diff === 1) suffix = taskText(' · מחר', ' · غداً', lang);
  }
  const cls =
    task.status === 'done'
      ? ''
      : diff < 0
        ? 'task-row-overdue'
        : diff === 0
          ? 'task-row-due-today'
          : '';
  return {
    text:
      d.toLocaleDateString(calendarLocale(lang), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) + suffix,
    cls,
  };
}

/** Source line 5038. */
export function taskSearchText(
  task: Task,
  cases: Case[],
  clients: Client[],
  lang: Lang,
): string {
  const c = taskCase(task, cases);
  const cl = taskClient(task, cases, clients);
  return [
    task.title,
    task.notes,
    task.status,
    task.priority,
    task.dueDate,
    caseName(c, lang),
    c.caseNumber,
    clientDisplayName(cl, lang),
    cl.phone,
    cl.idNumber,
  ]
    .filter(Boolean)
    .join(' ');
}

/** Source line 5039. Open tasks first, then by due date asc, then by createdAt desc. */
export function sortedTasks(items: Task[]): Task[] {
  return [...(items || [])].sort((a, b) => {
    const ad = a.status === 'done' ? 1 : 0;
    const bd = b.status === 'done' ? 1 : 0;
    if (ad !== bd) return ad - bd;
    const dueCmp = String(a.dueDate || '9999-12-31').localeCompare(
      String(b.dueDate || '9999-12-31'),
    );
    if (dueCmp !== 0) return dueCmp;
    return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
  });
}

/** Source line 5055. Open tasks for a single case, sorted. */
export function caseTaskItems(caseId: string, tasks: Task[]): Task[] {
  return sortedTasks(
    (tasks || []).filter((x) => String(x.caseId) === String(caseId) && x.status !== 'done'),
  );
}

/** New TASK-NNN id matching source line 5063 pattern. */
export function nextTaskId(): string {
  return 'TASK-' + Date.now();
}

// ---- Quick-filter bar helpers (source 7288-7322) -------------------------

export type TaskQuickFilter = 'all' | 'today' | 'overdue' | 'urgent' | 'open' | 'done';

function taskDateOnly(value: string | undefined): Date | null {
  if (!value) return null;
  const d = new Date(String(value).slice(0, 10) + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}
function taskToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
export function taskIsOverdue(task: Task): boolean {
  const d = taskDateOnly(task.dueDate);
  if (!d || task.status === 'done') return false;
  return d < taskToday();
}
export function taskIsToday(task: Task): boolean {
  const d = taskDateOnly(task.dueDate);
  const today = taskToday();
  return !!d && d.getTime() === today.getTime();
}
export function taskIsUrgent(task: Task): boolean {
  return task.priority === 'urgent' || task.priority === 'critical';
}

/** Source line 7299. */
export function taskQuickLabel(key: TaskQuickFilter, lang: Lang): string {
  const labels: Record<TaskQuickFilter, [string, string]> = {
    all: ['הכול', 'الكل'],
    today: ['להיום', 'لليوم'],
    overdue: ['באיחור', 'متأخرة'],
    urgent: ['דחופות', 'مستعجلة'],
    open: ['פתוחות', 'مفتوحة'],
    done: ['בוצעו', 'تمت'],
  };
  return lang === 'ar' ? labels[key][1] : labels[key][0];
}

/** Source line 7310. */
export function taskMatchesQuickFilter(task: Task, mode: TaskQuickFilter): boolean {
  if (mode === 'today') return taskIsToday(task);
  if (mode === 'overdue') return taskIsOverdue(task);
  if (mode === 'urgent') return taskIsUrgent(task) && task.status !== 'done';
  if (mode === 'open') return task.status !== 'done';
  if (mode === 'done') return task.status === 'done';
  return true;
}

/** Source line 7318. */
export function taskFilterCounts(
  tasks: Task[],
): Record<TaskQuickFilter, number> {
  return {
    all: tasks.length,
    today: tasks.filter(taskIsToday).length,
    overdue: tasks.filter(taskIsOverdue).length,
    urgent: tasks.filter((t) => taskIsUrgent(t) && t.status !== 'done').length,
    open: tasks.filter((t) => t.status !== 'done').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };
}
