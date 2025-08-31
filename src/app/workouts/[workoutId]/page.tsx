'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import styles from './workout.module.css';

import { getWorkout } from '@/app/services/workouts/workoutsApi';
import { ApiError } from '@/app/services/api/apiError';
import type { WorkoutDetail } from '@/sharedTypes/types';
import { useAuth } from '@/context/auth';
import { useAuthModal } from '@/context/auth-modal';

type ProgressMap = Record<string, number>;

const cleanupWorkoutTitle = (name: string) =>
  name.replace(/\s*\/\s*Йога на каждый день\s*\/\s*\d+\s*день\s*$/i, '');

const cleanExerciseName = (name: string) => name.replace(/\s*\((?=\d)[^)]*\)\s*$/u, '');

export default function WorkoutPage() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const { token, isAuthed } = useAuth();
  const { open: openAuthModal } = useAuthModal();

  const [data, setData] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<ProgressMap>({});
  const [authRequired, setAuthRequired] = useState(false);

  useEffect(() => {
    let cancelled = false;

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

        const init: ProgressMap = {};
        workout.exercises.forEach((ex) => (init[ex._id] = 0));
        setProgress(init);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 401) {
          setAuthRequired(true);
          setError('Чтобы посмотреть тренировку, войдите в аккаунт.');
          openAuthModal('login');
        } else {
          setError(e instanceof Error ? e.message : 'Ошибка загрузки');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [workoutId, token, openAuthModal]);

  const hasAnyProgress = useMemo(() => Object.values(progress).some((p) => p > 0), [progress]);

  const openProgressModal = () => {
    // TODO: открыть модалку заполнения/обновления прогресса
    // После сохранения: setProgress(newProgressFromServer)
  };

  if (loading) return <div className={styles.container}>Загрузка…</div>;

  const getTitle = (name: string) => {
    const cleaned = cleanupWorkoutTitle(name);
    if (cleaned !== name) return cleaned;
    if (name.includes(' / ') && /йога/i.test(name) && /день/i.test(name)) {
      return name.split(' / ')[0];
    }
    return name;
  };

  if (authRequired && !isAuthed) {
    return (
      <div className={styles.container}>
        <div className={styles.panel}>
          <p>{error || 'Требуется авторизация.'}</p>
          <button className={styles.cta} onClick={() => openAuthModal('login')}>
            Войти
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.panel}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={`container-1440 ${styles.container}`}>
      {' '}
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

        <button className={`btn ${styles.cta}`} onClick={openProgressModal} type="button">
          {hasAnyProgress ? 'Обновить свой прогресс' : 'Заполнить свой прогресс'}
        </button>
      </section>
    </div>
  );
}
