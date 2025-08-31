import { API_BASE } from '../constants';
import { fetchJson } from '../api/fetchJson';

export type MeResponse = {
  email: string;
  selectedCourses: string[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function extractId(v: unknown): string | null {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (isRecord(v)) {
    const id = (v._id ?? v.id) as unknown;
    if (typeof id === 'string') return id;
    if (typeof id === 'number') return String(id);
  }
  return null;
}

function normalizeMe(data: unknown): MeResponse {
  const base =
    isRecord(data) && isRecord(data.user)
      ? (data.user as Record<string, unknown>)
      : (data as Record<string, unknown>);

  const email = isRecord(base) && typeof base.email === 'string' ? base.email : '';

  const rawSelected =
    isRecord(base) && Array.isArray(base.selectedCourses)
      ? (base.selectedCourses as unknown[])
      : [];

  const selected = rawSelected.map(extractId).filter((x): x is string => x !== null);

  return { email, selectedCourses: selected };
}

export async function getCurrentUser(token: string): Promise<MeResponse> {
  const data = await fetchJson<unknown>(`${API_BASE}/users/me`, {
    method: 'GET',
    token,
  });
  return normalizeMe(data);
}

export async function addCourseToMe(token: string, courseId: string): Promise<string> {
  const data = await fetchJson<{ message?: string }>(`${API_BASE}/users/me/courses`, {
    method: 'POST',
    token,
    body: JSON.stringify({ courseId }),
  });
  return data?.message ?? 'Курс успешно добавлен!';
}

export async function removeCourseFromMe(token: string, courseId: string): Promise<string> {
  const data = await fetchJson<{ message?: string }>(`${API_BASE}/users/me/courses/${courseId}`, {
    method: 'DELETE',
    token,
  });
  return data?.message ?? 'Курс успешно удалён!';
}
