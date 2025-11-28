const { fetchFromRSS, summarizeWithAI, detectCategory, scoreLean, detectPoliticalLeanAI, genAI, toEmbedFromUrl, extractMediaFromHtml, deduplicateArticles, detectTrendingTopics } = require('./_lib/shared');
const { cache } = require('./_lib/cache');
let fetch;
try { fetch = require('node-fetch'); } catch { /* Node 18 runtime may have global fetch */ }
const cheerio = require('cheerio');

async function tryFetch(url, options = {}, timeoutMs = 2500) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await (fetch ? fetch(url, { ...options, signal: ctrl.signal }) : global.fetch(url, { ...options, signal: ctrl.signal }));
    return resp;
  } finally {
    clearTimeout(id);
  }
}

async function scrapeMedia(url) {
  try {
    const resp = await tryFetch(url, { redirect: 'follow' });
    if (!resp || !resp.ok) return { videos: [], images: [] };
    const html = await resp.text();
    const $ = cheerio.load(html);
    const collectedImages = [];
    const collectedVideos = [];

    // OG / Twitter meta
    $('meta[property="og:image"], meta[name="og:image"], meta[property="twitter:image"], meta[name="twitter:image"]').each((_, el) => {
      const content = $(el).attr('content');
      if (content) collectedImages.push(content);
    });
    $('meta[property="og:video"], meta[property="og:video:secure_url"], meta[name="twitter:player"]').each((_, el) => {
      const v = $(el).attr('content');
      if (v) {
        const emb = toEmbedFromUrl(v) || { kind: 'iframe', src: v };
        collectedVideos.push(emb);
      }
    });

    // Inline HTML media using shared extractor (captures imgs, iframes, video tags, sources, links, JSON-LD VideoObject)
    const { images: htmlImgs, videos: htmlVids } = extractMediaFromHtml(html);
    htmlImgs.forEach(i => collectedImages.push(i.src || i));
    htmlVids.forEach(v => collectedVideos.push(v));

    // Add thumbnails for YouTube/Vimeo if missing
    collectedVideos.forEach(v => {
      if (!v || !v.src || v.thumbnail) return;
      if (/youtube\.com\/embed\//.test(v.src)) {
        const id = v.src.split('/').pop();
        v.thumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      } else if (/player\.vimeo\.com\/video\//.test(v.src)) {
        const id = v.src.split('/').pop();
        v.thumbnail = `https://vumbnail.com/${id}.jpg`;
      }
    });

    // Deduplicate
    const dedupMedia = (arr, keyFn) => {
      const seen = new Set();
      return arr.filter(item => {
        const key = keyFn(item);
        if (!key || seen.has(key)) return false;
        seen.add(key); return true;
      });
    };
    const videos = dedupMedia(collectedVideos, v => v.src);
    const images = dedupMedia(collectedImages, u => u);

    return { videos, images };
  } catch (e) {
    console.warn('scrapeMedia failed for', url, e.message);
    return { videos: [], images: [] };
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
  const { category = 'breaking', preference = 'balanced', query, userLean, includeTrending = 'true' } = req.query;
    
    // CHECK CACHE FIRST (instant response!)
    const cached = cache.get(category, preference);
    if (cached && !cached.stale) {
      console.log(`✅ Cache HIT for ${category} (age: ${Date.now() - cache.cache.get(cache.key(category, preference)).timestamp}ms)`);
      
      // Add trending topics if requested
      let trending = null;
      if (includeTrending === 'true') {
        trending = cache.getTrending() || await detectTrendingTopics(cached.data);
        if (!cache.getTrending()) cache.setTrending(trending);
      }
      
      return res.status(200).json({ 
        articles: cached.data,
        trending,
        cached: true,
        cacheStats: cache.stats()
      });
    }
    
    // Serve stale cache while refreshing in background
    if (cached && cached.stale) {
      console.log(`⚡ Serving STALE cache for ${category}, refreshing in background...`);
      
      // Return stale data immediately
      const response = { 
        articles: cached.data,
        trending: cache.getTrending(),
        cached: true,
        stale: true
      };
      
      // Trigger background refresh (fire and forget)
      if (await cache.acquireLock(`refresh:${category}:${preference}`)) {
        refreshCacheInBackground(category, preference).finally(() => {
          cache.releaseLock(`refresh:${category}:${preference}`);
        });
      }
      
      return res.status(200).json(response);
    }
    
    console.log(`❌ Cache MISS for ${category}, fetching fresh...`);
    
    let articles = [];
    try {
      articles = await Promise.race([
        fetchFromRSS(category),
        new Promise((_, reject) => setTimeout(() => reject(new Error('RSS fetch timeout')), 15000))
      ]);
    } catch (fetchError) {
      console.error('Error fetching RSS articles:', fetchError.message);
      // fetchFromRSS already returns fallback articles if it fails completely
      articles = await fetchFromRSS(category);
    }
    
    if (!articles || articles.length === 0) {
      return res.status(200).json({ 
        articles: [{
          title: 'No Articles Available',
          description: 'Unable to fetch articles at this time. Please try again later.',
          url: '#',
          urlToImage: '',
          source: { name: 'System' },
          publishedAt: new Date().toISOString(),
          content: '',
          contentHtml: '',
          media: { images: [], videos: [] },
        }],
        trending: [],
        cached: false
      });
    }
    
    // Enhanced AI processing - skip summaries (show full content by default), focus on classification
    const useAI = genAI && articles.length < 30; // Use AI for batches up to 30
    
    articles = await Promise.all(articles.map(async (article) => {
      // Keep original description as summary, or generate brief one from first sentences
      const summary = article.description || 
        (article.content || '').match(/[^.!?]+[.!?]+/g)?.slice(0, 3).join(' ').slice(0, 300) || 
        (article.content || '').slice(0, 300);
      
      const detectedCategory = useAI
        ? await detectCategory(article.title, article.description)
        : category || 'general';
      
      // Use AI-enhanced political lean detection for better accuracy
      const leanEval = useAI
        ? await detectPoliticalLeanAI(article.title, article.description, article.content)
        : scoreLean(
            `${article.title || ''}. ${article.description || ''} ${article.content || ''}`,
            article.source?.name || '',
            article.url || ''
          );
      
      return {
        ...article,
        summary,
        category: detectedCategory,
        lean: leanEval.label,
        leanScore: leanEval.score,
        leanReasons: leanEval.reasons,
        leanConfidence: leanEval.confidence || 0.5,
        id: article.url,
        readTime: Math.ceil((article.content || article.description || '').split(' ').length / 200),
      };
    }));

    // Aggressive enrichment: scrape ALL articles with controlled concurrency
    const CONCURRENCY = 8;
    const queue = [...articles];
    const runners = Array.from({ length: CONCURRENCY }, () => (async () => {
      while (queue.length) {
        const a = queue.shift();
        if (!a || !a.url) continue;
        try {
          const needsVideo = !a.media || !(a.media.videos && a.media.videos.length);
          const needsImage = !a.urlToImage;
          if (needsVideo || needsImage) {
            const m = await scrapeMedia(a.url);
            if (m.videos && m.videos.length) {
              a.media = a.media || { images: [], videos: [] };
              a.media.videos = m.videos;
              // Promote first video thumbnail as card image if none
              if (!a.urlToImage && m.videos[0].thumbnail) {
                a.urlToImage = m.videos[0].thumbnail;
              }
            }
            if ((!a.urlToImage || a.urlToImage === '') && m.images && m.images.length) {
              a.urlToImage = m.images[0];
            }
            if (m.images && m.images.length) {
              a.media = a.media || { images: [], videos: [] };
              const existing = (a.media.images || []).map(i => i.src || i);
              const merged = [...existing, ...m.images];
              const seenImg = new Set();
              a.media.images = merged.filter(u => { if (!u || seenImg.has(u)) return false; seenImg.add(u); return true; }).map(u => (typeof u === 'string' ? { src: u } : u));
            }
          }
        } catch (enErr) {
          console.warn('Enrichment error for', a.url, enErr.message);
        }
      }
    })());
    await Promise.all(runners);

    // SMART DEDUPLICATION: Remove duplicate articles
    articles = deduplicateArticles(articles);
    console.log(`🔄 Deduplicated: ${articles.length} unique articles`);

    // Filter out incomplete articles - keep articles with ANY substantial content
    articles = articles.filter(a => {
      const hasContent = (a.content && a.content.length > 100) || 
                        (a.contentHtml && a.contentHtml.length > 100) ||
                        (a.description && a.description.length > 80) ||
                        (a.summary && a.summary.length > 80);
      const hasTitle = a.title && a.title.length > 10;
      return hasContent && hasTitle;
    });
    
    console.log(`✅ Filtered to ${articles.length} complete articles`);

    // Sort: prioritize video articles first then preserve original relative ordering
    articles.sort((a,b) => {
      const av = (a.media?.videos?.length || 0) ? 1 : 0;
      const bv = (b.media?.videos?.length || 0) ? 1 : 0;
      if (av === bv) return 0; return bv - av; // videos first
    });

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(lowerQuery) || 
        a.description.toLowerCase().includes(lowerQuery)
      );
    }

    // Sort by preference: reinforce/challenge/balanced
    const normalizeLean = (l) => ({
      'left': -1, 'lean-left': -0.5, 'center': 0, 'lean-right': 0.5, 'right': 1
    }[l] ?? 0);

    const desired = typeof userLean === 'string' && userLean
      ? normalizeLean(userLean)
      : null;

    if (preference === 'reinforce') {
      if (desired !== null) {
        // sort by closeness to desired
        articles.sort((a,b) => Math.abs(normalizeLean(b.lean) - desired) - Math.abs(normalizeLean(a.lean) - desired));
      } else {
        // emphasize stronger opinions when desired unknown
        articles.sort((a,b) => Math.abs(b.leanScore) - Math.abs(a.leanScore));
      }
    } else if (preference === 'challenge') {
      if (desired !== null) {
        // show opposite first
        articles.sort((a,b) => Math.abs(normalizeLean(a.lean) - desired) - Math.abs(normalizeLean(b.lean) - desired));
      } else {
        // emphasize balance then extremes
        articles.sort((a,b) => Math.abs(a.leanScore) - Math.abs(b.leanScore));
      }
    } // balanced: keep existing recency-based order

    // CACHE THE RESULTS for lightning-fast future requests
    cache.set(category, articles, preference);
    console.log(`💾 Cached ${articles.length} articles for ${category}`);

    // AI TRENDING TOPICS detection
    let trending = [];
    if (includeTrending === 'true') {
      trending = cache.getTrending();
      if (!trending) {
        trending = await detectTrendingTopics(articles);
        cache.setTrending(trending);
        console.log(`🔥 Detected ${trending.length} trending topics`);
      }
    }

    res.status(200).json({ 
      articles,
      trending,
      cached: false,
      cacheStats: cache.stats()
    });
  } catch (error) {
    console.error('News API error:', error);
    res.status(500).json({ error: 'Failed to fetch news', articles: [], trending: [] });
  }
};

// Background refresh function (non-blocking)
async function refreshCacheInBackground(category, preference) {
  try {
    console.log(`🔄 Background refresh started for ${category}...`);
    const articles = await fetchFromRSS(category);
    
    if (articles && articles.length > 0) {
      // Quick processing without slow enrichment
      const processed = articles.map(article => ({
        ...article,
        lean: scoreLean(`${article.title} ${article.description}`, article.source?.name || '', article.url || ''),
        id: article.url,
        readTime: Math.ceil((article.content || article.description).split(' ').length / 200),
      }));
      
      const deduplicated = deduplicateArticles(processed);
      cache.set(category, deduplicated, preference);
      
      // Update trending topics
      const trending = await detectTrendingTopics(deduplicated);
      cache.setTrending(trending);
      
      console.log(`✅ Background refresh complete: ${deduplicated.length} articles cached`);
    }
  } catch (error) {
    console.error('Background refresh failed:', error.message);
  }
}
