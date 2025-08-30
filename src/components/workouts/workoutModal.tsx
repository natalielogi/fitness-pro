import { Workout, listWorkoutsByCourse } from '@/app/services/workouts/workoutsApi';
import { useAuth } from '@/context/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './workoutModal.module.css';
type Props = {
  courseId: string;
  open: boolean;
  onClose: () => void;
};

export default function WorkoutModal({ courseId, open, onClose }: Props) {
  const router = useRouter();
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Workout[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listWorkoutsByCourse(courseId, token ?? undefined);
        if (!cancelled) {
          setItems(data);
          setSelectedId(data[0]?._id ?? '');
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Не удалось загрузить тренировки');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, courseId, token]);

  const start = () => {
    if (!selectedId) return;
    onClose();
    router.push(`/workouts/${selectedId}`);
  };

  if (!open) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="workout-modal-title"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 id="workout-modal-title">Выберите тренировку</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        {loading && <div className={styles.state}>Загрузка…</div>}
        {!loading && error && (
          <div className={styles.state} role="alert">
            {error}
            <button
              type="button"
              className={styles.retry}
              onClick={() => {
                setItems([]);
                setError(null);
                setLoading(true);
              }}
            >
              Повторить
            </button>
          </div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className={styles.state}>В этом курсе пока нет тренировок.</div>
        )}

        {!loading && !error && items.length > 0 && (
          <ul className={styles.list}>
            {items.map((w) => (
              <li key={w._id} className={styles.item}>
                <label className={styles.row}>
                  <input
                    type="radio"
                    name="workout"
                    value={w._id}
                    checked={selectedId === w._id}
                    onChange={() => setSelectedId(w._id)}
                  />
                  <div className={styles.texts}>
                    <div className={styles.title}>{w.name}</div>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          className={`btn ${styles.cta}`}
          onClick={start}
          disabled={!selectedId || loading}
        >
          Начать
        </button>
      </div>
    </div>
  );
}
