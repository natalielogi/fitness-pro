'use client';

import { useAuth } from '@/context/auth';
import { useAuthModal } from '@/context/auth-modal';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './profile.module.css';
import { getCurrentUser, removeCourseFromMe } from '../services/user/userApi';
import { getCourseById, listCourses } from '@/app/services/courses/coursesApi';
import type { UiCourse } from '@/sharedTypes/types';
import CourseCard from '@/components/courseCard/courseCard';
import WorkoutModal from '@/components/workouts/workoutModal';
import { ApiError } from '@/app/services/api/apiError';
import { getCourseProgress } from '../services/progress/progressApi';
import { getWorkout } from '../services/workouts/workoutsApi';

export default function ProfilePage() {
  const router = useRouter();
  const { token, email: emailFromCtx, isAuthed, isReady, logout } = useAuth();
  const { open: openAuthModal } = useAuthModal();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [meEmail, setMeEmail] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<UiCourse[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [workoutCourse, setWorkoutCourse] = useState<{ id: string; slug: string } | null>(null);

  const [coursePercents, setCoursePercents] = useState<Record<string, number>>({});
  const totalsRef = useRef<Record<string, number>>({});

  const loginName = useMemo(() => {
    const e = meEmail || emailFromCtx || '';
    const i = e.indexOf('@');
    return i > 0 ? e.slice(0, i) : e;
  }, [meEmail, emailFromCtx]);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthed || !token) {
      setLoading(false);
      setError('Чтобы открыть профиль, войдите в аккаунт.');
      openAuthModal('login');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [me, courses] = await Promise.all([getCurrentUser(token), listCourses()]);
        if (cancelled) return;
        setMeEmail(me.email);
        setSelectedIds(me.selectedCourses);
        setAllCourses(courses);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 401) {
          setError('Сессия истекла. Войдите снова.');
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
  }, [isReady, isAuthed, token, openAuthModal]);

  useEffect(() => {
    const setIds = new Set(selectedIds);
    for (const key of Object.keys(totalsRef.current)) {
      if (!setIds.has(key)) delete totalsRef.current[key];
    }
  }, [selectedIds]);

  const recomputePercents = useCallback(async () => {
    if (!isReady || !isAuthed || !token) return;

    if (selectedIds.length === 0) {
      setCoursePercents({});
      return;
    }

    const entries = await Promise.all(
      selectedIds.map(async (courseId) => {
        try {
          let total = totalsRef.current[courseId];
          if (total == null) {
            const detail = await getCourseById(courseId);
            total = Array.isArray(detail.workouts) ? detail.workouts.length : 0;
            totalsRef.current[courseId] = total;
          }
          if (total === 0) return [courseId, 0] as const;

          const courseProg = await getCourseProgress(courseId, token);

          const completed = courseProg.workoutsProgress.filter((w) => w.workoutCompleted).length;
          if (completed > 0) {
            const pctDone = Math.min(100, Math.round((completed / total) * 100));
            return [courseId, pctDone] as const;
          }

          if (courseProg.workoutsProgress.length > 0) {
            const workoutsWithProg = courseProg.workoutsProgress;

            const details = await Promise.all(
              workoutsWithProg.map((w) => getWorkout(w.workoutId, token)),
            );

            let sumFractions = 0;
            let counted = 0;

            for (let i = 0; i < workoutsWithProg.length; i++) {
              const wProg = workoutsWithProg[i];
              const wDet = details[i];

              const required = (wDet.exercises ?? []).reduce(
                (acc, ex) => acc + (ex.quantity || 0),
                0,
              );
              const done = (wProg.progressData ?? []).reduce((acc, n) => acc + (n || 0), 0);

              if (required > 0) {
                const frac = Math.max(0, Math.min(1, done / required));
                sumFractions += frac;
                counted += 1;
              }
            }

            if (counted > 0) {
              const pctApprox = Math.min(100, Math.round((sumFractions / total) * 100));
              return [courseId, pctApprox] as const;
            }
          }

          return [courseId, 0] as const;
        } catch {
          return [courseId, 0] as const;
        }
      }),
    );

    setCoursePercents(Object.fromEntries(entries));
  }, [isReady, isAuthed, token, selectedIds]);

  useEffect(() => {
    recomputePercents();
  }, [recomputePercents]);

  const myCourses: UiCourse[] = useMemo(() => {
    const map = new Map(allCourses.map((c) => [c._id, c]));
    return selectedIds.map((id) => map.get(id)).filter(Boolean) as UiCourse[];
  }, [allCourses, selectedIds]);

  const onLogout = () => {
    logout();
    router.push('/');
  };

  const onRemove = async (id: string) => {
    if (!isAuthed || !token) {
      openAuthModal('login');
      return;
    }
    setRemovingId(id);

    setCoursePercents((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    delete totalsRef.current[id];

    try {
      await removeCourseFromMe(token, id);
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) openAuthModal('login');
      else alert(e instanceof Error ? e.message : 'Не удалось удалить курс');
    } finally {
      setRemovingId(null);
    }
  };

  const openWorkoutsModal = (courseId: string, slug: string) => {
    if (!isAuthed || !token) {
      openAuthModal('login');
      return;
    }
    setWorkoutCourse({ id: courseId, slug });
  };

  const closeWorkoutsModal = () => setWorkoutCourse(null);

  if (!isReady) {
    return <main className={`container-1440 ${styles.pageBlank}`} />;
  }
  if (!isAuthed) {
    return <main className={`container-1440 ${styles.pageBlank}`} />;
  }

  return (
    <main className={`container-1440 ${styles.profile}`}>
      <h1 className={styles.profile__title}>Профиль</h1>

      <section aria-labelledby="profile-card-title" className={styles.profile__card}>
        <Image
          src="/profile_page.svg"
          alt=""
          width={197}
          height={197}
          priority
          className={styles.profile__avatar}
        />
        <div className={styles.profile__info}>
          <h2 id="profile-card-title" className={styles.cardTitle}>
            {loginName || '—'}
          </h2>
          <div className={styles.cardSubtitle}>Логин: {meEmail || emailFromCtx || '—'}</div>
        </div>
        <button type="button" className={`btn ${styles.profile__logout}`} onClick={onLogout}>
          Выйти
        </button>
      </section>

      <section className={styles.courses}>
        <h2 className={styles.courses__title}>Мои курсы</h2>

        {loading && <p className={styles.loading}>Загрузка…</p>}

        <WorkoutModal
          open={Boolean(workoutCourse)}
          courseId={workoutCourse?.id ?? ''}
          courseSlug={workoutCourse?.slug}
          onClose={closeWorkoutsModal}
        />

        {!loading && error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          (myCourses.length ? (
            <ul className={styles.coursesGrid}>
              {myCourses.map((c) => (
                <li key={c._id} className={styles.coursesGridItem}>
                  <CourseCard
                    variant="profile"
                    {...c}
                    _id={c._id}
                    progressPercent={coursePercents[c._id] ?? 0}
                    onRemove={onRemove}
                    removing={removingId === c._id}
                    onCtaClick={() => openWorkoutsModal(c._id, c.slug)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.textMuted}>
              Курсов пока нет. Добавьте любой курс на его странице.
            </div>
          ))}
      </section>
    </main>
  );
}
