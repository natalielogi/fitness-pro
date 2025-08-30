'use client';

import { useEffect } from 'react';
import styles from './toast.module.css';

type Props = {
  open: boolean;
  text: string;
  onClose: () => void;
  duration?: number;
};

export default function Toast({ open, text, onClose, duration = 1500 }: Props) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} role="status" aria-live="polite">
      <div className={styles.toast}>
        <p className={styles.text}>{text}</p>
        <span className={styles.ok} aria-hidden="true">
          ✓
        </span>
      </div>
    </div>
  );
}
