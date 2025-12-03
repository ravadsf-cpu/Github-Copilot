/**
 * User Interactions Endpoint
 * Tracks article clicks, likes, shares for personalization learning
 */

const fs = require('fs');
const path = require('path');

// Simple file-based storage (production should use database)
const INTERACTIONS_FILE = path.join('/tmp', 'user-interactions.json');

function loadInteractions() {
  try {
    if (fs.existsSync(INTERACTIONS_FILE)) {
      return JSON.parse(fs.readFileSync(INTERACTIONS_FILE, 'utf8'));
    }
  } catch (e) {
    console.warn('[interactions] Failed to load:', e.message);
  }
  return {};
}

function saveInteractions(data) {
  try {
    fs.writeFileSync(INTERACTIONS_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('[interactions] Failed to save:', e.message);
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const interactions = loadInteractions();

    if (req.method === 'POST') {
      const { userId = 'anonymous', articleId, articleUrl, action, metadata = {} } = req.body;
      
      if (!articleId || !action) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['articleId', 'action']
        });
      }

      // Initialize user data
      if (!interactions[userId]) {
        interactions[userId] = {
          clicks: [],
          likes: [],
          shares: [],
          interests: new Set(),
          leanPreferences: { left: 0, center: 0, right: 0 }
        };
      }

      const entry = {
        articleId,
        articleUrl,
        timestamp: new Date().toISOString(),
        ...metadata
      };

      // Track action
      if (action === 'click') {
        interactions[userId].clicks.push(entry);
        
        // Extract interests from metadata (title keywords)
        if (metadata.title) {
          const keywords = metadata.title.toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 4);
          keywords.forEach(k => interactions[userId].interests.add(k));
        }
        
        // Track lean preference
        if (metadata.lean) {
          const leanMap = { 'left': 'left', 'lean-left': 'left', 'center': 'center', 'lean-right': 'right', 'right': 'right' };
          const bucket = leanMap[metadata.lean] || 'center';
          interactions[userId].leanPreferences[bucket]++;
        }
      } else if (action === 'like') {
        interactions[userId].likes.push(entry);
      } else if (action === 'share') {
        interactions[userId].shares.push(entry);
      }

      // Convert Set to Array for JSON serialization
      interactions[userId].interests = Array.from(interactions[userId].interests);
      
      saveInteractions(interactions);

      return res.status(200).json({
        success: true,
        message: 'Interaction tracked',
        userId,
        action
      });
    }

    // GET: Return user profile/interests
    if (req.method === 'GET') {
      const { userId = 'anonymous' } = req.query;
      
      const profile = interactions[userId] || {
        clicks: [],
        likes: [],
        shares: [],
        interests: [],
        leanPreferences: { left: 0, center: 0, right: 0 }
      };

      // Calculate dominant lean
      const leanCounts = profile.leanPreferences;
      const dominantLean = Object.keys(leanCounts).reduce((a, b) => 
        leanCounts[a] > leanCounts[b] ? a : b
      );

      // Top interests (limit to 10)
      const topInterests = profile.interests.slice(0, 10);

      return res.status(200).json({
        userId,
        stats: {
          totalClicks: profile.clicks.length,
          totalLikes: profile.likes.length,
          totalShares: profile.shares.length
        },
        interests: topInterests,
        dominantLean,
        leanDistribution: leanCounts
      });
    }

  } catch (error) {
    console.error('[interactions] Error:', error);
    res.status(500).json({
      error: 'Failed to process interaction',
      message: error.message
    });
  }
};
