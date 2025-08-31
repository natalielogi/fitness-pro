import { WorkoutDetail, WorkoutListItem } from '@/sharedTypes/types';
import { API_BASE } from '../constants';
import { fetchJson } from '../api/fetchJson';

export function listWorkoutsByCourse(courseId: string, token?: string) {
  return fetchJson<WorkoutListItem[]>(`${API_BASE}/courses/${courseId}/workouts`, {
    method: 'GET',
    token,
  });
}

export function getWorkout(workoutId: string, token?: string) {
  return fetchJson<WorkoutDetail>(`${API_BASE}/workouts/${workoutId}`, { method: 'GET', token });
}
