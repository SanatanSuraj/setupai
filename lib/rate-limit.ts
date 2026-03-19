/**
 * In-memory rate limiter for password reset requests.
 * Limits: 3 requests per 15 minutes per IP, 3 per email.
 * For production at scale, use Redis or similar.
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 3;

type Entry = { count: number; resetAt: number };

const ipStore = new Map<string, Entry>();
const emailStore = new Map<string, Entry>();

function prune(store: Map<string, Entry>) {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

export function checkRateLimit(ip: string, email?: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();

  // Prune old entries periodically
  if (Math.random() < 0.05) prune(ipStore);
  if (Math.random() < 0.05) prune(emailStore);

  const ipEntry = ipStore.get(ip);
  if (ipEntry && ipEntry.count >= MAX_REQUESTS) {
    return { ok: false, retryAfter: Math.ceil((ipEntry.resetAt - now) / 1000) };
  }

  if (email) {
    const emailEntry = emailStore.get(email.toLowerCase());
    if (emailEntry && emailEntry.count >= MAX_REQUESTS) {
      return { ok: false, retryAfter: Math.ceil((emailEntry.resetAt - now) / 1000) };
    }
  }

  return { ok: true };
}

export function recordRequest(ip: string, email?: string): void {
  const now = Date.now();
  const resetAt = now + WINDOW_MS;

  const ipEntry = ipStore.get(ip);
  if (ipEntry) {
    ipEntry.count += 1;
    if (ipEntry.resetAt <= now) {
      ipEntry.count = 1;
      ipEntry.resetAt = resetAt;
    }
  } else {
    ipStore.set(ip, { count: 1, resetAt });
  }

  if (email) {
    const emailKey = email.toLowerCase();
    const emailEntry = emailStore.get(emailKey);
    if (emailEntry) {
      emailEntry.count += 1;
      if (emailEntry.resetAt <= now) {
        emailEntry.count = 1;
        emailEntry.resetAt = resetAt;
      }
    } else {
      emailStore.set(emailKey, { count: 1, resetAt });
    }
  }
}

/** Rate limit for reset-password submit (10 attempts per 15 min per IP) */
const resetAttemptsStore = new Map<string, Entry>();
const RESET_MAX = 10;

export function checkResetRateLimit(ip: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  if (Math.random() < 0.05) prune(resetAttemptsStore);
  const entry = resetAttemptsStore.get(ip);
  if (entry && entry.count >= RESET_MAX) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true };
}

export function recordResetAttempt(ip: string): void {
  const now = Date.now();
  const resetAt = now + WINDOW_MS;
  const entry = resetAttemptsStore.get(ip);
  if (entry) {
    entry.count += 1;
    if (entry.resetAt <= now) {
      entry.count = 1;
      entry.resetAt = resetAt;
    }
  } else {
    resetAttemptsStore.set(ip, { count: 1, resetAt });
  }
}
