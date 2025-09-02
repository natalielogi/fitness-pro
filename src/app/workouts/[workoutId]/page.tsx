'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import styles from './workout.module.css';
import { getWorkout } from '@/app/services/workouts/workoutsApi';
import type { WorkoutDetail } from '@/sharedTypes/types';
import { ApiError } from '@/app/services/api/apiError';
import { useAuth } from '@/context/auth';
import { useAuthModal } from '@/context/auth-modal';
import { getWorkoutProgress, saveWorkoutProgress } from '@/app/services/progress/progressApi';
import ProgressModal from '@/components/workouts/progressModal/progressModal';

type ProgressMap = Record<string, number>;

const cleanupWorkoutTitle = (name: string) =>
  name.replace(/\s*\/\s*Йога на каждый день\s*\/\s*\d+\s*день\s*$/i, '');

const cleanExerciseName = (name: string) => name.replace(/\s*\((?=\d)[^)]*\)\s*$/u, '');

export default function WorkoutPage() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const sp = useSearchParams();
  const courseId = sp.get('courseId') ?? undefined;

  const { token, isAuthed, isReady } = useAuth();
  const { open: openAuthModal } = useAuthModal();

  const [data, setData] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authRequired, setAuthRequired] = useState(false);

  const [counts, setCounts] = useState<number[]>([]);
  const [progress, setProgress] = useState<ProgressMap>({});

  const [isProgressOpen, setProgressOpen] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [toastOk, setToastOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!isReady) return;

    if (!token) {
      setLoading(false);
      setAuthRequired(true);
      setError('Чтобы посмотреть тренировку, войдите в аккаунт.');
      openAuthModal('login');
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError('');

        const workout = await getWorkout(workoutId, token);
        if (cancelled) return;
        setData(workout);

        const zeros = workout.exercises.map(() => 0);
        setCounts(zeros);
        setProgress(Object.fromEntries(workout.exercises.map((ex) => [ex._id, 0])));

        if (courseId) {
          try {
            const p = await getWorkoutProgress(courseId, workoutId, token);
            if (cancelled) return;

            const current = Array.isArray(p.progressData) ? p.progressData : zeros;
            setCounts(current);

            const map: ProgressMap = {};
            workout.exercises.forEach((ex, i) => {
              const done = current[i] ?? 0;
              const pct =
                ex.quantity > 0 ? Math.min(100, Math.round((done / ex.quantity) * 100)) : 0;
              map[ex._id] = pct;
            });
            setProgress(map);
          } catch (e) {
            if (e instanceof ApiError && e.status === 404) {
            } else if (e instanceof ApiError && e.status === 401) {
              setAuthRequired(true);
              setError('Чтобы посмотреть тренировку, войдите в аккаунт.');
              openAuthModal('login');
            } else {
              console.warn('Не удалось получить прогресс:', e);
            }
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Ошибка загрузки');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isReady, workoutId, token, courseId, openAuthModal]);

  const hasAnyProgress = useMemo(() => Object.values(progress).some((p) => p > 0), [progress]);

  const openProgress = () => {
    if (!isAuthed || !token) {
      openAuthModal('login');
      return;
    }
    if (!data || data.exercises.length === 0 || !courseId) return;
    setProgressOpen(true);
  };

  const submitProgress = async (newCounts: number[]) => {
    if (!data || !courseId || !token) return;
    setSaving(true);
    try {
      await saveWorkoutProgress(courseId, workoutId, newCounts, token);

      setCounts(newCounts);
      const map: ProgressMap = {};
      data.exercises.forEach((ex, i) => {
        const done = newCounts[i] ?? 0;
        const pct = ex.quantity > 0 ? Math.min(100, Math.round((done / ex.quantity) * 100)) : 0;
        map[ex._id] = pct;
      });
      setProgress(map);

      setProgressOpen(false);
      setToastOk(true);
      setTimeout(() => setToastOk(false), 1500);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось сохранить прогресс');
    } finally {
      setSaving(false);
    }
  };

  const getTitle = (name: string) => {
    const cleaned = cleanupWorkoutTitle(name);
    if (cleaned !== name) return cleaned;
    if (name.includes(' / ') && /йога/i.test(name) && /день/i.test(name)) {
      return name.split(' / ')[0];
    }
    return name;
  };

  if (!isReady) return <div className={`container-1440 ${styles.container}`}>Загрузка…</div>;
  if (loading) return <div className={`container-1440 ${styles.container}`}>Загрузка…</div>;

  if (authRequired && !isAuthed) {
    return <main className={`container-1440 ${styles.container}`} />;
  }

  if (error) {
    return (
      <div className={`container-1440 ${styles.container}`}>
        <div className={styles.panel}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const noExercises = data.exercises.length === 0;

  return (
    <div className={`container-1440 ${styles.container}`}>
      <header className={styles.header}>
        <h1 className={styles.header__title}>{getTitle(data.name)}</h1>
        <div className={styles.userStub} />
      </header>

      <section className={styles.videoWrap}>
        <div className={styles.videoRatio}>
          <iframe
            className={styles.iframe}
            src={data.video}
            title={data.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panel__title}>Упражнения тренировки</h2>

        {noExercises ? (
          <p className={styles.textMuted}>
            Для этой тренировки упражнения не заданы. Прогресс по ней не трекается.
          </p>
        ) : (
          <ul className={styles.grid}>
            {data.exercises.map((ex) => {
              const pct = progress[ex._id] ?? 0;
              return (
                <li key={ex._id} className={styles.item}>
                  <div className={styles.rowTop}>
                    <span className={styles.exName}>
                      {cleanExerciseName(ex.name)}
                      <span className={styles.exPercentInline}> {pct}%</span>
                    </span>
                  </div>

                  <div
                    className={styles.progressBar}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={pct}
                  >
                    <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {!noExercises && courseId && (
          <button className={`btn ${styles.cta}`} onClick={openProgress} type="button">
            {hasAnyProgress ? 'Обновить свой прогресс' : 'Заполнить свой прогресс'}
          </button>
        )}
        {!courseId && !noExercises && (
          <p className={styles.textMuted}>
            Чтобы заполнить прогресс, откройте тренировку из страницы курса.
          </p>
        )}
      </section>

      <ProgressModal
        open={isProgressOpen && !!data}
        title="Мой прогресс"
        exercises={data.exercises.map((e) => cleanExerciseName(e.name))}
        initial={counts}
        saving={isSaving}
        onClose={() => setProgressOpen(false)}
        onSave={submitProgress}
      />

      {toastOk && (
        <div className={styles.toastBackdrop} aria-live="polite">
          <div className={styles.toastCard}>
            <div className={styles.toastTitle}>Ваш прогресс засчитан!</div>
            <div className={styles.toastIcon} aria-hidden="true">
              ✓
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
