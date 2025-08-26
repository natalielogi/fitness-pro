import { API_BASE } from '../constants';

export type RegisterPayload = { email: string; password: string };
export type RegisterResponse = { message: string };

export type LoginPayload = { email: string; password: string };
export type LoginResponse = { token: string };

function hasMessage(x: unknown): x is { message: string } {
  if (typeof x !== 'object' || x === null) return false;
  const rec = x as Record<string, unknown>;
  return typeof rec.message === 'string';
}

async function post<T>(path: string, payload: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  let data: unknown = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const msg = hasMessage(data) ? data.message : `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

export function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  return post<RegisterResponse>('/auth/register', payload);
}

export function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  return post<LoginResponse>('/auth/login', payload);
}

export function getApiErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return 'Неизвестная ошибка';
}
