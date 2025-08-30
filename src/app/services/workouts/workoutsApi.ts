import { API_BASE } from '../constants';

export type Workout = {
  _id: string;
  name: string;
  video: string;
  exercises: unknown[];
};

export async function listWorkoutsByCourse(courseId: string, token?: string): Promise<Workout[]> {
  const res = await fetch(`${API_BASE}/courses/${courseId}/workouts`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Ошибка загрузки тренировок: ${res.status}`);
  return (await res.json()) as Workout[];
}
