// Cache status API endpoint
const { cache } = require('./_lib/cache');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Clear cache if requested
  if (req.method === 'POST' && req.query.action === 'clear') {
    cache.clear();
    return res.status(200).json({ 
      success: true, 
      message: 'Cache cleared successfully',
      stats: cache.stats()
    });
  }

  // Return cache statistics
  const stats = cache.stats();
  const cacheEntries = [];
  
  cache.cache.forEach((value, key) => {
    const age = Date.now() - value.timestamp;
    cacheEntries.push({
      key,
      articleCount: value.data.length,
      ageMs: age,
      ageMinutes: (age / 60000).toFixed(1),
      stale: age > 180000,
      expired: age > 600000
    });
  });

  res.status(200).json({
    stats,
    entries: cacheEntries,
    trending: cache.getTrending() ? {
      topics: cache.getTrending().length,
      ageMinutes: ((Date.now() - cache.trendingLastUpdate) / 60000).toFixed(1)
    } : null,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
};
