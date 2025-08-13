'use client';

import { mockCourses } from '@/lib/mocks/courses';
import CourseCard from './courseCard';
import styles from './courseCard.module.css';

export default function Coursesgrid() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
  return (
    <section className="container-1440">
      <div className={styles.courses}>
        {mockCourses.map((course) => (
          <CourseCard key={course.id} {...course} />
        ))}
      </div>
      <button className={`btn ${styles.back__btn}`} onClick={scrollToTop}>
        Наверх ↑
      </button>
    </section>
  );
}
