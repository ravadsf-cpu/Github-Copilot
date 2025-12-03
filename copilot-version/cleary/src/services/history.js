import { STORAGE_KEYS } from '../constants';

export function getWatchHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCH_HISTORY) || '[]'); } catch { return []; }
}

export function addWatchHistory(item) {
  const list = getWatchHistory();
  // Dedup by URL
  const idx = list.findIndex((x) => x.url === item.url);
  if (idx >= 0) list.splice(idx, 1);
  list.unshift({ ...item, watchedAt: Date.now() });
  try { localStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(list.slice(0, 200))); } catch {}
  return list;
}
