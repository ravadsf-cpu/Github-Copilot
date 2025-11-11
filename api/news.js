const { fetchFromRSS, summarizeWithAI, detectCategory, scoreLean, genAI, toEmbedFromUrl } = require('./_lib/shared');
let fetch;
try { fetch = require('node-fetch'); } catch { /* Node 18 runtime may have global fetch */ }
const cheerio = require('cheerio');

async function tryFetch(url, options = {}, timeoutMs = 4000) {
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
    if (!resp || !resp.ok) return [];
    const html = await resp.text();
    const $ = cheerio.load(html);
    const vids = [];
    const imgs = [];
    // Meta players
    $('meta[property="og:video"], meta[property="og:video:secure_url"], meta[name="twitter:player"]').each((_, el) => {
      const v = $(el).attr('content');
      if (v) vids.push(toEmbedFromUrl(v) || { kind: 'iframe', src: v });
    });
    // Meta images
    $('meta[property="og:image"], meta[name="og:image"], meta[property="twitter:image"]').each((_, el) => {
      const i = $(el).attr('content');
      if (i) imgs.push(i);
    });
    // Iframes
    $('iframe').each((_, el) => {
      const v = $(el).attr('src');
      if (v) vids.push(toEmbedFromUrl(v) || { kind: 'iframe', src: v });
    });
    // Video tags
    $('video').each((_, el) => {
      const v = $(el).attr('src');
      if (v) vids.push(toEmbedFromUrl(v) || { kind: 'video', src: v });
      $(el).find('source').each((__, se) => {
        const s = $(se).attr('src');
        const t = $(se).attr('type');
        if (s) vids.push({ kind: 'video', src: s, type: t });
      });
    });
    // Dedup by src
    const seen = new Set();
    const vOut = vids.filter(v => {
      const key = typeof v === 'string' ? v : v.src;
      if (!key || seen.has(key)) return false;
      seen.add(key); return true;
    });
    const seenI = new Set();
    const iOut = imgs.filter(u => { if (!u || seenI.has(u)) return false; seenI.add(u); return true; });
    return { videos: vOut, images: iOut };
  } catch {
    return { videos: [], images: [] };
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
  const { category = 'breaking', preference = 'balanced', query, userLean } = req.query;
    
    let articles = await fetchFromRSS(category);
    
    // Quick enhancement without slow AI calls
    const useAI = genAI && articles.length < 20; // Only use AI for small batches
    
    articles = await Promise.all(articles.map(async (article) => {
      const summary = useAI 
        ? await summarizeWithAI(article.content || article.description, 160)
        : (article.description || article.content || '').slice(0, 160);
      
      const detectedCategory = useAI
        ? await detectCategory(article.title, article.description)
        : category || 'general';
      
      const leanEval = scoreLean(
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
        id: article.url,
        readTime: Math.ceil((article.content || article.description).split(' ').length / 200),
      };
    }));

    // Lightweight video enrichment: try to detect videos for top items with none
    // Limit to avoid latency; best effort only
    const candidates = articles.slice(0, 12).filter(a => a.url && (!a.media || (!a.media.videos?.length || !a.urlToImage)));
    await Promise.all(candidates.map(async (a) => {
      const m = await scrapeMedia(a.url);
      if (m.videos && m.videos.length) {
        a.media = a.media || { images: [], videos: [] };
        a.media.videos = m.videos;
      }
      if ((!a.urlToImage || a.urlToImage === '') && m.images && m.images.length) {
        a.urlToImage = m.images[0];
        a.media = a.media || { images: [], videos: [] };
        a.media.images = Array.from(new Set([...(a.media.images || []).map(i=>i.src||i), ...m.images])).map(u => (typeof u === 'string' ? { src: u } : u));
      }
    }));

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

    res.status(200).json({ articles });
  } catch (error) {
    console.error('News API error:', error);
    res.status(500).json({ error: 'Failed to fetch news', articles: [] });
  }
};
