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
}: Props) {
  const showAddBtn = !isSelected;

  const handleAddClick: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthed) {
      onRequireAuth?.();
      return;
    }
    await onAdd?.(_id);
  };
  return (
    <Link href={`/courses/${slug}`} className={styles.card}>
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
            <Image
              className={styles.card__duration_img}
              src="/card/Calendar.svg"
              alt=""
              width={0}
              height={0}
              style={{ width: 18, height: 18 }}
            />
            <p className={styles.card__duration_p}>{days} дней</p>
          </div>
          <div className={styles.card__dailyDuration}>
            <Image
              className={styles.card__dailyDuration_img}
              src="/card/Time.svg"
              alt=""
              width={0}
              height={0}
              style={{ width: 18, height: 18 }}
            />
            <p className={styles.card__dailyDuration_p}>{dailyMinutes}</p>
          </div>
          <div className={styles.card__difficulty}>
            <Image
              className={styles.card__difficulty_img}
              src="/card/difficulty.svg"
              alt=""
              width={0}
              height={0}
              style={{ width: 18, height: 18 }}
            />
            <p className={styles.card__difficulty_p}>{difficulty}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
