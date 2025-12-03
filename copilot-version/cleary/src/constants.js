// Centralized constants for endpoints, colors, timings

export const ENDPOINTS = {
  NEWS_FAST: '/api/news-fast',
  NEWS_FULL: '/api/news',
  SHORTS: '/api/shorts',
  SHORTS_ALT: '/api/shorts2',
  INTERACTIONS: '/api/interactions',
  USER_INTERACTIONS: '/api/user/interactions',
  LEAN: '/api/lean',
};

export const COLORS = {
  LEAN_LEFT: '#3B82F6',
  LEAN_RIGHT: '#EF4444',
  LEAN_CENTER: '#FBBF24',
};

export const TIMINGS = {
  SWR_STALE_MS: 3 * 60 * 1000, // soft TTL 3m
  SWR_HARD_MS: 10 * 60 * 1000, // hard TTL 10m
  REQUEST_DEDUPE_MS: 1500,
  CLIENT_TIMEOUT_MS: 4000,
};

export const FEED_RULES = {
  MAX_ARTICLE_AGE_HOURS: 48,        // drop anything older than 2 days from main feed
  HAPPENING_NOW_MAX_AGE_HOURS: 12,  // restrict "Happening Now" spotlight to last 12h
  MIN_RECENT_BOOST_HOURS: 4,        // strong boost zone for very fresh items
};

export const STORAGE_KEYS = {
  APP_VERSION: 'app_version',
  FAST_ARTICLES: 'fastArticles',
  FAST_ARTICLES_TS: 'fastArticles_ts',
  USER_PROFILE: 'user_profile',
  BOOKMARKS: 'bookmarks_v1',
  WATCH_HISTORY: 'shorts_watch_history_v1',
};

export const APP = {
  VERSION: '1.2.0',
};
