import { API_BASE } from '../constants';

export type MeResponse = {
  email: string;
  selectedCourses: string[];
};

async function parseJSON(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || 'Неизвестная ошибка' }; // ← важно: return { ... }
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
    const msg = (data as { message?: string })?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as MeResponse;
}
