'use client';

import { useCallback, useEffect, useState } from 'react';
import { getCurrentUser, addCourseToMe, removeCourseFromMe } from '@/app/services/user/userApi';
import { resetCourseProgress } from '@/app/services/progress/progressApi';

type OpenAuthFn = (mode?: 'login' | 'register') => void;

type Params = {
  courseId: string;
  token: string | null;
  isReady: boolean;
  isAuthed: boolean;
  openAuthModal?: OpenAuthFn;
};

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

export function useCourseSelection({ courseId, token, isReady, isAuthed }: Params) {
  const [added, setAdded] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isReady || !isAuthed || !token) {
        if (!cancelled) setAdded(false);
        return;
      }
      try {
        const me = await getCurrentUser(token);
        if (!cancelled) {
          setAdded(me.selectedCourses.includes(courseId));
        }
      } catch {
        if (!cancelled) setAdded(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId, token, isReady, isAuthed]);

  const add = useCallback(async () => {
    if (!isReady || !isAuthed || !token || pending) return;
    setPending(true);
    const prev = added;
    setAdded(true);
    try {
      await addCourseToMe(token, courseId);
    } catch (e) {
      setAdded(prev);
      throw e;
    } finally {
      setPending(false);
    }
  }, [isReady, isAuthed, token, courseId, pending, added]);

  const remove = useCallback(async () => {
    if (!isReady || !isAuthed || !token || pending) return;
    setPending(true);
    const prev = added;
    setAdded(false);
    try {
      await Promise.allSettled([
        removeCourseFromMe(token, courseId),
        resetCourseProgress(courseId, token),
      ]);
      clearVisitedLocal(courseId);
    } catch (e) {
      setAdded(prev);
      throw e;
    } finally {
      setPending(false);
    }
  }, [isReady, isAuthed, token, courseId, pending, added]);

  return { added, pending, add, remove };
}
