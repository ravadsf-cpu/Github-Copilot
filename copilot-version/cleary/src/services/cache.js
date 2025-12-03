// Lightweight in-memory cache with TTL and SWR helpers

const memory = new Map();

export function setCache(key, value, ttlMs) {
  const now = Date.now();
  memory.set(key, { value, ts: now, ttl: ttlMs });
}

export function getCache(key) {
  const entry = memory.get(key);
  if (!entry) return { value: undefined, isStale: true, exists: false };
  const age = Date.now() - entry.ts;
  const isStale = entry.ttl != null ? age > entry.ttl : false;
  return { value: entry.value, isStale, exists: true, age };
}

export function deleteCache(key) { memory.delete(key); }
export function clearCache() { memory.clear(); }

export function withSWR(key, fetcher, { staleMs = 180000, hardMs = 600000 } = {}) {
  // Return cached immediately if exists; kick off background refresh based on stale/hard TTL
  const entry = memory.get(key);
  const now = Date.now();
  if (entry) {
    const age = now - entry.ts;
    if (age < hardMs) {
      // Serve cached
      const promise = (age > staleMs) ? fetcher().then((v) => { setCache(key, v, staleMs); return v; }).catch(()=>entry.value) : Promise.resolve(entry.value);
      return { data: entry.value, promise };
    }
  }
  // No cache or hard expired
  const p = fetcher().then((v) => { setCache(key, v, staleMs); return v; });
  return { data: undefined, promise: p };
}
