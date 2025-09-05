// app/hooks/useCourseProgress.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getCourseById } from '@/app/services/courses/coursesApi';
import { getCourseProgress, resetCourseProgress } from '@/app/services/progress/progressApi';
import { getWorkout } from '@/app/services/workouts/workoutsApi';

type OpenAuthFn = (mode?: 'login' | 'register') => void;

export function useCourseProgress(
  selectedCourseIds: string[],
  opts: { token: string | null; isAuthed: boolean; isReady: boolean; openAuthModal: OpenAuthFn },
) {
  const { token, isAuthed, isReady, openAuthModal } = opts;

  const [coursePercents, setCoursePercents] = useState<Record<string, number>>({});
  const [resettingId, setResettingId] = useState<string | null>(null);
  const totalsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const setIds = new Set(selectedCourseIds);
    for (const key of Object.keys(totalsRef.current))
      if (!setIds.has(key)) delete totalsRef.current[key];
  }, [selectedCourseIds]);

  const recomputePercents = useCallback(async () => {
    if (!isReady || !isAuthed || !token) return;
    if (selectedCourseIds.length === 0) {
      setCoursePercents({});
      return;
    }

    const entries = await Promise.all(
      selectedCourseIds.map(async (courseId) => {
        try {
          let total = totalsRef.current[courseId];
          if (total == null) {
            const detail = await getCourseById(courseId);
            total = Array.isArray(detail.workouts) ? detail.workouts.length : 0;
            totalsRef.current[courseId] = total;
          }
          if (total === 0) return [courseId, 0] as const;

          const courseProg = await getCourseProgress(courseId, token);

          const doneWorkouts = courseProg.workoutsProgress.filter((w) => w.workoutCompleted).length;
          if (doneWorkouts > 0) {
            return [courseId, Math.min(100, Math.round((doneWorkouts / total) * 100))] as const;
          }

          if (courseProg.workoutsProgress.length > 0) {
            const details = await Promise.all(
              courseProg.workoutsProgress.map((w) =>
                getWorkout(w.workoutId, token).catch(() => null),
              ),
            );
            let sumFractions = 0;
            for (let i = 0; i < courseProg.workoutsProgress.length; i++) {
              const wDet = details[i];
              if (!wDet) continue;
              const required = (wDet.exercises ?? []).reduce((a, ex) => a + (ex.quantity || 0), 0);
              const done = (courseProg.workoutsProgress[i].progressData ?? []).reduce(
                (a, n) => a + (n || 0),
                0,
              );
              if (required > 0) sumFractions += Math.max(0, Math.min(1, done / required));
            }
            return [courseId, Math.min(100, Math.round((sumFractions / total) * 100))] as const;
          }

          return [courseId, 0] as const;
        } catch {
          return [courseId, 0] as const;
        }
      }),
    );

    setCoursePercents(Object.fromEntries(entries));
  }, [isReady, isAuthed, token, selectedCourseIds]);

  const VISITED_STORAGE_KEY = 'visitedWorkoutsByCourse';
  function clearVisitedLocal(courseId: string) {
    try {
      const raw = localStorage.getItem(VISITED_STORAGE_KEY);
      if (!raw) return;
      const all = JSON.parse(raw) as Record<string, string[]>;
      if (all[courseId]) {
        delete all[courseId];
        localStorage.setItem(VISITED_STORAGE_KEY, JSON.stringify(all));
      }
    } catch {}
  }

  const resetCourse = useCallback(
    async (courseId: string, opts?: { silent?: boolean }): Promise<boolean> => {
      if (!isAuthed || !token) {
        if (!opts?.silent) openAuthModal('login');
        return false;
      }
      if (resettingId) return false;

      setResettingId(courseId);
      try {
        await resetCourseProgress(courseId, token).catch(() => {});
        clearVisitedLocal(courseId);
        setCoursePercents((prev) => ({ ...prev, [courseId]: 0 }));
        return true;
      } catch {
        return false;
      } finally {
        setResettingId(null);
      }
    },
    [isAuthed, token, openAuthModal, resettingId],
  );

  return { coursePercents, recomputePercents, resetCourse, resettingId };
}
