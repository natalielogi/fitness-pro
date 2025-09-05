'use client';

import { useAuth } from '@/context/auth';
import { useAuthModal } from '@/context/auth-modal';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import styles from './profile.module.css';

import { getCurrentUser, removeCourseFromMe } from '@/app/services/user/userApi';
import { listCourses } from '@/app/services/courses/coursesApi';
import type { UiCourse } from '@/sharedTypes/types';
import CourseCard from '@/components/courseCard/courseCard';
import WorkoutModal from '@/components/workouts/workoutModal';
import { ApiError } from '@/app/services/api/apiError';
import { useCourseProgress } from '@/app/hooks/useCourseProgress';

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

  const { coursePercents, recomputePercents, resetCourse, resettingId } = useCourseProgress(
    selectedIds,
    { token, isAuthed, isReady, openAuthModal },
  );

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
    if (!isAuthed || !token || removingId) return;
    setRemovingId(id);
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    try {
      const raw = localStorage.getItem('visitedWorkoutsByCourse');
      if (raw) {
        const all = JSON.parse(raw) as Record<string, string[]>;
        if (all[id]) {
          delete all[id];
          localStorage.setItem('visitedWorkoutsByCourse', JSON.stringify(all));
        }
      }
    } catch {}
    await Promise.allSettled([removeCourseFromMe(token, id), resetCourse(id, { silent: true })]);
    setRemovingId(null);
  };

  const openWorkoutsModal = (courseId: string, slug: string) => {
    if (!isAuthed || !token) {
      openAuthModal('login');
      return;
    }
    setWorkoutCourse({ id: courseId, slug });
  };

  const closeWorkoutsModal = () => setWorkoutCourse(null);

  if (!isReady) return <main className={`container-1440 ${styles.pageBlank}`} />;
  if (!isAuthed) return <main className={`container-1440 ${styles.pageBlank}`} />;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <main className={`container-1440 ${styles.profile}`}>
      <h1 className={styles.profile__title}>Профиль</h1>

      <section aria-labelledby="profile-card-title" className={styles.profile__card}>
        <div className={styles.profile__avatarBox}>
          <Image
            src="/profile_page.svg"
            alt=""
            width={197}
            height={197}
            priority
            className={styles.profile__avatar}
          />
        </div>

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

        {!loading && !error && (
          <>
            {myCourses.length ? (
              <ul className={styles.coursesGrid}>
                {myCourses.map((c) => {
                  const pct = coursePercents[c._id] ?? 0;
                  const isResetting = resettingId === c._id;
                  const onCta =
                    pct === 100
                      ? () => resetCourse(c._id, { silent: true })
                      : () => openWorkoutsModal(c._id, c.slug);

                  const ctaLabel = pct === 100 && isResetting ? 'Сбрасываем…' : undefined;

                  return (
                    <li key={c._id} className={styles.coursesGridItem}>
                      <CourseCard
                        variant="profile"
                        {...c}
                        _id={c._id}
                        progressPercent={pct}
                        onRemove={onRemove}
                        removing={removingId === c._id}
                        onCtaClick={onCta}
                        ctaLabel={ctaLabel}
                      />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className={styles.textMuted}>
                Курсов пока нет. Добавьте любой курс на его странице.
              </div>
            )}

            <button
              type="button"
              className={`btn ${styles.back__btn} ${styles.onlyMobile}`}
              onClick={scrollToTop}
              aria-label="Прокрутить наверх"
            >
              Наверх ↑
            </button>
          </>
        )}
      </section>
    </main>
  );
}
