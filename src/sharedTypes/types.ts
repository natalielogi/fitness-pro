export type Course = {
  _id: string;
  title: string;
  days: number;
  dailyMinutes: string;
  difficulty: 'Лёгкий' | 'Средний' | 'Сложный';
  image: string;
};

export type UiCourse = Course & {
  slug: string;
};
