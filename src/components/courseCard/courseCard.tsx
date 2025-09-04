import { UiCourse } from '@/sharedTypes/types';
import Image from 'next/image';
import styles from './courseCard.module.css';
import Link from 'next/link';

type Props = UiCourse & {
  _id: string;
  onAdd?: (id: string) => void | Promise<void>;
  adding?: boolean;
  isSelected?: boolean;
  isAuthed?: boolean;
  onRequireAuth?: () => void;

  onRemove?: (id: string) => void | Promise<void>;
  removing?: boolean;
  progressPercent?: number;
  onCtaClick?: () => void;
  ctaLabel?: string;

  variant?: 'catalog' | 'profile';
};

export default function CourseCard({
  _id,
  slug,
  image,
  title,
  days,
  dailyMinutes,
  difficulty,
  onAdd,
  adding,
  isSelected,
  isAuthed,
  onRequireAuth,
  onRemove,
  removing,
  progressPercent = 0,
  onCtaClick,
  ctaLabel,
  variant = 'catalog',
}: Props) {
  const isProfile = variant === 'profile';
  const showAddBtn = !isProfile && (!isAuthed || !isSelected);

  const progress = Math.max(0, Math.min(progressPercent, 100));

  function getCtaText(progress: number, ctaLabel?: string) {
    if (ctaLabel) return ctaLabel;
    if (progress === 100) return 'Начать заново';
    if (progress > 0) return 'Продолжить';
    return 'Начать тренировки';
  }

  const ctaText = getCtaText(progress, ctaLabel);

  const handleAddClick: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthed) {
      onRequireAuth?.();
      return;
    }
    await onAdd?.(_id);
  };

  const handleRemoveClick: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await onRemove?.(_id);
  };

  const CardBody = (
    <>
      {showAddBtn && (
        <button
          type="button"
          className={styles.card__addBtn}
          onClick={handleAddClick}
          disabled={adding}
          data-tooltip="Добавить курс"
          aria-label="Добавить курс"
        >
          <Image
            src="/add.svg"
            alt=""
            width={32}
            height={32}
            className={styles.card__addIcon}
            aria-hidden="true"
          />
        </button>
      )}

      {isProfile && (
        <button
          type="button"
          className={styles.card__removeBtn}
          onClick={handleRemoveClick}
          disabled={removing}
          data-tooltip="Удалить курс"
          aria-label="Удалить курс"
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
      )}

      <Image
        className={styles.card__img}
        src={image}
        alt={title}
        width={360}
        height={325}
        onError={(ev) => {
          const img = ev.currentTarget as HTMLImageElement;
          img.onerror = null;
          img.src = '/card/placeholder.svg';
        }}
      />

      <div className={styles.card__description}>
        <h2 className={styles.card__title}>{title}</h2>
        <div className={styles.card__block}>
          <div className={styles.card__timeDuration}>
            <img src="/card/Calendar.svg" alt="" className={styles.card__icon} />
            <p className={styles.card__duration_p}>{days} дней</p>
          </div>
          <div className={styles.card__dailyDuration}>
            <img src="/card/Time.svg" alt="" className={styles.card__icon} />
            <p className={styles.card__dailyDuration_p}>{dailyMinutes}</p>
          </div>
          <div className={styles.card__difficulty}>
            <img src="/card/difficulty.svg" alt="" className={styles.card__icon} />
            <p className={styles.card__difficulty_p}>{difficulty}</p>
          </div>
        </div>

        {isProfile && (
          <>
            <div className={styles.card__progressBox} aria-label="Прогресс">
              <span className={styles.card__progressLabel}>Прогресс {Math.round(progress)}%</span>
              <div
                className={styles.card__progressBar}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
              >
                <div className={styles.card__progressFill} style={{ width: `${progress}%` }} />
              </div>
            </div>

            <button
              type="button"
              className={`btn ${styles.card__cta}`}
              onClick={(e) => {
                e.preventDefault();
                onCtaClick?.();
              }}
            >
              {ctaText}
            </button>
          </>
        )}
      </div>
    </>
  );

  return isProfile ? (
    <article className={styles.card} aria-label={title}>
      {CardBody}
    </article>
  ) : (
    <Link href={`/courses/${slug}`} className={styles.card}>
      {CardBody}
    </Link>
  );
}
