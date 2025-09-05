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

export type Exercise = {
  _id: string;
  name: string;
  quantity: number;
};

export type WorkoutListItem = {
  _id: string;
  name: string;
  video: string;
  exercises?: Exercise[];
};

export type WorkoutDetail = {
  _id: string;
  name: string;
  video: string;
  exercises: Exercise[];
};
