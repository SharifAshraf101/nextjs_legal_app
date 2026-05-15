// File System Access + IndexedDB handle store. Port of:
//   - openLegalOfficeHandleDB (source line 3225)
//   - saveLegalOfficeDirectoryHandle / loadSavedLegalOfficeDirectoryHandle (3236, 3247)
//   - verifyLegalOfficeDirectoryPermission (3287)
//
// The actual per-document read/write is intentionally left for Stage 4 where
// it's wired up alongside the Documents screen and the auto-sync interval.

import type { AppState } from '@/types';

export const LEGAL_OFFICE_DATA_FILE = 'legal-office-data.json';
export const LEGAL_OFFICE_DOCUMENTS_FOLDER = 'Clients';
const LEGAL_OFFICE_IDB_NAME = 'legalOfficeLocalDiskDB';
const LEGAL_OFFICE_IDB_STORE = 'directoryHandles';
const LEGAL_OFFICE_IDB_KEY = 'legalOfficeDataDirectory';

const isBrowser = typeof window !== 'undefined';

export type DirectoryHandle = FileSystemDirectoryHandle;

type FileSystemHandlePermissionDescriptor = {
  mode?: 'read' | 'readwrite';
};

function openHandleDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(LEGAL_OFFICE_IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(LEGAL_OFFICE_IDB_STORE)) {
        db.createObjectStore(LEGAL_OFFICE_IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
  });
}

export async function saveLegalOfficeDirectoryHandle(
  handle: DirectoryHandle,
): Promise<void> {
  if (!isBrowser || !handle) return;
  const db = await openHandleDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(LEGAL_OFFICE_IDB_STORE, 'readwrite');
    tx.objectStore(LEGAL_OFFICE_IDB_STORE).put(handle, LEGAL_OFFICE_IDB_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB write failed'));
  });
  db.close();
}

export async function loadSavedLegalOfficeDirectoryHandle(): Promise<DirectoryHandle | null> {
  if (!isBrowser || !window.indexedDB) return null;
  const db = await openHandleDB();
  const handle = await new Promise<DirectoryHandle | null>((resolve, reject) => {
    const tx = db.transaction(LEGAL_OFFICE_IDB_STORE, 'readonly');
    const request = tx.objectStore(LEGAL_OFFICE_IDB_STORE).get(LEGAL_OFFICE_IDB_KEY);
    request.onsuccess = () => resolve((request.result as DirectoryHandle | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB read failed'));
  });
  db.close();
  return handle;
}

/** Source line 3287. Returns whether we have (or just acquired) readwrite
 *  permission on the saved directory handle. */
export async function verifyLegalOfficeDirectoryPermission(
  handle: DirectoryHandle | null,
): Promise<boolean> {
  if (!handle || typeof (handle as unknown as { queryPermission?: unknown }).queryPermission !== 'function') {
    return false;
  }
  const options = { mode: 'readwrite' } as FileSystemHandlePermissionDescriptor;
  type PermissionHandle = DirectoryHandle & {
    queryPermission: (o: FileSystemHandlePermissionDescriptor) => Promise<PermissionState>;
    requestPermission: (o: FileSystemHandlePermissionDescriptor) => Promise<PermissionState>;
  };
  const h = handle as PermissionHandle;
  try {
    if ((await h.queryPermission(options)) === 'granted') return true;
    if ((await h.requestPermission(options)) === 'granted') return true;
  } catch {
    /* permission may throw outside user gesture */
  }
  return false;
}

/** Source line 3222. Throws a translated error when the browser lacks support. */
export function assertFileSystemAccess(lang: 'he' | 'ar'): void {
  if (!isBrowser || !('showDirectoryPicker' in window)) {
    throw new Error(
      lang === 'ar'
        ? 'المتصفح لا يدعم اختيار مجلد. استخدم Chrome أو Edge.'
        : 'הדפדפן אינו תומך בבחירת תיקייה. השתמש ב-Chrome או Edge.',
    );
  }
}

/** Open the directory picker and persist the chosen handle. */
export async function pickAndSaveDirectory(
  lang: 'he' | 'ar',
): Promise<DirectoryHandle> {
  assertFileSystemAccess(lang);
  const handle = await (window as unknown as {
    showDirectoryPicker: (o?: { mode?: 'read' | 'readwrite' }) => Promise<DirectoryHandle>;
  }).showDirectoryPicker({ mode: 'readwrite' });
  await saveLegalOfficeDirectoryHandle(handle);
  return handle;
}

/** Source line 3260. Clears the saved IDB handle. The caller is responsible for
 *  resetting the in-memory state. */
export async function resetLegalOfficeDataFolder(): Promise<void> {
  if (!isBrowser || !window.indexedDB) return;
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(LEGAL_OFFICE_IDB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
}

// ---------------------------------------------------------------------------
// scheduleLegalOfficeDiskAutoSave — source line 3172. Debounces writes by
// 650ms so a burst of state changes only triggers one disk write. The actual
// file write lands in Stage 4 once the screens that mutate state are ported.
// ---------------------------------------------------------------------------

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleLegalOfficeDiskAutoSave(
  handle: DirectoryHandle | null,
  payload: () => AppState,
  writeFn: (state: AppState, handle: DirectoryHandle) => Promise<void>,
): void {
  if (!handle) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void writeFn(payload(), handle);
  }, 650);
}
