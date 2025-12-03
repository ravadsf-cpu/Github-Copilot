import { STORAGE_KEYS } from '../constants';

export function getBookmarks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKS) || '[]'); } catch { return []; }
}

export function isBookmarked(url) {
  return getBookmarks().some((b) => b.url === url);
}

export function toggleBookmark(article) {
  const list = getBookmarks();
  const idx = list.findIndex((b) => b.url === article.url);
  if (idx >= 0) list.splice(idx, 1);
  else list.unshift({ url: article.url, title: article.title, savedAt: Date.now(), article });
  try { localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list.slice(0, 500))); } catch {}
  return list;
}
