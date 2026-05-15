'use client';

import { useRef } from 'react';
import type { Client } from '@/types';
import { clientDisplayName, clientInitials } from '@/lib/clients';
import { useT } from '@/hooks/useT';
import { useAppState } from '@/hooks/useAppState';

/**
 * Avatar + photo upload. Port of clientAvatarHtml (source line 4202),
 * chooseClientPhoto (4206), handleClientPhotoSelected (4207),
 * saveClientPhoto (4209), cancelClientPhoto (4210).
 *
 * When editable=true, clicking the avatar opens the file picker; selecting an
 * image shows save / cancel buttons. Save writes a data URL to the client's
 * photoUrl and updates app state.
 */
export interface ClientAvatarProps {
  client: Client;
  editable?: boolean;
}

export function ClientAvatar({ client, editable = false }: ClientAvatarProps) {
  const { state, dispatch } = useAppState();
  const { t, lang } = useT();
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const display = clientDisplayName(client, lang);
  const initials = clientInitials(client, lang);

  const onPick = () => {
    if (!editable) return;
    fileRef.current?.click();
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || '');
      if (!previewRef.current) return;
      previewRef.current.innerHTML = `<div class="client-avatar editable"><img src="${src}" alt=""></div>`;
      previewRef.current.dataset.pendingPhoto = src;
      previewRef.current
        .querySelector('.client-photo-actions')
        ?.classList.remove('is-hidden');
    };
    reader.readAsDataURL(file);
  };

  const onSave = () => {
    const src = previewRef.current?.dataset.pendingPhoto;
    if (!src) return;
    const updated = state.clients.map((c) =>
      c.id === client.id ? { ...c, photoUrl: src } : c,
    );
    dispatch({ type: 'SET_CLIENTS', clients: updated });
    // Clear pending state — the component will re-render with new photoUrl.
    delete previewRef.current!.dataset.pendingPhoto;
    previewRef.current!.querySelector('.client-photo-actions')?.classList.add('is-hidden');
  };

  const onCancel = () => {
    if (!previewRef.current) return;
    // Restore the original avatar rendering.
    previewRef.current.innerHTML = '';
    delete previewRef.current.dataset.pendingPhoto;
    // The component will re-render via the parent unless we force it.
    // Easiest: dispatch a no-op SET_CLIENTS — same array.
    dispatch({ type: 'SET_CLIENTS', clients: [...state.clients] });
  };

  return (
    <div ref={previewRef} id={`clientPhotoPreview_${client.id}`}>
      <div
        className={'client-avatar' + (editable ? ' editable' : '')}
        role={editable ? 'button' : undefined}
        tabIndex={editable ? 0 : undefined}
        onClick={onPick}
      >
        {client.photoUrl ? (
          <img src={client.photoUrl} alt={display} />
        ) : (
          <span>{client.photoIcon || initials}</span>
        )}
      </div>
      {editable && (
        <>
          <input
            ref={fileRef}
            id={`clientPhotoInput_${client.id}`}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={onFile}
          />
          <div
            id={`clientPhotoActions_${client.id}`}
            className="client-photo-actions is-hidden"
          >
            <button type="button" className="save" onClick={onSave}>
              {t('save')}
            </button>
            <button type="button" className="cancel" onClick={onCancel}>
              {t('cancel')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
