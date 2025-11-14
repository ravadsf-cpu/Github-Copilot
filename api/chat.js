const { genAI, fetchFromRSS, fetchFromFeeds, REGIONAL_FEEDS, stripHtml, scoreLean } = require('./_lib/shared');
let OpenAIClient = null;
try {
  // Lazy require to avoid bundling if not used
  OpenAIClient = require('openai');
} catch {}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, context, politicalLean, preference } = req.body;
    
    // IMPORTANT: Always use heuristic fallback for now to ensure varied responses
    // Skip AI calls temporarily until API keys are properly configured
    const msg = (message || '').toLowerCase();

    // Simple in-memory cache per serverless instance
    const CACHE_TTL_MS = 90 * 1000;
    if (!global.__CHAT_CACHE__) global.__CHAT_CACHE__ = new Map();
    const cache = global.__CHAT_CACHE__;
    const cacheGet = (key) => {
      const v = cache.get(key);
      if (v && (Date.now() - v.ts) < CACHE_TTL_MS) return v.data;
      return null;
    };
    const cacheSet = (key, data) => cache.set(key, { ts: Date.now(), data });

    // Region detection
    const hasIndia = /(\bindia\b|delhi|mumbai|bengaluru|bangalore|kolkata|calcutta|chennai|kashmir)/i.test(msg);
    const hasPakistan = /(\bpakistan\b|karachi|lahore|islamabad|rawalpindi|peshawar|kashmir)/i.test(msg);
    const wantsSouthAsia = /(south\s?asia|india.*pakistan|pakistan.*india)/i.test(msg);

    const pickHeader = () => {
      if (wantsSouthAsia || (hasIndia && hasPakistan)) return 'Top South Asia stories:';
      if (hasIndia) return 'Top India stories:';
      if (hasPakistan) return 'Top Pakistan stories:';
      return null;
    };

    const keywords = [];
    if (wantsSouthAsia || (hasIndia && hasPakistan)) {
      keywords.push('india','indian','delhi','mumbai','bengaluru','kolkata','chennai','kashmir','pakistan','pakistani','karachi','lahore','islamabad','peshawar','south asia');
    } else if (hasIndia) {
      keywords.push('india','indian','delhi','mumbai','bengaluru','kolkata','chennai','kashmir');
    } else if (hasPakistan) {
      keywords.push('pakistan','pakistani','karachi','lahore','islamabad','peshawar','kashmir');
    }

    const dedupe = (arr) => {
      const seen = new Set();
      return arr.filter(a => {
        const key = (a.url || a.title || '').toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    const matchesKeywords = (a) => {
      if (!keywords.length) return false;
      const text = `${a.title || ''} ${a.description || ''} ${a.content || ''}`.toLowerCase();
      return keywords.some(k => text.includes(k));
    };

    // If regional intent detected, use regional feeds + world fallback
    if (keywords.length) {
      const regionKey = wantsSouthAsia || (hasIndia && hasPakistan)
        ? 'south-asia'
        : hasIndia ? 'india' : 'pakistan';
      const cacheKey = `region:${regionKey}`;

      let regionArticles = cacheGet(cacheKey);
      if (!regionArticles) {
        const feeds = regionKey === 'south-asia'
          ? [...(REGIONAL_FEEDS.india || []), ...(REGIONAL_FEEDS.pakistan || [])]
          : REGIONAL_FEEDS[regionKey] || [];
        regionArticles = await fetchFromFeeds(feeds);
        cacheSet(cacheKey, regionArticles);
      }

      let worldArticles = cacheGet('category:world');
      if (!worldArticles) {
        worldArticles = await fetchFromRSS('world');
        cacheSet('category:world', worldArticles);
      }

      const topRegion = dedupe(regionArticles.filter(matchesKeywords)).slice(0, 5);
      // Fill from world articles that match, then remaining recency from region/world
      const filled = [...topRegion];
      if (filled.length < 5) {
        const worldMatches = dedupe(worldArticles.filter(matchesKeywords)).filter(a => !filled.find(f => f.url === a.url));
        filled.push(...worldMatches.slice(0, 5 - filled.length));
      }
      if (filled.length < 5) {
        const regionMore = dedupe(regionArticles).filter(a => !filled.find(f => f.url === a.url));
        filled.push(...regionMore.slice(0, 5 - filled.length));
      }
      if (filled.length < 5) {
        const worldMore = dedupe(worldArticles).filter(a => !filled.find(f => f.url === a.url));
        filled.push(...worldMore.slice(0, 5 - filled.length));
      }

  if (filled.length) {
        // Stronger personalization: reorder by preference and politicalLean if provided
        const norm = (l) => ({ 'left': -1, 'lean-left': -0.5, 'center': 0, 'lean-right': 0.5, 'right': 1 }[l] ?? 0);
        const desired = typeof politicalLean === 'string' ? norm(politicalLean) : null;
        const items = filled.map(a => {
          const leanEval = scoreLean(`${a.title || ''}. ${a.description || ''} ${a.content || ''}`, a.source?.name || '', a.url || '');
          return { ...a, _lean: leanEval };
        });

        let ordered = items;
        if (preference === 'reinforce' && desired !== null) {
          ordered = items.sort((x,y) => Math.abs(norm(y._lean.label) - desired) - Math.abs(norm(x._lean.label) - desired));
        } else if (preference === 'challenge' && desired !== null) {
          ordered = items.sort((x,y) => Math.abs(norm(x._lean.label) - desired) - Math.abs(norm(y._lean.label) - desired));
        }

        const header = pickHeader() || 'Top world stories:';
        const topList = ordered.slice(0,5);
        const bullets = topList.map((a, i) => {
          const leanTag = a._lean?.label ? ` [Lean: ${a._lean.label}]` : '';
          return `${i+1}. ${a.title}${leanTag} — ${a.source?.name || ''}\n${a.url}`;
        }).join('\n\n');
        // Strip helper fields before returning
        const articlesOut = topList.map(({ _lean, ...rest }) => rest);
        return res.status(200).json({ response: `${header}\n\n${bullets}`, category: 'world', articles: articlesOut });
      }
    }

    // Category-based fallback if no regional intent
    let category = 'breaking';
    if (/business|econom(y|ic)|market|stocks|finance/.test(msg)) category = 'business';
    else if (/politic|election|policy|government/.test(msg)) category = 'politics';
    else if (/health|covid|vaccine|disease/.test(msg)) category = 'health';
    else if (/tech|technology|ai|software|hardware|science/.test(msg)) category = 'science';

    const catKey = `category:${category}`;
    let articles = cacheGet(catKey);
    if (!articles) {
      articles = await fetchFromRSS(category);
      cacheSet(catKey, articles);
    }
    let top = articles.slice(0, 5).map(a => ({
      ...a,
      _lean: scoreLean(`${a.title || ''}. ${a.description || ''} ${a.content || ''}`, a.source?.name || '', a.url || '')
    }));
    // Reorder by provided preference if possible
    const norm = (l) => ({ 'left': -1, 'lean-left': -0.5, 'center': 0, 'lean-right': 0.5, 'right': 1 }[l] ?? 0);
    const desired = typeof politicalLean === 'string' ? norm(politicalLean) : null;
    if (preference === 'reinforce' && desired !== null) {
      top.sort((x,y) => Math.abs(norm(y._lean.label) - desired) - Math.abs(norm(x._lean.label) - desired));
    } else if (preference === 'challenge' && desired !== null) {
      top.sort((x,y) => Math.abs(norm(x._lean.label) - desired) - Math.abs(norm(y._lean.label) - desired));
    }
    if (top.length) {
      const header = category === 'breaking' ? 'Top breaking stories:' : `Top ${category} stories:`;
      const bullets = top.map((a, i) => `${i+1}. ${a.title}${a._lean?.label ? ` [Lean: ${a._lean.label}]` : ''} — ${a.source?.name || ''}\n${a.url}`).join('\n\n');
      const articlesOut = top.map(({ _lean, ...rest }) => rest);
      return res.status(200).json({ response: `${header}\n\n${bullets}`, category, articles: articlesOut });
    }

    // Last resort generic
    return res.status(200).json({ 
      response: "I'm here to help! Try asking for 'breaking news' or a category like technology, politics, or health."
    });
  } catch (error) {
    console.error('Chat API error:', error.message, error.stack);
    res.status(200).json({ 
      response: "Hello! I'm your news assistant. How can I help you today?"
    });
  }
};
