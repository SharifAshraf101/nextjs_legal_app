// Document helpers. Ports of source 3603-3656 + 4968. Names preserved.

import type { Case, Client, DocumentRecord, Lang, Task } from '@/types';
import { caseName, clientName } from './cases';
import { clientDisplayName } from './clients';

/** Source line 3635. */
export function formatDocumentSize(bytes: number | undefined, lang: Lang): string {
  const n = Number(bytes || 0);
  if (!n) return lang === 'ar' ? 'غير محدد' : 'לא צוין';
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / (1024 * 1024)).toFixed(1) + ' MB';
}

/** Source line 3642. */
export function documentTypeLabel(
  doc: DocumentRecord | (DocumentRecord & { storedFileName?: string }),
  lang: Lang,
): string {
  const name = String(
    doc?.fileName || (doc as { storedFileName?: string })?.storedFileName || '',
  ).toLowerCase();
  const type = String(doc?.type || '').toLowerCase();
  if (type.includes('pdf') || name.endsWith('.pdf')) return 'PDF';
  if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return 'Word';
  if (type.includes('image') || /\.(png|jpg|jpeg|webp|gif)$/i.test(name))
    return lang === 'ar' ? 'صورة' : 'תמונה';
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) return 'Excel';
  return lang === 'ar' ? 'ملف' : 'קובץ';
}

/** Source line 3651. */
export function formatDocumentDate(raw: string | undefined, lang: Lang): string {
  if (!raw) return lang === 'ar' ? 'غير محدد' : 'לא צוין';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleString(lang === 'ar' ? 'ar-EG' : 'he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Source line 3603. Returns documents for a case plus open tasks rendered as
 * pseudo-documents. Sorted newest-first.
 */
export function caseDocumentsForCase(
  caseId: string,
  documents: DocumentRecord[],
  tasks: Task[],
): (DocumentRecord & {
  uploadedAt?: string;
  size?: number;
  isTask?: boolean;
  taskId?: string;
  taskStatus?: string;
  taskPriority?: string;
  notes?: string;
  storedFileName?: string;
})[] {
  const docs = (documents || [])
    .filter((d) => String(d.caseId || '') === String(caseId || ''))
    .map((d) => ({ ...d })) as Array<
    DocumentRecord & {
      uploadedAt?: string;
      size?: number;
      isTask?: boolean;
      taskId?: string;
      taskStatus?: string;
      taskPriority?: string;
      notes?: string;
      storedFileName?: string;
    }
  >;

  const openTasks = (tasks || []).filter(
    (t) => String(t.caseId) === String(caseId) && t.status !== 'done',
  );
  openTasks.forEach((task) => {
    if (docs.some((d) => d.taskId === task.id)) return;
    docs.push({
      id: 'TASK-' + task.id,
      caseId: task.caseId,
      fileName: task.title,
      title: task.title,
      uploadedAt: task.dueDate || task.createdAt || '',
      size: 0,
      type: 'task',
      notes: task.notes || '',
      isTask: true,
      taskStatus: task.status,
      taskPriority: task.priority,
      taskId: task.id,
    });
  });

  return docs.sort((a, b) => {
    const da = new Date(a.uploadedAt || (a as { dueDate?: string }).dueDate || '0').getTime();
    const db = new Date(b.uploadedAt || (b as { dueDate?: string }).dueDate || '0').getTime();
    return db - da;
  });
}

/** Source line 4968. */
export function documentSearchText(
  doc: DocumentRecord & { storedFileName?: string; relativePath?: string },
  cases: Case[],
  clients: Client[],
  lang: Lang,
): string {
  const c = cases.find((x) => String(x.id) === String(doc.caseId || '')) || ({} as Case);
  const client =
    clients.find(
      (x) => String(x.id) === String(doc.clientId || c.clientId || ''),
    ) || ({} as Client);
  const court = lang === 'ar' ? c.courtAr || c.court : c.court;
  return [
    doc.title,
    doc.fileName,
    doc.storedFileName,
    doc.relativePath,
    caseName(c, lang),
    c.caseNumber,
    court,
    clientDisplayName(client, lang),
    client.phone,
    client.idNumber,
  ]
    .filter(Boolean)
    .join(' · ');
}
