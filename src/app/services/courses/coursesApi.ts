import type { UiCourse } from '@/sharedTypes/types';
import { API_BASE } from '../constants';
import { fetchJson } from '../api/fetchJson';

export type CourseListDto = {
  _id: string;
  nameRU: string;
  nameEN?: string;
  difficulty?: string;
  durationInDays?: number;
  dailyDurationInMinutes?: { from?: number; to?: number };
  description?: string;
  directions?: string[];
  fitting?: string[];
  workouts?: string[];
  order?: number;
  __v?: number;
};

export type CourseDetailDto = {
  _id: string;
  nameRU: string;
  nameEN?: string;
  description?: string;
  directions: string[];
  fitting: string[];
  difficulty?: string;
  durationInDays?: number;
  dailyDurationInMinutes?: { from?: number; to?: number };
  workouts: string[];
};

const difficultyMap = {
  начальный: 'Лёгкий',
  средний: 'Средний',
  сложный: 'Сложный',
} as const;
type UiDifficulty = (typeof difficultyMap)[keyof typeof difficultyMap];

function mapDifficulty(src?: string): UiDifficulty {
  const key = (src ?? '').toLowerCase() as keyof typeof difficultyMap;
  return difficultyMap[key] ?? 'Сложный';
}

function fmtDailyMinutes(r?: { from?: number; to?: number }): string {
  if (!r) return '—';
  const f = r.from ?? r.to;
  const t = r.to ?? r.from;
  if (f == null && t == null) return '—';
  if (f != null && t != null && f !== t) return `${f}–${t} мин/день`;
  return `${f ?? t} мин/день`;
}

function slugify(nameEN?: string, nameRU?: string, id?: string): string {
  const base = (nameEN || nameRU || id || '').toString().trim().toLowerCase();
  return base.replace(/\s+/g, '-');
}

const COURSE_IMAGES: Record<string, string> = {
  yoga: '/courses/yoga.png',
  stretching: '/courses/stretching.png',
  fitness: '/courses/fitness.png',
  stepairobic: '/courses/stepairobic.png',
  bodyflex: '/courses/bodyflex.png',
};

function pickImage(slug: string): string {
  return COURSE_IMAGES[slug] ?? '/courses/placeholder.svg';
}

export async function listCourses(): Promise<UiCourse[]> {
  const data = await fetchJson<unknown>(`${API_BASE}/courses`, { method: 'GET' });
  if (!Array.isArray(data)) return [];
  return (data as CourseListDto[]).map((dto) => {
    const slug = slugify(dto.nameEN, dto.nameRU, dto._id);
    return {
      _id: dto._id,
      slug,
      image: pickImage(slug),
      title: dto.nameRU || dto.nameEN || 'Без названия',
      days: dto.durationInDays ?? 0,
      dailyMinutes: fmtDailyMinutes(dto.dailyDurationInMinutes),
      difficulty: mapDifficulty(dto.difficulty),
    } satisfies UiCourse;
  });
}

export async function getCourseById(id: string): Promise<CourseDetailDto> {
  const d = await fetchJson<Partial<CourseDetailDto> | null>(`${API_BASE}/courses/${id}`, {
    method: 'GET',
  });

  return {
    _id: d?._id ?? id,
    nameRU: d?.nameRU ?? '',
    nameEN: d?.nameEN,
    description: d?.description,
    directions: Array.isArray(d?.directions) ? d!.directions! : [],
    fitting: Array.isArray(d?.fitting) ? d!.fitting! : [],
    difficulty: d?.difficulty,
    durationInDays: d?.durationInDays,
    dailyDurationInMinutes: d?.dailyDurationInMinutes,
    workouts: Array.isArray(d?.workouts) ? d!.workouts! : [],
  };
}
