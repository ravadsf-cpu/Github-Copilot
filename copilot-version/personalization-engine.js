/**
 * 5. PERSONALIZATION ENGINE
 * 
 * Adaptive news ranking system based on user behavior
 */

// ============================================================
// Core Personalization Logic
// ============================================================

/**
 * User Profile Structure
 */
interface UserProfile {
  userId: string;
  interests: string[]; // ['ai', 'climate', 'economy']
  dominantLean: 'left' | 'center' | 'right';
  leanDistribution: {
    left: number;
    center: number;
    right: number;
  };
  videoPreference: number; // 0.0 to 1.0
  preferredSources: string[];
  totalClicks: number;
  firstClickAt: string;
  lastActivityAt: string;
}

/**
 * Personalization Scoring Model
 * 
 * Combines multiple signals:
 * - Recency (time decay)
 * - Interest matching (keyword overlap)
 * - Lean alignment (reinforce/challenge preference)
 * - Video presence (user preference)
 * - Source diversity
 */
function applyPersonalization(articles, options) {
  const {
    interests = [],
    preference = 'balanced', // 'reinforce' | 'challenge' | 'balanced'
    userLean,
    videoPreference = 0.5,
    preferredSources = []
  } = options;

  if (!Array.isArray(articles) || articles.length === 0) {
    return articles;
  }

  const interestsSet = new Set(interests.map(i => i.toLowerCase()));

  // Lean normalization
  const normalizeLean = (lean) => ({
    'left': -1,
    'lean-left': -0.5,
    'center': 0,
    'lean-right': 0.5,
    'right': 1
  }[lean] ?? 0);

  const desiredLean = userLean ? normalizeLean(userLean) : null;

  // Score each article
  const scored = articles.map(article => {
    const textBlob = `${article.title || ''} ${article.description || ''} ${article.content || ''}`.toLowerCase();

    // 1. Interest Matching Score
    let interestScore = 0;
    const matchedKeywords = [];
    interestsSet.forEach(keyword => {
      if (keyword && textBlob.includes(keyword)) {
        interestScore += 0.15;
        matchedKeywords.push(keyword);
      }
    });

    // 2. Recency Score (12-hour decay)
    let recencyScore = 0.6; // base score
    if (article.publishedAt) {
      const ageMinutes = (Date.now() - new Date(article.publishedAt).getTime()) / 60000;
      const ageHours = ageMinutes / 60;
      // Linear decay over 12 hours: 1.0 at 0h, 0.0 at 12h
      recencyScore = Math.max(0, 1 - (ageHours / 12));
    }

    // 3. Video Presence Score
    const hasVideo = (article.media?.videos?.length || 0) > 0;
    const videoScore = hasVideo ? (0.3 * videoPreference) : 0;

    // 4. Lean Alignment Score
    let leanAlignmentScore = 0;
    if (desiredLean !== null) {
      const articleLeanValue = normalizeLean(article.lean);
      const leanDiff = Math.abs(articleLeanValue - desiredLean);

      if (preference === 'reinforce') {
        // Reward articles close to user's lean
        leanAlignmentScore = (1 - Math.min(1, leanDiff)) * 0.2;
      } else if (preference === 'challenge') {
        // Reward articles opposite to user's lean
        leanAlignmentScore = Math.min(1, leanDiff) * 0.2;
      } else {
        // 'balanced': slight boost to centrist content
        leanAlignmentScore = (1 - Math.min(1, Math.abs(articleLeanValue))) * 0.1;
      }
    }

    // 5. Source Preference Score
    let sourceScore = 0;
    const articleSource = (typeof article.source === 'string' ? article.source : article.source?.name || '').toLowerCase();
    if (preferredSources.length > 0 && preferredSources.some(s => articleSource.includes(s.toLowerCase()))) {
      sourceScore = 0.1;
    }

    // Total Score
    const totalScore = recencyScore + interestScore + videoScore + leanAlignmentScore + sourceScore;

    return {
      ...article,
      personalization: {
        score: totalScore,
        components: {
          recency: recencyScore,
          interests: interestScore,
          video: videoScore,
          leanAlignment: leanAlignmentScore,
          source: sourceScore,
          matches: matchedKeywords
        }
      }
    };
  });

  // Sort by score (descending)
  scored.sort((a, b) => b.personalization.score - a.personalization.score);

  return scored;
}

/**
 * First-Click Bootstrap Model
 * Builds initial user profile from first 5-10 interactions
 */
class PersonalizationBootstrap {
  constructor() {
    this.minClicksForProfile = 5;
  }

