'use client';

import { useAuth } from '@/context/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './profile.module.css';

import { getCurrentUser, removeCourseFromMe } from '../services/user/userApi';
import { listCourses } from '@/app/services/courses/coursesApi';
import type { UiCourse } from '@/sharedTypes/types';
import MyCourseCard from '@/components/profile/myCourseCard';

export default function ProfilePage() {
  const router = useRouter();
  const { token, email: emailFromCtx, isAuthed, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [meEmail, setMeEmail] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<UiCourse[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loginName = useMemo(() => {
    const e = meEmail || emailFromCtx || '';
    const i = e.indexOf('@');
    return i > 0 ? e.slice(0, i) : e;
  }, [meEmail, emailFromCtx]);

  useEffect(() => {
    if (!isAuthed || !token) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const [me, courses] = await Promise.all([getCurrentUser(token), listCourses()]);
        console.log('[profile] me:', me);
        console.log('[profile] me.selectedCourses:', me.selectedCourses);
        console.log(
          '[profile] allCourses ids:',
          courses.map((c) => c._id),
        );
        console.log(
          '[profile] intersection:',
          me.selectedCourses.filter((id) => courses.some((c) => c._id === id)),
        );
        if (cancelled) return;
        setMeEmail(me.email);
        setSelectedIds(me.selectedCourses);
        setAllCourses(courses);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Ошибка загрузки');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthed, token]);

  const myCourses: UiCourse[] = useMemo(() => {
    const map = new Map(allCourses.map((c) => [c._id, c]));
    return selectedIds.map((id) => map.get(id)).filter(Boolean) as UiCourse[];
  }, [allCourses, selectedIds]);

  const onLogout = () => {
    logout();
    router.push('/');
  };

  const onRemove = async (id: string) => {
    if (!token) return;
    setRemovingId(id);
    try {
      await removeCourseFromMe(token, id);
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось удалить курс');
    } finally {
      setRemovingId(null);
    }
  };

  const openWorkoutsModal = (courseId: string) => {
    // TODO: тут откроем модалку выбора тренировки из курса
    // пока заглушка:
    console.log('open workouts for', courseId);
  };

  if (!isAuthed) {
    return (
      <main className={`container-1440 ${styles.page}`}>
        <h1>Профиль</h1>
        <p className={styles.textMuted}>Вы не авторизованы.</p>
        <Link href="/" className={`btn ${styles.backBtn}`}>
          На главную
        </Link>
      </main>
    );
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
                  <MyCourseCard
                    course={c}
                    progress={0}
                    onRemove={onRemove}
                    removing={removingId === c._id}
                    onOpenWorkouts={openWorkoutsModal}
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
