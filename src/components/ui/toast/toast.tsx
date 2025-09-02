'use client';

import { useEffect, useRef } from 'react';
import styles from './toast.module.css';

type Props = {
  open: boolean;
  text: string;
  onClose: () => void;
  kind?: 'success' | 'error';
  autoCloseMs?: number | null;
};

export default function Toast({
  open,
  text,
  onClose,
  kind = 'success',
  autoCloseMs = 1800,
}: Props) {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open || !autoCloseMs || autoCloseMs <= 0) return;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      onClose();
    }, autoCloseMs);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [open, autoCloseMs, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.toastBackdrop}
      onClick={onClose}
      role="dialog"
      aria-live="polite"
      aria-label={kind === 'error' ? 'Ошибка' : 'Успех'}
    >
      <div
        className={styles.toastCard}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        tabIndex={-1}
      >
        <div className={styles.toastTitle}>{text}</div>
        <div
          className={`${styles.toastIcon} ${
            kind === 'error' ? styles.iconError : styles.iconSuccess
          }`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
