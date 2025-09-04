'use client';

import { useEffect, useState } from 'react';
import CourseCard from './courseCard';
import styles from './courseCard.module.css';
import { UiCourse } from '@/sharedTypes/types';
import { listCourses } from '@/app/services/courses/coursesApi';
import { useAuth } from '@/context/auth';
import { useAuthModal } from '@/context/auth-modal';
import { addCourseToMe, getCurrentUser } from '@/app/services/user/userApi';
import Toast from '../ui/toast/toast';

export default function Coursesgrid() {
  const { isAuthed, token, isReady } = useAuth();
  const { open } = useAuthModal();

  const [items, setItems] = useState<UiCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addingId, setAddingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toastOpen, setToastOpen] = useState(false);

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

  useEffect(() => {
    if (!isReady) return;

    if (!isAuthed || !token) {
      setSelectedIds(new Set());
      return;
    }

    (async () => {
      try {
        const me = await getCurrentUser(token);
        setSelectedIds(new Set(me.selectedCourses));
      } catch {
        setSelectedIds(new Set());
      }
    })();
  }, [isReady, isAuthed, token]);

  const onAdd = async (id: string) => {
    if (!isAuthed || !token) {
      open('login');
      return;
    }
    setAddingId(id);
    try {
      await addCourseToMe(token, id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      setToastOpen(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось добавить курс');
    } finally {
      setAddingId(null);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            {items.map((c) => (
              <CourseCard
                key={c._id}
                {...c}
                onAdd={onAdd}
                adding={addingId === c._id}
                isSelected={isAuthed ? selectedIds.has(c._id) : false}
                isAuthed={isAuthed}
                onRequireAuth={() => open('login')}
              />
            ))}
          </div>

          <button className={`btn ${styles.back__btn}`} onClick={scrollToTop}>
            Наверх ↑
          </button>
        </>
      )}

      <Toast open={toastOpen} text="Курс успешно добавлен!" onClose={() => setToastOpen(false)} />
    </section>
  );
}
