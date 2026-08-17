const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

interface AttemptWindow {
  failures: number;
  resetAt: number;
}

const attempts = new Map<string, AttemptWindow>();

export function loginClientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export function loginRetryAfterSeconds(key: string, now = Date.now()): number {
  const attempt = attempts.get(key);
  if (!attempt || attempt.resetAt <= now) {
    attempts.delete(key);
    return 0;
  }
  return attempt.failures >= MAX_FAILURES ? Math.ceil((attempt.resetAt - now) / 1000) : 0;
}

export function recordLoginFailure(key: string, now = Date.now()): number {
  if (attempts.size >= 1_000 && !attempts.has(key)) {
    const oldestKey = attempts.keys().next().value;
    if (oldestKey) attempts.delete(oldestKey);
  }
  const current = attempts.get(key);
  const attempt = !current || current.resetAt <= now
    ? { failures: 0, resetAt: now + WINDOW_MS }
    : current;

  attempt.failures += 1;
  attempts.set(key, attempt);
  return loginRetryAfterSeconds(key, now);
}

export function clearLoginFailures(key: string): void {
  attempts.delete(key);
}
