'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Modal stack. Replaces the source's `modal(html)` global (line 4107) which
 * appended a `<div class="modal">` to `<body>` and let the user `.remove()` it
 * to close. Here we keep a stack of React nodes; the top one is the latest.
 *
 * Multiple modals can be open at once (e.g. opening "Case status warning"
 * from inside a Case detail), matching the source behavior.
 */
interface ModalEntry {
  id: number;
  node: ReactNode;
}

interface ModalStackValue {
  modals: ModalEntry[];
  open: (node: ReactNode) => number;
  close: (id: number) => void;
  closeAll: () => void;
  /** Returns the id of the topmost modal, or null. Used by quick-action
   *  buttons that want to know if any modal is currently shown. */
  topId: () => number | null;
}

const ModalStackContext = createContext<ModalStackValue | null>(null);

let nextId = 1;

export function ModalStackProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<ModalEntry[]>([]);

  const open = useCallback((node: ReactNode) => {
    const id = nextId++;
    setModals((m) => [...m, { id, node }]);
    return id;
  }, []);

  const close = useCallback((id: number) => {
    setModals((m) => m.filter((e) => e.id !== id));
  }, []);

  const closeAll = useCallback(() => {
    setModals([]);
  }, []);

  const topId = useCallback(
    () => (modals.length ? modals[modals.length - 1].id : null),
    [modals],
  );

  const value = useMemo<ModalStackValue>(
    () => ({ modals, open, close, closeAll, topId }),
    [modals, open, close, closeAll, topId],
  );

  return (
    <ModalStackContext.Provider value={value}>
      {children}
      {modals.map((m) => (
        <div key={m.id}>{m.node}</div>
      ))}
    </ModalStackContext.Provider>
  );
}

export function useModalStack(): ModalStackValue {
  const ctx = useContext(ModalStackContext);
  if (!ctx) {
    throw new Error('useModalStack must be used inside <ModalStackProvider>');
  }
  return ctx;
}
