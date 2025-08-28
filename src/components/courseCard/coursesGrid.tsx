'use client';

import { useEffect, useState } from 'react';
import CourseCard from './courseCard';
import styles from './courseCard.module.css';
import { UiCourse } from '@/sharedTypes/types';
import { listCourses } from '@/app/services/courses/coursesApi';

export default function Coursesgrid() {
  const [items, setItems] = useState<UiCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listCourses();
        if (!cancelled) setItems(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Ошибка загрузки');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
              <CourseCard key={course._id} {...course} />
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
