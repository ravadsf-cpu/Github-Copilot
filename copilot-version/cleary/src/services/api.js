import { TIMINGS } from '../constants';
import { getCache, setCache } from './cache';
import { fetchWithRetry } from '../utils/fetchWithRetry';

// In-flight request deduplication
const inflight = new Map();

export async function apiGet(url, { dedupeKey = url, dedupeMs = TIMINGS.REQUEST_DEDUPE_MS, timeoutMs = TIMINGS.CLIENT_TIMEOUT_MS } = {}) {
  const now = Date.now();
  const existing = inflight.get(dedupeKey);
  if (existing && (now - existing.ts < dedupeMs)) {
    return existing.promise;
  }
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  const p = fetchWithRetry(url, { signal: controller.signal })
    .then((res) => res.json())
    .finally(() => clearTimeout(to));
  inflight.set(dedupeKey, { ts: now, promise: p });
  return p;
}

export async function apiPost(url, body, opts = {}) {
  return fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...opts,
  }).then((r) => r.json());
}

export function cachedJson(key, fetcher, { ttlMs = TIMINGS.SWR_STALE_MS } = {}) {
  const c = getCache(key);
  if (c.exists && !c.isStale) return Promise.resolve(c.value);
  return fetcher().then((v) => { setCache(key, v, ttlMs); return v; });
}
