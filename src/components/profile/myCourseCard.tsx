import { UiCourse } from '@/sharedTypes/types';
import Image from 'next/image';
import styles from './myCourseCard.module.css';

type Props = {
  course: UiCourse;
  progress?: number;
  onRemove: (id: string) => void | Promise<void>;
  removing?: boolean;
  onOpenWorkouts?: (courseId: string) => void;
};

export default function MyCourseCard({
  course,
  progress = 0,
  onRemove,
  removing,
  onOpenWorkouts,
}: Props) {
  const { _id, image, title, days, dailyMinutes, difficulty } = course;

  const ctaText =
    progress >= 100 ? 'Начать заново' : progress > 0 ? 'Продолжить' : 'Начать тренировки';

  return (
    <article className={styles.card}>
      <button
        type="button"
        className={styles.removeBtn}
        title="Удалить курс"
        aria-label="Удалить курс"
        onClick={() => onRemove(_id)}
        disabled={removing}
      >
        <Image
          src="/remove.svg"
          alt=""
          width={32}
          height={32}
          className={styles.card__removeIcon}
          aria-hidden="true"
        />
      </button>
      <Image
        src={image}
        alt={title}
        width={360}
        height={325}
        className={styles.card__img}
        onError={(ev) => {
          const img = ev.currentTarget as HTMLImageElement;
          img.onerror = null;
          img.src = '/card/placeholder.svg';
        }}
      />
      <div className={styles.card__description}>
        <h3 className={styles.card__title}>{title}</h3>

        <div className={styles.card__meta}>
          <span>📅 {days} дней</span>
          <span>⏱ {dailyMinutes}</span>
          <span>⚡ {difficulty}</span>
        </div>

        <div className={styles.progressWrap} aria-label="Прогресс">
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <span className={styles.progressText}>Прогресс {Math.round(progress)}%</span>
        </div>

        <button
          type="button"
          className={`btn ${styles.card__cta}`}
          onClick={() => onOpenWorkouts?.(_id)}
          disabled={removing}
        >
          {ctaText}
        </button>
      </div>
    </article>
  );
}
