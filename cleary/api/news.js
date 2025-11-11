const { fetchFromRSS, summarizeWithAI, detectCategory, inferLean } = require('./_lib/shared');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { category = 'breaking', preference = 'balanced', query } = req.query;
    
    let articles = await fetchFromRSS(category);
    
    // Enhance articles with AI
    articles = await Promise.all(articles.map(async (article) => {
      const summary = await summarizeWithAI(article.content || article.description, 160);
      const detectedCategory = await detectCategory(article.title, article.description);
      const lean = inferLean(article.source.name);
      
      return {
        ...article,
        summary,
        category: detectedCategory,
        lean,
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

    // Sort by preference
    if (preference === 'reinforce') {
      articles.sort((a, b) => {
        if (a.lean === 'center' && b.lean !== 'center') return 1;
        if (a.lean !== 'center' && b.lean === 'center') return -1;
        return 0;
      });
    } else if (preference === 'challenge') {
      articles.sort((a, b) => {
        if (a.lean === 'center' && b.lean !== 'center') return -1;
        if (a.lean !== 'center' && b.lean === 'center') return 1;
        return 0;
      });
    }

    res.status(200).json({ articles });
  } catch (error) {
    console.error('News API error:', error);
    res.status(500).json({ error: 'Failed to fetch news', articles: [] });
  }
};
