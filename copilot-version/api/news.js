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

async function scrapeFullArticle(url) {
  try {
    const resp = await tryFetch(url, { redirect: 'follow' }, 5000);
    if (!resp || !resp.ok) return { videos: [], images: [] };
    const html = await resp.text();
    const $ = cheerio.load(html);
    const collectedImages = [];
    const collectedVideos = [];

    // Extract full article content from common selectors
    let fullContent = '';
    const contentSelectors = [
      'article', '.article-body', '.story-body', '.post-content', '.entry-content',
      '[itemprop="articleBody"]', '.article-content', 'main article', '.content-body'
    ];
    
    for (const selector of contentSelectors) {
      const elem = $(selector).first();
      if (elem.length && elem.text().trim().length > 500) {
        fullContent = elem.html();
        break;
      }
    }

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

    return { videos, images, content: fullContent ? cheerio.load(fullContent).text().trim() : null, contentHtml: fullContent };
  } catch (e) {
    console.warn('scrapeFullArticle failed for', url, e.message);
    return { videos: [], images: [], content: null, contentHtml: null };
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
  const { category = 'breaking', preference = 'balanced', query, userLean, includeTrending = 'true', forceRefresh = 'false', personalized = 'false', interests } = req.query;

    // Parse interests list (comma-separated)
    const interestsList = interests ? interests.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [];
    
    // CHECK CACHE FIRST (instant response!) unless forceRefresh requested
    const cached = forceRefresh === 'true' ? null : cache.get(category, preference);
    if (cached && !cached.stale) {
      console.log(`✅ Cache HIT for ${category} (age: ${Date.now() - cache.cache.get(cache.key(category, preference)).timestamp}ms)`);

      let articlesOut = cached.data;

      // Apply personalization dynamically on top of cached base (do NOT cache personalized ordering)
      if (personalized === 'true' && interestsList.length) {
        articlesOut = applyPersonalization(articlesOut, {
          interests: interestsList,
          preference,
          userLean
        });
      }

      // Add trending topics if requested
      let trending = null;
      if (includeTrending === 'true') {
        trending = cache.getTrending() || await detectTrendingTopics(cached.data);
        if (!cache.getTrending()) cache.setTrending(trending);
      }

      return res.status(200).json({ 
        articles: articlesOut,
        trending,
        cached: true,
        personalized: personalized === 'true',
        interests: interestsList,
        cacheStats: cache.stats(),
        forceRefreshed: false
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
    
  console.log(`${forceRefresh === 'true' ? '♻️ Forced refresh' : '❌ Cache MISS'} for ${category}, fetching fresh...`);
    
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
              const scraped = await scrapeFullArticle(a.url);
            
              // Update content if scraped content is longer
              if (scraped.content && scraped.content.length > (a.content || '').length) {
                a.content = scraped.content;
                a.contentHtml = scraped.contentHtml || scraped.content;
              }
            
              if (scraped.videos && scraped.videos.length) {
              a.media = a.media || { images: [], videos: [] };
                a.media.videos = scraped.videos;
              // Promote first video thumbnail as card image if none
                if (!a.urlToImage && scraped.videos[0].thumbnail) {
                  a.urlToImage = scraped.videos[0].thumbnail;
              }
            }
              if ((!a.urlToImage || a.urlToImage === '') && scraped.images && scraped.images.length) {
                a.urlToImage = scraped.images[0];
            }
              if (scraped.images && scraped.images.length) {
              a.media = a.media || { images: [], videos: [] };
              const existing = (a.media.images || []).map(i => i.src || i);
                const merged = [...existing, ...scraped.images];
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

      // DIVERSIFY SOURCES: Limit articles per source to avoid CNN/NYT domination
      const diversified = [];
      const sourceCount = new Map();
      const MAX_PER_SOURCE = 5;
    
      for (const article of articles) {
        const sourceName = (typeof article.source === 'string' ? article.source : article.source?.name || 'Unknown').toLowerCase();
        const count = sourceCount.get(sourceName) || 0;
      
        if (count < MAX_PER_SOURCE) {
          diversified.push(article);
          sourceCount.set(sourceName, count + 1);
        }
      }
    
      articles = diversified;
      console.log(`📊 Diversified to ${articles.length} articles from ${sourceCount.size} sources`);

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

    // Sort by preference: reinforce/challenge/balanced (base ordering prior to personalization)
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

    // Keep a copy before personalization for caching
    const baseForCache = articles.slice();

    // Apply personalization if requested (works on enriched articles)
    if (personalized === 'true' && interestsList.length) {
      articles = applyPersonalization(articles, {
        interests: interestsList,
        preference,
        userLean
      });
    }

    // CACHE THE BASE (non-personalized ordering) for lightning-fast future requests
    cache.set(category, baseForCache, preference);
    console.log(`💾 Cached ${baseForCache.length} articles for ${category} (base order)`);

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
      personalized: personalized === 'true',
      interests: interestsList,
      forceRefreshed: forceRefresh === 'true',
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

// Personalization scoring helper
function applyPersonalization(articles, { interests = [], preference = 'balanced', userLean }) {
  if (!Array.isArray(articles) || articles.length === 0) return articles;
  const interestsSet = new Set(interests.map(i => i.toLowerCase()));

  const normalizeLean = (l) => ({
    'left': -1, 'lean-left': -0.5, 'center': 0, 'lean-right': 0.5, 'right': 1
  }[l] ?? 0);
  const desiredLean = userLean ? normalizeLean(userLean) : null;

  const scored = articles.map(a => {
    const textBlob = `${a.title || ''} ${a.description || ''} ${a.content || ''}`.toLowerCase();
    let matchCount = 0;
    const matched = [];
    interestsSet.forEach(k => {
      if (k && textBlob.includes(k)) {
        matchCount += 1;
        matched.push(k);
      }
    });

    // Recency score (decays over 12h)
    let recencyScore = 0.6; // base
    if (a.publishedAt) {
      const ageMin = (Date.now() - new Date(a.publishedAt).getTime()) / 60000;
      recencyScore = Math.max(0, 1 - ageMin / 720); // linear decay 0..1
    }

    const videoBoost = (a.media?.videos?.length || 0) > 0 ? 0.3 : 0;
    const interestScore = matchCount * 0.15; // each interest adds weight

    let leanAlignmentScore = 0;
    const articleLeanVal = normalizeLean(a.lean);
    if (desiredLean !== null) {
      const diff = Math.abs(articleLeanVal - desiredLean); // 0 best, up to 2 worst theoretically (but limited to 1 range here)
      if (preference === 'reinforce') {
        leanAlignmentScore = (1 - Math.min(1, diff)) * 0.2;
      } else if (preference === 'challenge') {
        leanAlignmentScore = Math.min(1, diff) * 0.2;
      } else { // balanced small boost to moderate / centered content
        leanAlignmentScore = (1 - Math.min(1, Math.abs(articleLeanVal))) * 0.1;
      }
    }

    const score = recencyScore + videoBoost + interestScore + leanAlignmentScore;
    return {
      ...a,
      personalization: {
        score,
        components: {
          recency: recencyScore,
          video: videoBoost,
          interests: interestScore,
          leanAlignment: leanAlignmentScore,
          matches: matched
        }
      }
    };
  });

  scored.sort((a,b) => (b.personalization.score - a.personalization.score));
  return scored;
}
