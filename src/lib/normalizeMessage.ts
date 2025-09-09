export function normalizeApiMessage(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      'message' in parsed &&
      typeof (parsed as { message?: unknown }).message === 'string'
    ) {
      return (parsed as { message: string }).message;
    }
  } catch {}

  const m = raw.match(/"message"\s*:\s*"([^"]+)"/);
  if (m?.[1]) return m[1];

  return raw;
}
