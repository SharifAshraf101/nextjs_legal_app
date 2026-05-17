'use client';

import { useCallback } from 'react';
import { useModalStack } from './useModalStack';
import { useT } from './useT';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';

/**
 * Returns an async function that, when called, presents a TWO-step
 * professional centered confirmation dialog (built on the modal stack).
 *
 *   const confirmDelete = useDeleteConfirm();
 *   ...
 *   const onDelete = async () => {
 *     const ok = await confirmDelete('למחוק את הלקוח לחלוטין?');
 *     if (!ok) return;
 *     // ...proceed with delete
 *   };
 *
 * Returns `true` ONLY when the user clicks "confirm" on BOTH dialogs.
 * The user can cancel by clicking the cancel button, clicking the
 * backdrop, or pressing ESC. Enter on the dialog acts as confirm.
 */
export function useDeleteConfirm(): (firstMessage: string) => Promise<boolean> {
  const modalStack = useModalStack();
  const { lang } = useT();

  return useCallback(
    (firstMessage: string) => {
      const showOnce = (message: string) =>
        new Promise<boolean>((resolve) => {
          let id = -1;
          id = modalStack.open(
            <ConfirmDeleteDialog
              message={message}
              lang={lang}
              onResult={(ok) => {
                if (id !== -1) modalStack.close(id);
                resolve(ok);
              }}
            />,
          );
        });

      const secondMsg =
        lang === 'ar'
          ? 'هل أنت متأكد تماماً؟ لا يمكن التراجع عن هذا الإجراء.'
          : 'האם את/ה בטוח/ה לחלוטין? פעולה זו אינה ניתנת לביטול.';

      return (async () => {
        const first = await showOnce(firstMessage);
        if (!first) return false;
        return await showOnce(secondMsg);
      })();
    },
    [modalStack, lang],
  );
}
