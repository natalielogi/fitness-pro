'use client';

import { listWorkoutsByCourse } from '@/app/services/workouts/workoutsApi';
import { type WorkoutListItem } from '@/sharedTypes/types';
import { useAuth } from '@/context/auth';
import { useAuthModal } from '@/context/auth-modal';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import styles from './workoutModal.module.css';
import { ApiError } from '@/app/services/api/apiError';
import { getCourseProgress } from '@/app/services/progress/progressApi';
import SafeInput from '../inputs/safeInput';

type Props = { courseId: string; courseSlug?: string; open: boolean; onClose: () => void };

export default function WorkoutModal({ courseId, courseSlug, open, onClose }: Props) {
  const router = useRouter();
  const { token, isAuthed, isReady } = useAuth();
  const { open: openAuthModal } = useAuthModal();

  const isYoga = courseSlug === 'yoga';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<WorkoutListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const fetchWorkouts = useCallback(async () => {
    if (!isReady) return;

    if (!token) {
      setLoading(false);
      setError('Чтобы посмотреть тренировки, войдите в аккаунт.');
      openAuthModal('login');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [data, progress] = await Promise.all([
        listWorkoutsByCourse(courseId, token),
        getCourseProgress(courseId, token),
      ]);

      setItems(data);
      setSelectedId('');

      const doneIds = new Set(
        (progress.workoutsProgress ?? []).filter((w) => w.workoutCompleted).map((w) => w.workoutId),
      );
      setCompleted(doneIds);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setError('Чтобы посмотреть тренировки, войдите в аккаунт.');
        openAuthModal('login');
      } else {
        setError(e instanceof Error ? e.message : 'Не удалось загрузить тренировки');
      }
    } finally {
      setLoading(false);
    }
  }, [courseId, token, isReady, openAuthModal]);

  useEffect(() => {
    if (!open) return;
    setItems([]);
    setSelectedId('');
    setCompleted(new Set());
    fetchWorkouts();
  }, [open, fetchWorkouts]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const goToWorkout = (id: string) => {
    if (!isAuthed || !token) {
      openAuthModal('login');
      return;
    }
    onClose();
    router.push(`/workouts/${id}?courseId=${encodeURIComponent(courseId)}`);
  };

  const start = () => {
    if (!selectedId) return;
    if (!isAuthed || !token) {
      openAuthModal('login');
      return;
    }
    onClose();
    router.push(`/workouts/${selectedId}?courseId=${encodeURIComponent(courseId)}`);
  };

  if (!open) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="workout-modal-title"
      onClick={onClose}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 id="workout-modal-title" className={styles.header__title}>
            Выберите тренировку
          </h2>
        </div>

        {(!isReady || loading) && <div className={styles.state}>Загрузка…</div>}

        {isReady && !loading && error && (
          <div className={styles.state} role="alert">
            {error}
            {!isAuthed && (
              <button className={styles.retry} onClick={() => openAuthModal('login')}>
                Войти
              </button>
            )}
          </div>
        )}

        {isReady && !loading && !error && items.length === 0 && (
          <div className={styles.state}>В этом курсе пока нет тренировок.</div>
        )}

        {isReady && !loading && !error && items.length > 0 && (
          <ul className={styles.list}>
            {items.map((w, idx) => {
              const title = isYoga ? w.name.split(' / ')[0] : w.name;
              const isDone = completed.has(w._id);
              return (
                <li key={w._id} className={styles.item}>
                  <label className={styles.row} onClick={() => goToWorkout(w._id)}>
                    <SafeInput
                      type="radio"
                      name="workout"
                      value={w._id}
                      checked={selectedId === w._id}
                      onChange={() => setSelectedId(w._id)}
                      className={styles.radio}
                    />
                    <span
                      className={`${styles.bullet} ${isDone ? styles.bullet_done : ''}`}
                      aria-hidden="true"
                    />
                    <div className={styles.texts}>
                      <div className={styles.title}>{title}</div>
                      {isYoga && (
                        <div className={styles.subtitle}>Йога на каждый день / {idx + 1} день</div>
                      )}
                    </div>
                  </label>
                  <div className={styles.divider} />
                </li>
              );
            })}
          </ul>
        )}

        <button
          type="button"
          className={`btn ${styles.cta}`}
          onClick={start}
          disabled={!selectedId || loading || !isReady}
        >
          Начать
        </button>
      </div>
    </div>
  );
}
