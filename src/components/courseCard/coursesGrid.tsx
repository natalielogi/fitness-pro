import { mockCourses } from '@/lib/mocks/courses';
import CourseCard from './courseCard';

export default function Coursesgrid() {
  return (
    <section className="container-1440">
      <div className="coutses">
        {mockCourses.map((course) => (
          <CourseCard key={course.id} {...course} />
        ))}
      </div>
    </section>
  );
}
