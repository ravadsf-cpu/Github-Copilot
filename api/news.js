const { fetchFromRSS, summarizeWithAI, detectCategory, scoreLean, genAI } = require('./_lib/shared');

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