  /**
   * Extract interests from clicked articles
   */
  extractInterests(clickedArticles) {
    const wordCounts = {};

    clickedArticles.forEach(article => {
      const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();
      const words = text
        .split(/\s+/)
        .filter(word => 
          word.length > 4 && // Ignore short words
          !this.isStopWord(word)
        );

      words.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
    });

    // Return top 10 most frequent words
    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Determine dominant lean from clicked articles
   */
  calculateDominantLean(clickedArticles) {
    const distribution = { left: 0, center: 0, right: 0 };

    clickedArticles.forEach(article => {
      const lean = article.lean || 'center';
      if (lean.includes('left')) {
        distribution.left++;
      } else if (lean.includes('right')) {
        distribution.right++;
      } else {
        distribution.center++;
      }
    });

    // Find max
    const max = Math.max(distribution.left, distribution.center, distribution.right);
    if (distribution.left === max) return 'left';
    if (distribution.right === max) return 'right';
    return 'center';
  }

  /**
   * Calculate video preference (ratio of clicked articles with videos)
   */
  calculateVideoPreference(clickedArticles) {
    const withVideo = clickedArticles.filter(a => (a.media?.videos?.length || 0) > 0).length;
    return clickedArticles.length > 0 ? withVideo / clickedArticles.length : 0.5;
  }

  /**
   * Build user profile from interactions
   */
  buildProfile(userId, interactions) {
    const clickedArticles = interactions.filter(i => i.action === 'click');

    if (clickedArticles.length < this.minClicksForProfile) {
      // Not enough data yet
      return null;
    }

    const interests = this.extractInterests(clickedArticles);
    const dominantLean = this.calculateDominantLean(clickedArticles);
    const videoPreference = this.calculateVideoPreference(clickedArticles);

    const leanDistribution = { left: 0, center: 0, right: 0 };
    clickedArticles.forEach(article => {
      const lean = article.lean || 'center';
      if (lean.includes('left')) leanDistribution.left++;
      else if (lean.includes('right')) leanDistribution.right++;
      else leanDistribution.center++;
    });

    // Preferred sources (top 3 most clicked)
    const sourceCounts = {};
    clickedArticles.forEach(article => {
      const source = (typeof article.source === 'string' ? article.source : article.source?.name || 'Unknown');
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });
    const preferredSources = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([source]) => source);

    return {
      userId,
      interests,
      dominantLean,
      leanDistribution,
      videoPreference,
      preferredSources,
      totalClicks: clickedArticles.length,
      firstClickAt: clickedArticles[0]?.timestamp || new Date().toISOString(),
      lastActivityAt: clickedArticles[clickedArticles.length - 1]?.timestamp || new Date().toISOString()
    };
  }

  /**
   * Simple stop words list
   */
  isStopWord(word) {
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one',
      'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old',
      'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'
    ]);
    return stopWords.has(word);
  }
}

/**
 * Re-Ranking Algorithm
 * Blends diversity + lean preference
 */
function rerankWithDiversity(scoredArticles, options = {}) {
  const {
    maxPerSource = 5,
    leanDiversityWeight = 0.3,
    ensureDiversity = true
  } = options;

  if (!ensureDiversity) {
    return scoredArticles;
  }

  const result = [];
  const sourceCounts = {};
  const leanCounts = { left: 0, center: 0, right: 0 };

  // Round-robin selection with diversity constraints
  for (const article of scoredArticles) {
    const source = (typeof article.source === 'string' ? article.source : article.source?.name || 'Unknown');
    const lean = article.lean?.includes('left') ? 'left' : article.lean?.includes('right') ? 'right' : 'center';

    // Check source limit
    if ((sourceCounts[source] || 0) >= maxPerSource) {
      continue;
    }

    // Add article
    result.push(article);
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    leanCounts[lean]++;

    // Stop if we have enough
    if (result.length >= 50) break;
  }

  return result;
}

/**
 * Persistence Layer (Node.js - File-based)
 */
const fs = require('fs');
const path = require('path');

class UserProfileStore {
  constructor(storageDir = '/tmp') {
    this.storageFile = path.join(storageDir, 'user-profiles.json');
    this.profiles = this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const data = fs.readFileSync(this.storageFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[ProfileStore] Load failed:', error);
    }
    return {};
  }

  save() {
    try {
      fs.writeFileSync(this.storageFile, JSON.stringify(this.profiles, null, 2));
    } catch (error) {
      console.error('[ProfileStore] Save failed:', error);
    }
  }

  getProfile(userId) {
    return this.profiles[userId] || null;
  }

  setProfile(userId, profile) {
    this.profiles[userId] = {
      ...profile,
      updatedAt: new Date().toISOString()
    };
    this.save();
  }

  deleteProfile(userId) {
    delete this.profiles[userId];
    this.save();
  }
}

/**
 * Query for Personalized Articles (SQL - Future)
 */
const sqlQuery = `
-- Get personalized articles for user
WITH user_interests AS (
  SELECT 
    unnest((personalization_profile->'interests')::text[]) as interest
  FROM users
  WHERE id = $1
),
user_lean AS (
  SELECT 
    personalization_profile->>'dominant_lean' as lean
  FROM users
  WHERE id = $1
),
scored_articles AS (
  SELECT 
    a.*,
    -- Interest match score
    (
      SELECT COUNT(*)
      FROM user_interests ui
      WHERE a.tags ? ui.interest OR a.title ILIKE '%' || ui.interest || '%'
    )::float * 0.15 as interest_score,
    -- Recency score
    GREATEST(0, 1 - EXTRACT(EPOCH FROM (NOW() - a.published_at)) / 43200) as recency_score,
    -- Video score
    CASE WHEN jsonb_array_length(a.media_urls->'videos') > 0 THEN 0.3 ELSE 0 END as video_score,
    -- Lean alignment score
    CASE 
      WHEN (SELECT lean FROM user_lean) = 'left' AND a.political_lean IN ('LEFT', 'LEAN_LEFT') THEN 0.2
      WHEN (SELECT lean FROM user_lean) = 'right' AND a.political_lean IN ('RIGHT', 'LEAN_RIGHT') THEN 0.2
      WHEN a.political_lean = 'CENTER' THEN 0.1
      ELSE 0
    END as lean_score
  FROM articles a
  WHERE a.published_at > NOW() - INTERVAL '24 hours'
    AND a.deleted_at IS NULL
)
SELECT 
  *,
  (interest_score + recency_score + video_score + lean_score) as total_score
FROM scored_articles
ORDER BY total_score DESC
LIMIT 50;
`;

// ============================================================
// Export
// ============================================================

module.exports = {
  applyPersonalization,
  PersonalizationBootstrap,
  rerankWithDiversity,
  UserProfileStore
};
