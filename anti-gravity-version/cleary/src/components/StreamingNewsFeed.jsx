import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, AlertCircle } from './Icons';

const newsItems = [
  { id: 1, title: "Federal Reserve Signals Potential Rate Cut in December Meeting", source: "Reuters", urgency: "high", category: "Economics" },
  { id: 2, title: "Major Tech Companies Face New EU AI Regulations", source: "Bloomberg", urgency: "medium", category: "Technology" },
  { id: 3, title: "S&P 500 Reaches New All-Time High Amid Strong Earnings", source: "WSJ", urgency: "low", category: "Business" },
  { id: 4, title: "FDA Approves New Alzheimer's Treatment After Clinical Trials", source: "Nature", urgency: "medium", category: "Health" },
  { id: 5, title: "Renewable Energy Costs Drop 40% Over Past Five Years", source: "BBC", urgency: "low", category: "Environment" },
];

const StreamingNewsFeed = () => {
  const [articles, setArticles] = useState([]);
  const [displayedText, setDisplayedText] = useState({});
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Simulate streaming articles
    newsItems.forEach((item, index) => {
      setTimeout(() => {
        setArticles(prev => [...prev, item]);
        
        // Typewriter effect for each article
        let charIndex = 0;
        const typeInterval = setInterval(() => {
          if (charIndex <= item.title.length) {
            setDisplayedText(prev => ({
              ...prev,
              [item.id]: item.title.slice(0, charIndex)
            }));
            charIndex++;
          } else {
            clearInterval(typeInterval);
          }
        }, 30);
      }, index * 1500);
    });
  }, []);

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'high': return 'from-red-500 to-orange-500';
      case 'medium': return 'from-yellow-500 to-amber-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  const getUrgencyBorderColor = (urgency) => {
    switch(urgency) {
      case 'high': return 'border-red-500/50';
      case 'medium': return 'border-yellow-500/50';
      default: return 'border-blue-500/50';
    }
  };

  return (
    <div className="w-full py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Live News Stream
        </h2>
        <p className="text-gray-400 text-lg">Real-time coverage from verified global sources</p>
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-4">
        <AnimatePresence>
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30,
                delay: 0
              }}
              whileHover={{ scale: 1.02, x: 10 }}
              className={`relative backdrop-blur-xl bg-white/5 border ${getUrgencyBorderColor(article.urgency)} rounded-2xl p-6 cursor-pointer group overflow-hidden`}
            >
              {/* Animated background gradient */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "linear"
                }}
                className={`absolute inset-0 bg-gradient-to-r ${getUrgencyColor(article.urgency)} opacity-0 group-hover:opacity-10 transition-opacity`}
              />

              <div className="relative z-10 flex items-start gap-4">
                {/* Urgency indicator */}
                <div className="flex-shrink-0 mt-1">
                  {article.urgency === 'high' && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    </motion.div>
                  )}
                  {article.urgency === 'medium' && (
                    <TrendingUp className="w-6 h-6 text-yellow-500" />
                  )}
                  {article.urgency === 'low' && (
                    <Zap className="w-6 h-6 text-blue-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Typewriter title */}
                  <h3 className="text-xl font-semibold text-white mb-2 font-mono">
                    {displayedText[article.id] || ''}
                    {displayedText[article.id] && displayedText[article.id].length < article.title.length && (
                      <span className="inline-block w-0.5 h-5 bg-purple-400 ml-1 animate-pulse" />
                    )}
                  </h3>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">{article.source}</span>
                    <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
                      {article.category}
                    </span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="text-gray-500 text-xs"
                    >
                      Just now
                    </motion.span>
                  </div>
                </div>

                {/* Live indicator */}
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-xs text-red-500 font-semibold uppercase">Live</span>
                </motion.div>
              </div>

              {/* Progress bar animation */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 0.3 }}
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 origin-left"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading animation for more articles */}
      {articles.length < newsItems.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mt-8"
        >
          <div className="flex items-center gap-2 text-purple-400">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full"
            />
            <span className="text-sm font-semibold">Loading more stories...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StreamingNewsFeed;
