import { API_BASE } from '../constants';
import { fetchJson } from '../api/fetchJson';
import { ApiError } from '../api/apiError';

export type RegisterPayload = { email: string; password: string };
export type RegisterResponse = { message: string };

export type LoginPayload = { email: string; password: string };
export type LoginResponse = { token: string };

export function registerUser(payload: RegisterPayload) {
  return fetchJson<RegisterResponse>(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: LoginPayload) {
  return fetchJson<LoginResponse>(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getApiErrorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 401) return 'Неверный email или пароль.';
    if (e.status === 429) return 'Слишком много попыток. Попробуйте позже.';
    return e.message || `Ошибка: ${e.status}`;
  }
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return 'Неизвестная ошибка';
}
