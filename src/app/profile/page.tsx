'use client';

import { useAuth } from '@/context/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { MeResponse, getCurrentUser } from '../services/user/userApi';
import Link from 'next/link';
import Image from 'next/image';
import styles from './profile.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const { token, email: emailFromCtx, isAuthed, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);

  const loginName = useMemo(() => {
    const e = me?.email ?? emailFromCtx ?? '';
    const i = e.indexOf('@');
    return i > 0 ? e.slice(0, i) : e;
  }, [me?.email, emailFromCtx]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await getCurrentUser(token);
        if (!cancelled) setMe(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Ошибка загрузки');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const onLogout = () => {
    logout();
    router.push('/');
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
          <div className={styles.cardSubtitle}>Логин: {me?.email ?? emailFromCtx ?? '—'}</div>
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
          (me?.selectedCourses?.length ? (
            <ul className={styles.coursesGrid}>
              {me.selectedCourses.map((id) => (
                <li key={id} className={styles.courseCard}>
                  <div className={styles.courseTitle}>Курс #{id}</div>
                  <div className={styles.courseNote}>
                    (заглушка) Подтянем реальные данные из API курсов позже
                  </div>
                  <button type="button" className="btn">
                    Перейти
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.textMuted}>
              Курсов пока нет. Когда подключим API курсов — покажем карточки.
            </div>
          ))}
      </section>
    </main>
  );
}
