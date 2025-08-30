import { getCourseById, listCourses } from '@/app/services/courses/coursesApi';
import { notFound } from 'next/navigation';
import styles from './page.module.css';
import CourseBanner from '@/components/banner/courseBanner';
import Banner from '@/components/banner/banner';

type Params = { slug: string };

export default async function CoursePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  const courses = await listCourses();
  const course = courses.find((c) => c.slug === slug);
  if (!course) {
    notFound();
  }

  const detail = await getCourseById(course._id);

  const suitsYou = detail.fitting ?? [];
  const directions = detail.directions ?? [];

  return (
    <section className={`container-1440 ${styles.coursePage}`}>
      <CourseBanner slug={course.slug} className={styles.coursePage__banner} />

      {suitsYou.length > 0 && (
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
      )}

      {directions.length > 0 && (
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
      )}

      <Banner courseId={course._id} />
    </section>
  );
}
