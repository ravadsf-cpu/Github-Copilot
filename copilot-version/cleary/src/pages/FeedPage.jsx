import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import RippleGrid from '../components/RippleGrid';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import NewsCard from '../components/NewsCard';
import ArticleCardNeon from '../components/ArticleCardNeon';
import MoodSelector from '../components/MoodSelector';
import ChatBot from '../components/ChatBot';
import AISection from '../components/AISection';
import TrendingTicker from '../components/TrendingTicker';
import { mockArticles } from '../utils/mockData';
import { FEED_RULES } from '../constants';
import OfflineBanner from '../components/OfflineBanner';
import { ArticleSkeleton } from '../components/Skeletons';
import useOffline from '../hooks/useOffline';
import { fetchNews, getLean } from '../utils/aiService';
import { fetchAggregatedNews } from '../services/newsAggregator';
import { useApp } from '../contexts/AppContext';
import { Search, Filter } from '../components/Icons';

const FeedPage = () => {
  const [articles, setArticles] = useState([]);
  const initialLoadRef = useRef(false);
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const { currentMood, userPreferences } = useApp();
  const [lean, setLean] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiArticles, setAiArticles] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Scroll-based animations
  const { scrollYProgress } = useScroll();
  useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Spring physics
  const springConfig = { stiffness: 300, damping: 30 };
  const organicEase = [0.17, 0.67, 0.83, 0.67];

  // Track mouse for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleAskNews = (aiReturnedArticles, category) => {
    // When AI returns articles, display them as a separate section (do not replace the feed)
    setAiArticles({ articles: aiReturnedArticles, category });
  };

  // View mode for feed layout (grid vs stack)
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const load = async () => {
      // Cache busting: clear old cache if version changed
      const APP_VERSION = '1.1.0'; // Increment this to force cache refresh
      const cachedVersion = localStorage.getItem('app_version');
      if (cachedVersion !== APP_VERSION) {
        console.log('App version changed, clearing cache...');
        localStorage.removeItem('fastArticles');
        localStorage.removeItem('fastArticles_ts');
        localStorage.setItem('app_version', APP_VERSION);
      }

      // 1. INSTANT: Show cached or mock articles immediately (NO loading spinner)
      if (!initialLoadRef.current) {
        try {
          const cached = JSON.parse(localStorage.getItem('fastArticles') || '[]');
          if (cached && cached.length) {
            setArticles(cached);
            setLoading(false); // Show cached content immediately
          } else {
            // No cache: show mock data instantly
            if (currentMood && currentMood !== 'breaking') {
              const filtered = mockArticles.filter((a) => a.category === currentMood);
              setArticles(filtered.length ? filtered : mockArticles);
            } else {
              setArticles(mockArticles);
            }
            setLoading(false); // Show mock content immediately
          }
        } catch {
          setArticles(mockArticles);
          setLoading(false);
        }
        initialLoadRef.current = true;
      }

      // 2. Background fetch: update with real articles when ready (non-blocking)
      const strategy = userPreferences?.politicalBalance || 'balanced';
      try {
        const params = { category: currentMood !== 'breaking' ? currentMood : undefined, personalize: true, strategy };
        const data = await fetchAggregatedNews(params);

        if (data.articles && data.articles.length) {
          setArticles(data.articles);
          try {
            localStorage.setItem('fastArticles', JSON.stringify(data.articles.slice(0, 40)));
            localStorage.setItem('fastArticles_ts', Date.now().toString());
          } catch { }
        }
      } catch (e) {
        console.warn('fetchNews background error', e);
        // Keep showing cached/mock articles
      }
    };
    load();
  }, [currentMood, userPreferences?.politicalBalance]);

  useEffect(() => {
    const loadLean = async () => {
      const data = await getLean();
      setLean(data?.lean || 'centrist');
    };
    loadLean();
  }, []);

  const filteredArticles = articles.filter(article => {
    const query = searchQuery.toLowerCase();
    const title = (article.title || '').toLowerCase();
    const summary = (article.summary || '').toLowerCase();

    // 1. Search Filter
    const matchesSearch = title.includes(query) || summary.includes(query);
    if (!matchesSearch) return false;

    // 2. Clickbait/Lifestyle Filter (User Request: "real news", no drinks/beaches)
    const clickbaitKeywords = [
      'best drinks', 'top 10 beaches', 'vacation spots', 'best of',
      'lifestyle', 'fashion trends', 'celebrity gossip', 'horoscope'
    ];
    const isClickbait = clickbaitKeywords.some(kw => title.includes(kw) || summary.includes(kw));
    if (isClickbait) return false;

    // 3. Age Filter (remove stale items beyond MAX_ARTICLE_AGE_HOURS)
    if (article.publishedAt) {
      const ageHours = (Date.now() - new Date(article.publishedAt).getTime()) / 36e5;
      if (ageHours > FEED_RULES.MAX_ARTICLE_AGE_HOURS) return false;
    }

    return true;
  });

  // Smart article sorting based on user's political preference AND recency
  const sortedByPreference = React.useMemo(() => {
    // Default to newest first if no preference, or even with preference, recency matters
    const baseList = [...filteredArticles].sort((a, b) => {
      return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
    });

    if (!userPreferences?.politicalBalance) return baseList;

    const preference = userPreferences.politicalBalance;

    // Map political balance preference to lean scoring
    const preferenceMap = {
      'left': ['left', 'lean-left', 'center'],
      'lean-left': ['lean-left', 'left', 'center', 'lean-right'],
      'balanced': ['center', 'lean-left', 'lean-right', 'left', 'right'],
      'lean-right': ['lean-right', 'right', 'center', 'lean-left'],
      'right': ['right', 'lean-right', 'center']
    };

    const order = preferenceMap[preference] || preferenceMap['balanced'];

    return baseList.sort((a, b) => {
      // Primary Sort: Recency (Bucketed by 4 hours to allow personalization within timeframes)
      const timeA = new Date(a.publishedAt || 0).getTime();
      const timeB = new Date(b.publishedAt || 0).getTime();
      const hoursDiff = (timeB - timeA) / (1000 * 60 * 60);

      if (Math.abs(hoursDiff) > 4) {
        return timeB - timeA; // Strict chronological if far apart
      }

      // Secondary Sort: Personalization (Lean)
      const aLean = a.lean || 'center';
      const bLean = b.lean || 'center';
      const aRank = order.indexOf(aLean);
      const bRank = order.indexOf(bLean);

      if (aRank !== -1 && bRank !== -1) {
        return aRank - bRank;
      }
      return 0;
    });
  }, [filteredArticles, userPreferences?.politicalBalance]);

  // Always keep the main feed visible; AI results render as a separate section
  const displayArticles = sortedByPreference;

  // Compute "Happening Now" headlines and trending topics from current articles
  const happeningNow = React.useMemo(() => {
    const impactWords = ['breaking', 'urgent', 'exclusive', 'bombshell', 'crisis', 'attack', 'indicted', 'charged', 'election', 'vote', 'results', 'victory', 'defeat'];
    const premium = ['cnn.com', 'nytimes.com', 'washingtonpost.com', 'reuters.com', 'apnews.com', 'bbc.com'];
    const scored = (displayArticles || [])
      .filter(a => {
        // Age gate for Happening Now spotlight
        if (a.publishedAt) {
          const ageHours = (Date.now() - new Date(a.publishedAt).getTime()) / 36e5;
          return ageHours <= FEED_RULES.HAPPENING_NOW_MAX_AGE_HOURS;
        }
        return true; // If no timestamp, keep (could be fresh from source)
      })
      .map((a) => {
      let score = 0;
      const title = (a.title || '').toLowerCase();
      const desc = (a.summary || a.description || '').toLowerCase();
      const hasVideo = !!(a.media && a.media.videos && a.media.videos.length > 0);
      // recency - BOOSTED for "Newest" requirement
      try {
        const hours = (Date.now() - new Date(a.publishedAt || 0).getTime()) / 36e5;
        if (!isNaN(hours)) {
          if (hours <= 1) score += 50; // Massive boost for <1h
          else if (hours <= FEED_RULES.MIN_RECENT_BOOST_HOURS) score += 30; // strong boost window
          else if (hours <= 12) score += 15;
          else if (hours <= 24) score += 5;
        }
      } catch { }
      // impact words
      impactWords.forEach(w => {
        if (title.includes(w)) score += 8;
        if (desc.includes(w)) score += 3;
      });
      // premium domain
      try {
        const u = new URL(a.url);
        const host = u.hostname.replace(/^www\./, '');
        if (premium.includes(host)) score += 10;
      } catch { }
      // video boost: prefer articles with videos
      if (hasVideo) score += 12;
      return { ...a, _score: score };
    })
      .sort((x, y) => y._score - x._score)
      .slice(0, 6);
    return scored;
  }, [displayArticles]);

  const trendingTopics = React.useMemo(() => {
    const counts = new Map();
    (displayArticles || []).forEach(a => {
      const text = `${a.title || ''} ${a.summary || ''}`.toLowerCase();
      const words = text.match(/[a-zA-Z]{4,}/g) || [];
      words.forEach(w => {
        if (['breaking', 'latest', 'today', 'after', 'with', 'from', 'that', 'this', 'will', 'have', 'about', 'news'].includes(w)) return;
        counts.set(w, (counts.get(w) || 0) + 1);
      });
    });
    const arr = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([w]) => w);
    return arr;
  }, [displayArticles]);

  // Merge happeningNow as leading items in the main grid
  const mergedArticles = React.useMemo(() => {
    const ids = new Set();
    const ordered = [];
    // Split displayArticles by video presence
    const withVideo = [];
    const withoutVideo = [];
    (displayArticles || []).forEach(a => {
      const hasVid = !!(a.media && a.media.videos && a.media.videos.length > 0);
      (hasVid ? withVideo : withoutVideo).push(a);
    });
    const prioritized = [...withVideo, ...withoutVideo];

    // Guarantee the first item has a video if any exist
    const hnVideo = (happeningNow || []).find(a => a.media && a.media.videos && a.media.videos.length > 0);
    const firstVideo = hnVideo || withVideo[0];
    if (firstVideo) {
      ids.add(firstVideo.id);
      ordered.push(firstVideo);
    }

    // Then add the rest of Happening Now
    (happeningNow || []).forEach(a => { if (!ids.has(a.id)) { ids.add(a.id); ordered.push(a); } });
    // Then add prioritized remainder (videos first, then others), keeping order and no dups
    prioritized.forEach(a => { if (!ids.has(a.id)) { ids.add(a.id); ordered.push(a); } });
    return ordered;
  }, [happeningNow, displayArticles]);

  return (
    <AnimatedBackground>
      <OfflineBanner online={useOffline().online} />
      {/* Breaking News Ticker */}
      {happeningNow && happeningNow.length > 0 && (
        <div className="fixed top-14 left-0 right-0 z-30">
          <TrendingTicker
            headlines={happeningNow.map(a => a.title || '')}
            onClickHeadline={(h) => {
              const a = (happeningNow || []).find(x => x.title === h);
              if (a && a.url) window.open(a.url, '_blank');
            }}
          />
        </div>
      )}
      {/* Theme-aware Ripple Grid background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <RippleGrid
          enableRainbow={false}
          gridColor={theme === 'dark' ? '#ffffff' : '#000000'}
          rippleIntensity={0.04}
          gridSize={9.5}
          gridThickness={14}
          mouseInteraction={false}
          opacity={theme === 'dark' ? 0.10 : 0.05}
        />
      </div>
      <Header />

      {/* Floating particles effect (neutralized to gray) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.15, 0.5, 0.15],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: organicEase,
            }}
          />
        ))}
      </div>

      {/* Removed colored orbs for neutral theme */}

  <main className="relative container mx-auto px-6 pt-28 pb-12 z-10">
        {/* AI Section with parallax */}
        <motion.div
          style={{
            x: mousePosition.x * 5,
            y: mousePosition.y * 5,
          }}
        >
          <AISection onAskNews={handleAskNews} />
        </motion.div>

        {/* Happening Now now merged as the first items in the grid (no separate strip) */}

        {/* AI Results - render in their own section above the main feed */}
        {aiArticles && aiArticles.articles?.length > 0 && (
          <div className="mb-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center justify-between"
            >
              <div>
                <h2 className="text-2xl font-semibold">AI Results</h2>
                <p className="text-sm text-black/60 dark:text-gray-400">
                  Found {aiArticles.articles.length} articles
                  {aiArticles.category && aiArticles.category !== 'breaking' && (
                    <span className="ml-2 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs">
                      {aiArticles.category}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setAiArticles(null)}
                className="px-4 py-2 rounded-lg theme-panel hover:opacity-90 transition-all text-sm"
              >
                Clear AI Results
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {aiArticles.articles.map((article, index) => (
                <NewsCard key={`ai-${article.id || index}`} article={article} index={index} />
              ))}
            </motion.div>
          </div>
        )}

        {/* Recommended header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
          <h2 className="text-xl">Recommended for you</h2>
        </motion.div>

        {/* Mood Selector */}
        <MoodSelector />

        {/* Search and Filters with glow effects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-8 flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1 relative group">
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-gray-400 z-10" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative w-full pl-12 pr-4 py-3 rounded-xl theme-input backdrop-blur-xl placeholder-black/40 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 transition-all"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', ...springConfig }}
            className="relative flex items-center space-x-2 px-6 py-3 rounded-xl theme-panel backdrop-blur-xl hover:opacity-90 transition-all group"
          >
            <div className="absolute inset-0 rounded-xl blur-md transition-all opacity-0 group-hover:opacity-100" />
            <Filter className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Filters</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode(prev => prev === 'stack' ? 'grid' : 'stack')}
            transition={{ type: 'spring', ...springConfig }}
            className="relative flex items-center space-x-2 px-6 py-3 rounded-xl theme-button transition-all group"
          >
            <span className="relative z-10">{viewMode === 'stack' ? 'Grid View' : 'Stack View'}</span>
          </motion.button>
        </motion.div>

        {/* Trending topics with spring animations */}
        {(!aiArticles && trendingTopics.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((t, index) => (
                <motion.button
                  key={t}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, type: 'spring', ...springConfig }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchQuery(t)}
                  className="relative px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all group"
                >
                  <div className="absolute inset-0 rounded-full blur transition-all opacity-0 group-hover:opacity-100" />
                  <span className="relative z-10">#{t}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-10"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {[...Array(6)].map((_, i) => (<ArticleSkeleton key={i} />))}
            </div>
          </motion.div>
        )}

        {/* Articles Display - Grid View */}
        {!loading && mergedArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {mergedArticles.map((article, index) => {
              // Showcase Neon card style for the first few items
              if (index < 3) {
                return (
                  <ArticleCardNeon
                    key={article.id || index}
                    title={article.title}
                    snippet={article.summary || article.description}
                    source={typeof article.source === 'string' ? article.source : article.source?.name}
                    leaning={article.lean || 'center'}
                    publishedAt={article.publishedAt ? new Date(article.publishedAt).toLocaleTimeString() : ''}
                    image={article.urlToImage || article.image || article.media?.images?.[0]?.src}
                    onClick={() => window.open(article.url, '_blank')}
                  />
                );
              }
              return <NewsCard key={article.id || index} article={article} index={index} />;
            })}
          </motion.div>
        )}

        {/* No Articles Found */}
        {!loading && displayArticles.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <p className="text-gray-400 text-lg">
              {aiArticles
                ? "No articles found from AI search. Try a different query."
                : "No articles found. Try a different category or search term."
              }
            </p>
          </motion.div>
        )}
      </main>

      {/* AI ChatBot */}
      <ChatBot politicalLean={lean} interests={[currentMood]} preference={userPreferences?.politicalBalance || 'balanced'} />
    </AnimatedBackground>
  );
};

export default FeedPage;
