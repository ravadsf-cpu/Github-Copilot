// High-performance in-memory cache with intelligent TTL and background refresh
class ArticleCache {
  constructor() {
    this.cache = new Map();
    this.trendingCache = null;
    this.trendingLastUpdate = 0;
    this.locks = new Map(); // Prevent cache stampede
  }

  // Generate cache key
  key(category, preference = 'balanced') {
    return `articles:${category}:${preference}`;
  }

  // Get cached articles
  get(category, preference = 'balanced') {
    const k = this.key(category, preference);
    const entry = this.cache.get(k);
    
    if (!entry) return null;
    
    const now = Date.now();
    const age = now - entry.timestamp;
    
    // Hard expire after 10 minutes
    if (age > 600000) {
      this.cache.delete(k);
      return null;
    }
    
    // Soft expire after 3 minutes (return stale but trigger background refresh)
    if (age > 180000) {
      return { data: entry.data, stale: true };
    }
    
    return { data: entry.data, stale: false };
  }

  // Set cached articles
  set(category, articles, preference = 'balanced') {
    const k = this.key(category, preference);
    this.cache.set(k, {
      data: articles,
      timestamp: Date.now(),
    });
  }

  // Acquire lock for background refresh (prevent stampede)
  async acquireLock(key, timeout = 5000) {
    if (this.locks.has(key)) {
      const lockTime = this.locks.get(key);
      if (Date.now() - lockTime < timeout) {
        return false; // Lock already held
      }
    }
    this.locks.set(key, Date.now());
    return true;
  }

  // Release lock
  releaseLock(key) {
    this.locks.delete(key);
  }

  // Get trending topics cache
  getTrending() {
    const now = Date.now();
    if (this.trendingCache && (now - this.trendingLastUpdate) < 300000) {
      return this.trendingCache;
    }
    return null;
  }

  // Set trending topics cache
  setTrending(topics) {
    this.trendingCache = topics;
    this.trendingLastUpdate = Date.now();
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.trendingCache = null;
    this.trendingLastUpdate = 0;
  }

  // Get cache stats
  stats() {
    return {
      entries: this.cache.size,
      trending: this.trendingCache ? 'cached' : 'empty',
      trendingAge: this.trendingCache ? Date.now() - this.trendingLastUpdate : 0,
    };
  }
}

// Singleton instance
const cache = new ArticleCache();

module.exports = { cache, ArticleCache };
