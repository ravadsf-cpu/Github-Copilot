import { STORAGE_KEYS } from '../constants';
import { apiPost } from './api';

// Simple client-side profile persisted in localStorage
export function getUserProfile() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PROFILE) || '{}'); } catch { return {}; }
}

export function saveUserProfile(p) {
  try { localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(p)); } catch {}
}

export function updateProfileWithInteraction(article, interaction) {
  const p = getUserProfile();
  // Seed
  p.interests = p.interests || {};
  p.leanClicks = p.leanClicks || { left: 0, center: 0, right: 0 };
  p.readTime = p.readTime || 0;

  // Title-based interest extraction (naive keywords)
  const words = (article.title || '').toLowerCase().match(/[a-z]{4,}/g) || [];
  words.slice(0, 8).forEach((w) => { p.interests[w] = (p.interests[w] || 0) + 1; });

  // Lean
  const lean = (article.lean || 'center').includes('left') ? 'left' : (article.lean || 'center').includes('right') ? 'right' : 'center';
  p.leanClicks[lean] = (p.leanClicks[lean] || 0) + 1;

  // Reading time / engagement
  if (interaction?.readTime) p.readTime += interaction.readTime;
  if (interaction?.liked) p.lastLiked = Date.now();

  saveUserProfile(p);
  // Fire and forget to backend (if available)
  apiPost('/api/user/interactions', {
    type: interaction?.type || 'click',
    article: { url: article.url, title: article.title, lean: article.lean },
    engagement: interaction || {},
  }).catch(() => {});
  return p;
}

export function scoreArticle(article, profile) {
  const now = Date.now();
  const recencyHours = (() => {
    try { return Math.max(0, (now - new Date(article.publishedAt || 0).getTime()) / 36e5); } catch { return 999; }
  })();

  const recencyScore = Math.max(0, 1 - recencyHours / 48); // 0..1 over 48h

  // Interest score: overlap of title keywords with profile.interests
  const words = (article.title || '').toLowerCase().match(/[a-z]{4,}/g) || [];
  let interestScore = 0;
  const interests = profile?.interests || {};
  words.slice(0, 8).forEach((w) => { if (interests[w]) interestScore += 0.08; }); // capped roughly at ~0.6
  interestScore = Math.min(0.6, interestScore);

  // Lean alignment
  const lean = (article.lean || 'center').includes('left') ? 'left' : (article.lean || 'center').includes('right') ? 'right' : 'center';
  const clicks = profile?.leanClicks || { left: 0, center: 0, right: 0 };
  const total = Math.max(1, clicks.left + clicks.center + clicks.right);
  const pref = { left: clicks.left / total, center: clicks.center / total, right: clicks.right / total };
  const alignment = pref[lean] || 0.33; // 0..1
  const leanScore = (alignment - 0.33) * 0.4; // -0.132..+0.268 weight

  // Video preference boost
  const videoBoost = article.media?.videos?.length ? 0.12 : 0;

  return recencyScore + interestScore + leanScore + videoBoost;
}

export function rerankArticles(articles) {
  const profile = getUserProfile();
  return [...articles]
    .map((a) => ({ a, s: scoreArticle(a, profile) }))
    .sort((x, y) => y.s - x.s)
    .map((o) => o.a);
}
