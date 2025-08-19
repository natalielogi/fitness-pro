import { mockCourses } from '@/lib/mocks/courses';
import { notFound } from 'next/navigation';
import Banner from '@/components/banner/banner';
import CourseBanner from '@/components/banner/courseBanner';
import styles from './page.module.css';

type Params = { slug: string };

export default async function CoursePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const course = mockCourses.find((c) => c.slug === slug);
  if (!course) return notFound;

  // Заглушки под API:
  const suitsYou = [
    'Давно хотели попробовать йогу, но не решались начать',
    'Хотите укрепить позвоночник, избавиться от болей в спине и суставах',
    'Ищете активность, полезную для тела и души',
  ];
  const directions = [
    'Йога для новичков',
    'Кундалини-йога',
    'Хатха-йога',
    'Классическая йога',
    'Йогатерапия',
    'Аштанга-йога',
  ];

  return (
    <section className={`container-1440 ${styles.coursePage}`}>
      <CourseBanner slug={course.slug} className={styles.coursePage__banner} />
      <div className={styles.coursePage__suits}>
        <h2 className={styles.coursePage__suitsTitle}>Подойдёт для вас, если:</h2>
        <div className={styles.coursePage__suitsList}>
          {suitsYou.map((text, i) => (
            <div key={i} className={styles.coursePage__suitsItem}>
              <strong className={styles.coursePage__suitsNum}>{i + 1}</strong>
              <p className={styles.coursePage__suitsText}>{text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.coursePage__directions}>
        <h3 className={styles.coursePage__directionsTitle}>Направления</h3>
        <ul className={styles.coursePage__directionsList}>
          {directions.map((d) => (
            <li key={d} className={styles.coursePage__directionsItem}>
              {d}
            </li>
          ))}
        </ul>
      </div>
      <Banner />
    </section>
  );
}
