// AI Service for news summarization and mood detection
// In production, this would connect to OpenAI/Gemini/Claude APIs

export const summarizeArticle = async (url) => {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        summary: "This is an AI-generated summary of the article. The key points include innovative breakthroughs, important developments, and significant implications for the future.",
        mood: "inspiring",
        biasRating: "neutral",
        keyInsights: [
          "Major technological advancement",
          "Potential widespread impact",
          "Collaborative effort across industries"
        ],
        sentiment: 0.75 // -1 to 1 scale
      });
    }, 1500);
  });
};

export const fetchNews = async ({ mood, category, q, personalize, strategy } = {}) => {
  try {
    const params = new URLSearchParams();
    if (mood) params.set('mood', mood);
    if (category) params.set('category', category);
    if (q) params.set('q', q);
    if (personalize) params.set('personalize', 'true');
    if (strategy) params.set('strategy', strategy);
    // Try fast endpoint first for sub-5s initial render
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4s client-side cap
    let res;
    try {
      res = await fetch(`/api/news-fast?${params.toString()}`);
    } catch (e) {
      // network error; will fallback below
    }
    if (!res.ok) {
      // Fallback to full enrichment endpoint
      try {
        res = await fetch(`/api/news?${params.toString()}`, { signal: controller.signal });
      } catch (e) {
        if (e.name === 'AbortError') {
          console.warn('fetchNews aborted after timeout');
          return { articles: [], total: 0, timedOut: true };
        }
        throw e;
      }
    }
    if (!res.ok) throw new Error('Failed to fetch news');
    const data = await res.json();
    clearTimeout(timeout);
    return data;
  } catch (e) {
    console.error('fetchNews error', e);
    return { articles: [], total: 0 };
  }
};

export const detectMood = (text) => {
  // Mock mood detection - replace with actual sentiment analysis
  const keywords = {
    hopeful: ['breakthrough', 'progress', 'success', 'achievement'],
    concerning: ['crisis', 'threat', 'danger', 'warning'],
    inspiring: ['remarkable', 'extraordinary', 'amazing', 'incredible'],
    exciting: ['announces', 'reveals', 'launches', 'unveils'],
    mixed: ['mixed', 'unclear', 'uncertain', 'debate']
  };

  const lowerText = text.toLowerCase();
  
  for (const [mood, words] of Object.entries(keywords)) {
    if (words.some(word => lowerText.includes(word))) {
      return mood;
    }
  }
  
  return 'neutral';
};

export const generatePersonalizedFeed = async (userPreferences, readingHistory) => {
  // Mock personalization - would use ML in production
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        articles: [], // Would return personalized articles
        recommendedTopics: ['technology', 'innovation', 'science'],
        diversityScore: 0.8,
        suggestion: "Try exploring more international news for a broader perspective"
      });
    }, 1000);
  });
};

export const analyzePoliticalLean = (readingHistory) => {
  // Mock political preference analysis
  const interactions = readingHistory.length;
  if (interactions < 10) return 'insufficient-data';
  
  // Would analyze article sources, topics, and engagement patterns
  return 'centrist'; // centrist, left-leaning, right-leaning
};

export const postInteraction = async (article) => {
  try {
    const res = await fetch('/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: article.url, source: article.source }),
    });
    const json = await res.json();
    return json;
  } catch (e) {
    console.error('postInteraction error', e);
    return { ok: false };
  }
};

export const getLean = async () => {
  try {
    const res = await fetch('/api/lean');
    const json = await res.json();
    return json;
  } catch (e) {
    console.error('getLean error', e);
    return { lean: 'centrist' };
  }
};
