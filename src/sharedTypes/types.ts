export type Course = {
  id: string;
  title: string;
  days: number;
  dailyMinutes: string;
  difficulty: 'Лёгкий' | 'Средний' | 'Сложный';
  image: string;
};
