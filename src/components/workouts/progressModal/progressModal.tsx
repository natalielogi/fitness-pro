'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './progressModal.module.css';

export type ProgressModalProps = {
  open: boolean;
  title?: string;
  exercises: string[];
  initial: number[];
  saving?: boolean;
  onClose: () => void;
  onSave: (values: number[]) => void;
};

export default function ProgressModal({
  open,
  title = 'Мой прогресс',
  exercises,
  initial,
  saving = false,
  onClose,
  onSave,
}: ProgressModalProps) {
  const [valuesStr, setValuesStr] = useState<string[]>(() =>
    exercises.map((_, i) => (initial[i] === 0 || initial[i] == null ? '' : String(initial[i]))),
  );
  useEffect(() => {
    if (!open) return;
    setValuesStr(
      exercises.map((_, i) => (initial[i] === 0 || initial[i] == null ? '' : String(initial[i]))),
    );
  }, [open, exercises, initial]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const firstInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) firstInputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="progress-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <h3 id="progress-modal-title" className={styles.title}>
          {title}
        </h3>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            const valuesNum = valuesStr.map((s) => {
              const n = Number(s);
              return Number.isFinite(n) && n >= 0 ? n : 0; // пустая строка → 0
            });
            onSave(valuesNum);
          }}
        >
          {exercises.map((label, i) => (
            <label key={i} className={styles.field}>
              <span className={styles.label}>Сколько раз вы сделали {label.toLowerCase()}?</span>
              <input
                ref={i === 0 ? firstInputRef : undefined}
                type="number"
                min={0}
                inputMode="numeric"
                className={styles.input}
                value={valuesStr[i]}
                placeholder="0"
                onChange={(e) => {
                  const raw = e.target.value.replace(',', '.');
                  if (raw === '' || /^\d+(\.\d+)?$/.test(raw)) {
                    setValuesStr((prev) => {
                      const next = [...prev];
                      next[i] = raw;
                      return next;
                    });
                  }
                }}
              />
            </label>
          ))}

          <div className={styles.actions}>
            <button type="submit" className={`btn ${styles.primary}`} disabled={saving}>
              {saving ? 'Сохраняем…' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
