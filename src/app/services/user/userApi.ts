import { API_BASE } from '../constants';

export type MeResponse = {
  email: string;
  selectedCourses: string[];
};

function hasMessage(v: unknown): v is { message: string } {
  return typeof v === 'object' && v !== null && 'message' in v;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function extractId(v: unknown): string | null {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (isRecord(v)) {
    const id = (v as Record<string, unknown>)._id ?? (v as Record<string, unknown>).id;
    if (typeof id === 'string') return id;
    if (typeof id === 'number') return String(id);
  }
  return null;
}

async function parseJSON(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || 'Неизвестная ошибка' };
  }
}

export async function getCurrentUser(token: string): Promise<MeResponse> {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  const data = await parseJSON(res);
  if (!res.ok) {
    const msg =
      isRecord(data) && typeof (data as Record<string, unknown>).message === 'string'
        ? ((data as Record<string, unknown>).message as string)
        : `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const base =
    isRecord(data) && isRecord((data as Record<string, unknown>).user)
      ? ((data as Record<string, unknown>).user as Record<string, unknown>)
      : (data as Record<string, unknown>);

  const email = typeof base.email === 'string' ? base.email : '';

  const rawSelected = Array.isArray(base.selectedCourses)
    ? (base.selectedCourses as unknown[])
    : [];

  const selected = rawSelected.map(extractId).filter((x): x is string => x !== null);

  return { email, selectedCourses: selected };
}

export async function addCourseToMe(token: string, courseId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/users/me/courses`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ courseId }),
  });

  const data = await parseJSON(res);
  if (!res.ok) {
    const msg = hasMessage(data) ? data.message : `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return hasMessage(data) ? data.message : 'Курс успешно добавлен!';
}

export async function removeCourseFromMe(token: string, courseId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/users/me/courses/${courseId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await parseJSON(res);

  if (!res.ok) {
    const msg = hasMessage(data) ? data.message : `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return hasMessage(data) ? data.message : 'Курс успешно удален!';
}
