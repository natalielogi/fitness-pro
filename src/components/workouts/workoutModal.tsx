'use client';

import { listWorkoutsByCourse } from '@/app/services/workouts/workoutsApi';
import { type WorkoutListItem } from '@/sharedTypes/types';
import { useAuth } from '@/context/auth';
import { useAuthModal } from '@/context/auth-modal';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import styles from './workoutModal.module.css';
import { ApiError } from '@/app/services/api/apiError';

type Props = { courseId: string; courseSlug?: string; open: boolean; onClose: () => void };

const VISITED_STORAGE_KEY = 'visitedWorkoutsByCourse';

export default function WorkoutModal({ courseId, courseSlug, open, onClose }: Props) {
  const router = useRouter();
  const { token, isAuthed, isReady } = useAuth();
  const { open: openAuthModal } = useAuthModal();

  const isYoga = courseSlug === 'yoga';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<WorkoutListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [visited, setVisited] = useState<Set<string>>(new Set());

  const loadVisited = useCallback((): Set<string> => {
    try {
      const raw = localStorage.getItem(VISITED_STORAGE_KEY);
      if (!raw) return new Set();
      const obj = JSON.parse(raw) as Record<string, string[]>;
      return new Set(obj[courseId] ?? []);
    } catch {
      return new Set();
    }
  }, [courseId]);

  const saveVisited = useCallback(
    (next: Set<string>) => {
      try {
        const raw = localStorage.getItem(VISITED_STORAGE_KEY);
        const all = (raw ? JSON.parse(raw) : {}) as Record<string, string[]>;
        all[courseId] = Array.from(next);
        localStorage.setItem(VISITED_STORAGE_KEY, JSON.stringify(all));
      } catch {}
    },
    [courseId],
  );

  const markVisited = useCallback(
    (id: string) => {
      setVisited((prev) => {
        const next = new Set(prev);
        next.add(id);
        saveVisited(next);
        return next;
      });
    },
    [saveVisited],
  );

  const fetchWorkouts = useCallback(async () => {
    // ждём init авторизации
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
      const data = await listWorkoutsByCourse(courseId, token);
      setItems(data);
      setSelectedId('');
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
    setVisited(loadVisited());
    fetchWorkouts();
  }, [open, loadVisited, fetchWorkouts]);

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
    markVisited(id);
    onClose();
    router.push(`/workouts/${id}?courseId=${encodeURIComponent(courseId)}`);
  };

  const start = () => {
    if (!selectedId) return;
    if (!isAuthed || !token) {
      openAuthModal('login');
      return;
    }
    markVisited(selectedId);
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
              const isVisited = visited.has(w._id);
              return (
                <li key={w._id} className={styles.item}>
                  <label className={styles.row} onClick={() => goToWorkout(w._id)}>
                    <input
                      type="radio"
                      name="workout"
                      value={w._id}
                      checked={selectedId === w._id}
                      onChange={() => setSelectedId(w._id)}
                      className={styles.radio}
                    />
                    <span
                      className={`${styles.bullet} ${isVisited ? styles.bullet_done : ''}`}
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
