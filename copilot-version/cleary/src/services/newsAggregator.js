import { ENDPOINTS, TIMINGS } from '../constants';
import { withSWR } from './cache';
import { apiGet } from './api';

function normalizeTitle(t) {
  return (t || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function dedupeArticles(list) {
  const seen = new Set();
  const out = [];
  for (const a of list) {
    const key = a.url || normalizeTitle(a.title);
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(a);
  }
  return out;
}

export async function fetchAggregatedNews(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v != null && qs.set(k, v));

  const [fast, full] = await Promise.allSettled([
    apiGet(`${ENDPOINTS.NEWS_FAST}?${qs}`),
    apiGet(`${ENDPOINTS.NEWS_FULL}?${qs}`)
  ]);

  const fastArticles = fast.status === 'fulfilled' ? (fast.value.articles || []) : [];
  const fullArticles = full.status === 'fulfilled' ? (full.value.articles || []) : [];
  const combined = dedupeArticles([...fastArticles, ...fullArticles]);
  return { articles: combined, total: combined.length };
}

export function getAggregatedNewsSWR(params = {}) {
  const key = `agg:${JSON.stringify(params)}`;
  return withSWR(key, () => fetchAggregatedNews(params), {
    staleMs: TIMINGS.SWR_STALE_MS,
    hardMs: TIMINGS.SWR_HARD_MS,
  });
}
