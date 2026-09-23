'use client';

import { useEffect, useRef } from 'react';
import styles from './confirm-dialog.module.css';

// Zamena za window.confirm — stilizovan, pristupačan modal (native <dialog>)
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Obriši',
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} className={styles.dialog} onCancel={onCancel} onClose={onCancel}>
      <h2>{title}</h2>
      <p>{message}</p>
      <div className={styles.actions}>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancel} disabled={pending}>
          Otkaži
        </button>
        <button type="button" className="btn btn-danger btn-sm" onClick={onConfirm} disabled={pending} autoFocus>
          {pending ? 'Brisanje…' : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
