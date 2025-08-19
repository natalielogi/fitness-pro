import { mockCourses } from '@/lib/mocks/courses';
import { notFound } from 'next/navigation';
import Banner from '@/components/banner/banner';
import CourseBanner from '@/components/banner/courseBanner';

type Params = { slug: string };

export default async function CoursePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const course = mockCourses.find((c) => c.slug === slug);
  if (!course) return notFound;

  // Заглушки под API:
  const suitsYou = [
    'Давно хотели попробовать йогу, но не решались начать',
    'Хотите укрепить позвоночник и избавиться от болей',
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
    <section className="container-1440">
      <CourseBanner slug={course.slug} className="course-banner" />
      <div>
        <h2>Подойдёт для вас, если:</h2>
        <div>
          {suitsYou.map((text, i) => (
            <div key={i}>
              <strong>{i + 1}</strong>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3>Направления</h3>
        <ul>
          {directions.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </div>
      <Banner />
    </section>
  );
}
