import { UiCourse } from '@/sharedTypes/types';
import Image from 'next/image';
import styles from './courseCard.module.css';
import Link from 'next/link';

export default function CourseCard(course: UiCourse) {
  const { slug, image, title, days, dailyMinutes, difficulty } = course;
  return (
    <Link href={`/courses/${slug}`} className={styles.card}>
      <Image className={styles.card__img} src={image} alt={title} width={360} height={325} />
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
