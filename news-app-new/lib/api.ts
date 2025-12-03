import { ENDPOINTS, TIMINGS } from './constants';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMINGS.requestTimeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal, cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function getArticles() {
  return fetchJson<any[]>(ENDPOINTS.articles);
}

export async function getShorts() {
  return fetchJson<any[]>(ENDPOINTS.shorts);
}
