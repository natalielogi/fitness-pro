import { fetchJson } from '../api/fetchJson';
import { API_BASE } from '../constants';

export type WorkoutProgressDto = {
  workoutId: string;
  workoutCompleted: boolean;
  progressData: number[];
};

export type CourseProgressDto = {
  courseId: string;
  courseCompleted: boolean;
  workoutsProgress: WorkoutProgressDto[];
};

export function getCourseProgress(courseId: string, token: string) {
  return fetchJson<CourseProgressDto>(
    `${API_BASE}/users/me/progress?courseId=${encodeURIComponent(courseId)}`,
    { method: 'GET', token },
  );
}

export function getWorkoutProgress(courseId: string, workoutId: string, token: string) {
  return fetchJson<WorkoutProgressDto>(
    `${API_BASE}/users/me/progress?courseId=${encodeURIComponent(courseId)}&workoutId=${encodeURIComponent(workoutId)}`,
    { method: 'GET', token },
  );
}

export function saveWorkoutProgress(
  courseId: string,
  workoutId: string,
  progressData: number[],
  token: string,
) {
  return fetchJson<{ message?: string }>(
    `${API_BASE}/courses/${encodeURIComponent(courseId)}/workouts/${encodeURIComponent(workoutId)}`,
    {
      method: 'PATCH',
      token,
      body: JSON.stringify({ progressData }),
    },
  );
}

export function resetWorkoutProgress(courseId: string, workoutId: string, token: string) {
  return fetchJson<{ message?: string }>(
    `${API_BASE}/courses/${encodeURIComponent(courseId)}/workouts/${encodeURIComponent(workoutId)}/reset`,
    { method: 'PATCH', token },
  );
}

export function resetCourseProgress(courseId: string, token: string) {
  return fetchJson<{ message?: string }>(`${API_BASE}/courses/${courseId}/reset`, {
    method: 'PATCH',
    token,
  });
}
