import { ApiError } from './apiError';

type Options = RequestInit & { token?: string };

export async function fetchJson<T>(
  url: string,
  { token, headers, ...init }: Options = {},
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    let msg = '';
    try {
      msg = await res.text();
    } catch {}
    throw new ApiError(res.status, msg || res.statusText);
  }
  return res.json() as Promise<T>;
}
