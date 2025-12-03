// Fast news endpoint - returns cached articles instantly without AI enrichment
const { cache } = require('./_lib/cache');
const { fetchFromRSS, detectTrendingTopics } = require('./_lib/shared');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=60'); // 1 min cache

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { category = 'breaking', preference = 'balanced' } = req.query;
    
    // Always try cache first
    const cached = cache.get(category, preference);
    if (cached && !cached.stale) {
      console.log(`✅ [news-fast] Cache HIT for ${category}`);
      return res.status(200).json({ 
        articles: cached.data.slice(0, 20), // Fast = first 20 only
        trending: cache.getTrending(),
        cached: true,
        fast: true
      });
    }

    // If cache is stale, serve it anyway but flag for refresh
    if (cached && cached.stale) {
      console.log(`⚡ [news-fast] Serving STALE cache for ${category}`);
      return res.status(200).json({ 
        articles: cached.data.slice(0, 20),
        trending: cache.getTrending(),
        cached: true,
        stale: true,
        fast: true
      });
    }

    // No cache at all - fetch quickly without enrichment
    console.log(`❌ [news-fast] Cache MISS, fetching basic RSS...`);
    let articles = [];
    
    try {
      articles = await Promise.race([
        fetchFromRSS(category),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);
    } catch (e) {
      console.error('[news-fast] RSS fetch error:', e.message);
      // Return empty array, let client fall back to full endpoint
      return res.status(200).json({ 
        articles: [],
        fast: true,
        error: 'Fetch timeout - use /api/news for full results'
      });
    }

    // Basic formatting only (no AI, no media scraping)
    const formatted = articles.slice(0, 20).map(a => ({
      id: a.url || a.title,
      title: a.title,
      summary: (a.description || '').slice(0, 160),
      description: a.description,
      image: a.urlToImage || a.image,
      url: a.url,
      source: a.source?.name || 'Unknown',
      category: a.category || category,
      publishedAt: a.publishedAt,
      content: a.content || a.description,
      media: { images: [], videos: [] }, // Skip media scraping
      lean: 'center',
      readTime: 3
    }));

    // Cache it for next time
    cache.set(category, preference, formatted);

    return res.status(200).json({ 
      articles: formatted,
      fast: true,
      cached: false
    });
  } catch (error) {
    console.error('[news-fast] Error:', error);
    return res.status(500).json({ 
      articles: [],
      error: error.message,
      fast: true
    });
  }
};
