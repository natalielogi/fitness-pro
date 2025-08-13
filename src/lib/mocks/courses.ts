import { Course } from '@/sharedTypes/types';

export const mockCourses: Course[] = [
  {
    id: 'yoga',
    title: 'Йога',
    days: 25,
    dailyMinutes: '20–50 мин/день',
    difficulty: 'Лёгкий',
    image: '/courses/yoga.png',
  },
  {
    id: 'stretching',
    title: 'Стретчинг',
    days: 25,
    dailyMinutes: '20–50 мин/день',
    difficulty: 'Лёгкий',
    image: '/courses/stretching.jpg',
  },
  {
    id: 'fitness',
    title: 'Фитнес',
    days: 25,
    dailyMinutes: '20–50 мин/день',
    difficulty: 'Средний',
    image: '/courses/fitness.jpg',
  },
  {
    id: 'step',
    title: 'Степ-аэробика',
    days: 25,
    dailyMinutes: '20–50 мин/день',
    difficulty: 'Средний',
    image: '/courses/step.jpg',
  },
  {
    id: 'bodyflex',
    title: 'Бодифлекс',
    days: 25,
    dailyMinutes: '20–50 мин/день',
    difficulty: 'Лёгкий',
    image: '/courses/bodyflex.jpg',
  },
];
