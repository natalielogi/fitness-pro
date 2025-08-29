export type UiCourse = {
  _id: string;
  slug: string;
  image: string;
  title: string;
  days: number;
  dailyMinutes: string;
  difficulty: 'Лёгкий' | 'Средний' | 'Сложный';
};

export type Course = Omit<UiCourse, 'slug'>;
