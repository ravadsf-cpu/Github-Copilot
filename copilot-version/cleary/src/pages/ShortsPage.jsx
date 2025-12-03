import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film, RefreshCw, Search } from '../components/Icons';
import AnimatedBackground from '../components/AnimatedBackground';
import Header from '../components/Header';
import ShortFeedCard from '../components/ShortFeedCard';
import { addWatchHistory, getWatchHistory } from '../services/history';

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
  // const [sortBy, setSortBy] = useState('newest'); // Removed unused state
  const [visibleCount, setVisibleCount] = useState(3); // Optimized: Load fewer initially for faster TTI
  const [engagementMap, setEngagementMap] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchShorts();
    setHistory(getWatchHistory());
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

      // Filter out Rick Rolls and known troll content
      const cleanShorts = (data.articles || []).filter(s => {
        const title = (s.title || '').toLowerCase();
        const url = (s.url || '').toLowerCase();
        // Block known Rick Roll IDs and keywords
        if (url.includes('dqw4w9wgxcq')) return false;
        if (title.includes('rick roll') || title.includes('never gonna give you up')) return false;
        return true;
      });

      setShorts(cleanShorts);
      // Reset lazy load
      setVisibleCount(3);
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

  // Sort - Always newest first for now
  const sortedShorts = [...filteredShorts].sort((a, b) => {
    return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
  });

  // Slice for prefetch; we still keep list length manageable
  const visibleShorts = sortedShorts.slice(0, visibleCount);

  // Intersection observers: detect which card is currently centered in viewport
  useEffect(() => {
    const items = Array.from(document.querySelectorAll('[data-short-index]'));
    if (!items.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idxAttr = e.target.getAttribute('data-short-index');
            if (idxAttr) setActiveIndex(parseInt(idxAttr, 10));
          }
        });
      },
      { root: null, threshold: 0.6 }
    );
    items.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [visibleShorts.length]);

  // Keyboard navigation (arrow up/down)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown') {
        setActiveIndex(i => Math.min(i + 1, visibleShorts.length - 1));
        scrollToIndex(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        setActiveIndex(i => Math.max(i - 1, 0));
        scrollToIndex(activeIndex - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeIndex, visibleShorts.length]);

  const scrollToIndex = (idx) => {
    const el = document.querySelector(`[data-short-index="${idx}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  // Prefetch next thumbnail for snappier transitions
  useEffect(() => {
    const next = sortedShorts[activeIndex + 1];
    const thumb = next?.media?.videos?.[0]?.thumbnail || next?.urlToImage;
    if (thumb) {
      const img = new Image();
      img.src = thumb;
    }
  }, [activeIndex, sortedShorts]);

  const handleWatched = (article) => {
    const it = {
      url: article.url,
      title: article.title,
      thumbnail: article.media?.videos?.[0]?.thumbnail || article.urlToImage,
    };
    const list = addWatchHistory(it);
    setHistory(list);
  };

  const handleAdvance = () => {
    const next = activeIndex + 1;
    if (next < visibleShorts.length) {
      scrollToIndex(next);
    }
  };

  const handleEngagementUpdate = (key, data) => {
    setEngagementMap(prev => ({ ...prev, [key]: data }));
  };

  return (
    <AnimatedBackground mood="exciting">
      {/* Header removed from flow, added to overlay */}

      <main className="h-screen w-full bg-black overflow-hidden relative">


        {/* Floating Header Controls */}
        <div className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start pointer-events-none">
          <div className="pointer-events-auto">
            <Header />
          </div>

          <div className="flex flex-col items-end gap-4 pointer-events-auto mt-16">
            {/* Search Toggle (Simplified) */}
            <div className="relative group">
              <div className={`flex items-center bg-black/40 backdrop-blur-md rounded-full border border-white/10 transition-all ${searchQuery ? 'w-64 px-4' : 'w-10 h-10 justify-center hover:w-64 hover:px-4'}`}>
                <Search className="w-4 h-4 text-white min-w-[16px]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className={`bg-transparent border-none text-white text-sm focus:outline-none ml-2 w-full ${searchQuery ? 'block' : 'hidden group-hover:block'}`}
                />
              </div>
            </div>

            {/* Refresh */}
            <button onClick={handleRefresh} className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-white/10 transition-colors">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

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
          animate={{
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: 0,
            ease: "easeOut"
          }}
          className="relative"
        >
          <button
            onClick={() => setSearchQuery('')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
          >
            Clear Search
          </button>
        </motion.div>
        )}

        {/* Vertical Shorts Feed */}
        {!loading && sortedShorts.length > 0 && (
          <div className="w-full h-full snap-y snap-mandatory overflow-y-auto scrollbar-none" style={{ scrollBehavior: 'smooth' }}>
            {visibleShorts.map((short, index) => (
              <div key={short.url || index} data-short-index={index} className="snap-start w-full h-full">
                <ShortFeedCard
                  article={short}
                  index={index}
                  active={index === activeIndex}
                  autoPlay
                  onAdvance={handleAdvance}
                  onEngagement={handleEngagementUpdate}
                  onWatched={handleWatched}
                />
              </div>
            ))}
          </div>
        )}

        {/* Prefetch more silently when near end */}
        {!loading && activeIndex > visibleCount - 4 && visibleCount < sortedShorts.length && (
          <div className="hidden" aria-hidden>
            {setTimeout(() => setVisibleCount(c => Math.min(c + 12, sortedShorts.length)), 0)}
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

      {/* Watch Again Drawer */}
      <div className="absolute bottom-6 right-6 z-50">
        <button onClick={() => setHistoryOpen((v) => !v)} className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20">Watch Again</button>
      </div>
      {historyOpen && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-20 right-6 z-50 w-80 max-h-[60vh] overflow-y-auto bg-black/70 border border-white/10 rounded-2xl p-3 space-y-2">
          {history.length === 0 && <div className="text-gray-400 text-sm">No watch history yet.</div>}
          {history.map((h, i) => (
            <button key={h.url + i} onClick={() => {
              const idx = sortedShorts.findIndex(s => s.url === h.url);
              if (idx >= 0) scrollToIndex(idx);
            }} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 text-left">
              <img src={h.thumbnail} alt="thumb" className="w-12 h-8 object-cover rounded" />
              <div className="flex-1">
                <div className="text-xs text-white line-clamp-2">{h.title}</div>
              </div>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatedBackground>
  );
};

export default ShortsPage;
