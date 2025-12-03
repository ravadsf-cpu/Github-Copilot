/**
 * Cache Clear Endpoint
 * Provides manual cache invalidation with optional authentication
 */

const { cache } = require('../_lib/cache');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Optional: Add admin authentication
    const authHeader = req.headers.authorization;
    const adminToken = process.env.ADMIN_TOKEN || 'dev-clear-token';
    
    if (authHeader !== `Bearer ${adminToken}`) {
      console.warn('[cache/clear] Unauthorized attempt');
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Valid admin token required'
      });
    }

    // Get stats before clearing
    const beforeStats = cache.stats();
    
    // Clear all caches
    cache.clear();
    
    console.log('[cache/clear] ✅ Cache cleared successfully', beforeStats);
    
    res.status(200).json({
      success: true,
      message: 'Cache cleared successfully',
      beforeStats,
      afterStats: cache.stats(),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[cache/clear] Error:', error);
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error.message
    });
  }
};
