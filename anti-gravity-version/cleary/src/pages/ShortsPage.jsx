import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, RefreshCw, Search, TrendingUp, Zap } from '../components/Icons';
import AnimatedBackground from '../components/AnimatedBackground';
import Header from '../components/Header';
import VideoCard from '../components/VideoCard';

/**
 * ShortsPage - Video-first news feed
 * Displays short-form video news content from CNN and other sources
 * Inspired by TikTok/YouTube Shorts UX with Insights-style polish
 */
const ShortsPage = () => {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, popular, videoCount, engagement
  const [visibleCount, setVisibleCount] = useState(1); // lazy load
  const [engagementMap, setEngagementMap] = useState({});

  useEffect(() => {
    fetchShorts();
  }, []);

  const fetchShorts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try primary endpoint, fallback to shorts2
      let response = await fetch('/api/shorts');
      if (!response.ok) {
        response = await fetch('/api/shorts2');
      }
      if (!response.ok) throw new Error('Failed to fetch shorts');
      const data = await response.json();
      setShorts(data.articles || []);
      // Reset lazy load
      setVisibleCount(1);
    } catch (err) {
      console.error('Error fetching shorts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchShorts();
  };

  // Filter by search
  const filteredShorts = shorts.filter(short => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      short.title?.toLowerCase().includes(query) ||
      short.description?.toLowerCase().includes(query) ||
      short.source?.name?.toLowerCase().includes(query)
    );
  });

  // Sort
  const sortedShorts = [...filteredShorts].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
    } else if (sortBy === 'videoCount') {
      return (b.videoCount || 0) - (a.videoCount || 0);
    } else if (sortBy === 'engagement') {
      const ea = engagementMap[a.url] || engagementMap[a.title] || { likes:0, dislikes:0 };
      const eb = engagementMap[b.url] || engagementMap[b.title] || { likes:0, dislikes:0 };
      // Score: likes - dislikes; disliked items sink
      const sa = (ea.likes || 0) - (ea.dislikes || 0);
      const sb = (eb.likes || 0) - (eb.dislikes || 0);
      if (sb !== sa) return sb - sa;
      return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
    }
    return 0;
  });

  // Slice for lazy loading
  const visibleShorts = sortedShorts.slice(0, visibleCount);

  // Intersection observer for auto load more
  useEffect(() => {
    if (visibleCount >= sortedShorts.length) return;
    const sentinel = document.getElementById('shorts-sentinel');
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleCount(c => Math.min(c + 6, sortedShorts.length));
        }
      });
    }, { rootMargin: '200px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, sortedShorts.length]);

  const handleEngagementUpdate = (key, data) => {
    setEngagementMap(prev => ({ ...prev, [key]: data }));
  };

  return (
    <AnimatedBackground mood="exciting">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-12 min-h-screen">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Title with animated icon */}
          <div className="flex items-center space-x-4 mb-3">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1.1, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-2xl">
                <Film className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            
            <div>
              <h1 className="text-5xl font-bold text-white mb-1">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
                  Shorts
                </span>
              </h1>
              <p className="text-gray-300 text-sm flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Quick video news from CNN, BBC, Reuters & more</span>
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium">{sortedShorts.length}</span>
              <span className="text-gray-400">videos available</span>
            </div>
            
            {loading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="flex items-center space-x-2 text-purple-400"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Loading...</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          {/* Search and Refresh */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search video news..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 transition-all"
              />
            </div>

            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <span className="text-gray-400 text-sm whitespace-nowrap">Sort by:</span>
            {[
              { id: 'newest', label: 'Newest', icon: TrendingUp },
              { id: 'videoCount', label: 'Most Videos', icon: Film },
              { id: 'engagement', label: 'Top Rated', icon: Zap }
            ].map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSortBy(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                  sortBy === id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center"
          >
            <p className="text-red-400 mb-3">Failed to load video shorts</p>
            <p className="text-gray-400 text-sm mb-4">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
            >
              Try Again
            </motion.button>
          </motion.div>
        )}

        {/* Loading Skeleton */}
        {loading && shorts.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="aspect-video rounded-2xl bg-white/5 border border-white/10 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Video Grid */}
        {!loading && sortedShorts.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No video shorts found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery ? 'Try adjusting your search' : 'Check back soon for new content'}
            </p>
            {searchQuery && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchQuery('')}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
              >
                Clear Search
              </motion.button>
            )}
          </motion.div>
        )}

        {!loading && sortedShorts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {visibleShorts.map((short, index) => (
                <VideoCard
                  key={short.url || index}
                  article={short}
                  index={index}
                  onEngagement={handleEngagementUpdate}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Load More & Sentinel */}
        {!loading && visibleCount < sortedShorts.length && (
          <div className="mt-8 flex flex-col items-center">
            <button
              onClick={() => setVisibleCount(c => Math.min(c + 6, sortedShorts.length))}
              className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm backdrop-blur border border-white/10"
            >Load More ({visibleCount}/{sortedShorts.length})</button>
            <div id="shorts-sentinel" className="h-4 w-full" />
          </div>
        )}

        {/* Results info */}
        {!loading && sortedShorts.length > 0 && searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center text-gray-400 text-sm"
          >
            Showing {sortedShorts.length} of {shorts.length} videos
          </motion.div>
        )}
      </main>
    </AnimatedBackground>
  );
};

export default ShortsPage;
