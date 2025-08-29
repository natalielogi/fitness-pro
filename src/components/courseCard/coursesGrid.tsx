'use client';

import { useEffect, useState } from 'react';
import CourseCard from './courseCard';
import styles from './courseCard.module.css';
import { UiCourse } from '@/sharedTypes/types';
import { listCourses } from '@/app/services/courses/coursesApi';
import { useAuth } from '@/context/auth';
import { useAuthModal } from '@/context/auth-modal';

export default function Coursesgrid() {
  const { isAuthed } = useAuth();
  const { open } = useAuthModal();

  const [items, setItems] = useState<UiCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await listCourses();
        setItems(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onAdd = async (id: string) => {
    setAddingId(id);
    await new Promise((r) => setTimeout(r, 300));
    setAddingId(null);
  };

  const onRequireAuth = () => open('login');

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
  return (
    <section className="container-1440">
      {loading && <p style={{ padding: '24px 0' }}>Загрузка…</p>}
      {!loading && error && (
        <p role="alert" style={{ padding: '24px 0', color: 'crimson' }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className={styles.courses}>
            {items.map((course) => (
              <CourseCard
                key={course._id}
                {...course}
                onAdd={isAuthed ? onAdd : undefined}
                adding={addingId === course._id}
                isSelected={false}
                isAuthed={isAuthed}
                onRequireAuth={onRequireAuth}
              />
            ))}
          </div>

          <button className={`btn ${styles.back__btn}`} onClick={scrollToTop}>
            Наверх ↑
          </button>
        </>
      )}
    </section>
  );
}
