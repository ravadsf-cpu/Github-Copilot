import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, AlertCircle, Globe, Zap } from 'lucide-react';

const LiveNewsFeed = () => {
  const [articles, setArticles] = useState([]);
  const [typingText, setTypingText] = useState('');
  
  const mockNews = [
    { 
      title: 'Breaking: Major policy announcement expected',
      source: 'Reuters',
      urgency: 'high',
      icon: AlertCircle,
      color: 'from-red-500 to-orange-500'
    },
    { 
      title: 'Tech giants unveil AI collaboration framework',
      source: 'Bloomberg',
      urgency: 'medium',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      title: 'Global markets rally on economic optimism',
      source: 'Financial Times',
      urgency: 'medium',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500'
    },
    { 
      title: 'International summit addresses climate action',
      source: 'BBC',
      urgency: 'low',
      icon: Globe,
      color: 'from-purple-500 to-pink-500'
    },
    { 
      title: 'Innovation in renewable energy sector accelerates',
      source: 'The Guardian',
      urgency: 'low',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  // Typewriter effect for current headline
  useEffect(() => {
    if (articles.length === 0) return;
    
    const currentArticle = articles[0];
    let currentIndex = 0;
    
    const typeInterval = setInterval(() => {
      if (currentIndex <= currentArticle.title.length) {
        setTypingText(currentArticle.title.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          // Rotate to next article
          setArticles(prev => [...prev.slice(1), prev[0]]);
          setTypingText('');
        }, 2000);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [articles]);

  // Initialize with mock news
  useEffect(() => {
    setArticles(mockNews);
  }, []);

  const urgencyColors = {
    high: 'border-red-500/50 bg-red-500/5',
    medium: 'border-yellow-500/50 bg-yellow-500/5',
    low: 'border-blue-500/50 bg-blue-500/5'
  };

  return (
    <div className="relative w-full">
      {/* Main headline with typewriter */}
      <div className="relative backdrop-blur-xl bg-gradient-to-br from-black/40 to-black/20 border border-white/10 rounded-2xl p-8 overflow-hidden mb-6">
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-purple-600/10"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            backgroundSize: '200% 100%'
          }}
        />

        {/* Live indicator */}
        <div className="relative flex items-center gap-2 mb-4">
          <motion.div
            className="w-2 h-2 bg-red-500 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity
            }}
          />
          <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Live News Stream</span>
        </div>

        {/* Typing text */}
        <div className="relative min-h-[80px]">
          <AnimatePresence mode="wait">
            {articles.length > 0 && (
              <motion.div
                key={articles[0]?.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-3">
                  {articles[0]?.icon && (
                    <motion.div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${articles[0].color} flex items-center justify-center`}
                      animate={{
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity
                      }}
                    >
                      {articles[0]?.icon && React.createElement(articles[0].icon, { className: "w-4 h-4 text-white" })}
                    </motion.div>
                  )}
                  <span className="text-gray-400 text-sm font-medium">{articles[0]?.source}</span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  {typingText}
                  <motion.span
                    className="inline-block w-0.5 h-6 bg-purple-400 ml-1"
                    animate={{
                      opacity: [1, 0, 1]
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity
                    }}
                  />
                </h3>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Upcoming headlines queue */}
      <div className="space-y-3">
        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Streaming Headlines
        </div>
        
        <AnimatePresence>
          {articles.slice(1, 4).map((article, index) => (
            <motion.div
              key={article.title}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              className={`relative backdrop-blur-sm border ${urgencyColors[article.urgency]} rounded-xl p-4 overflow-hidden group cursor-pointer`}
              whileHover={{ scale: 1.02, x: 4 }}
            >
              {/* Progress bar */}
              <motion.div
                className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${article.color}`}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />

              <div className="flex items-start gap-3">
                {article.icon && (
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${article.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <article.icon className="w-3 h-3 text-white" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium line-clamp-2 group-hover:text-purple-300 transition-colors">
                    {article.title}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{article.source}</p>
                </div>

                {/* Activity indicator */}
                <motion.div
                  className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 mt-1.5"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3
                  }}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Data stream visualization */}
      <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-purple-600/20 via-pink-600/20 to-transparent overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-full h-8 bg-gradient-to-b from-purple-400 to-transparent"
            animate={{
              y: ['-100%', '500%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'linear'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LiveNewsFeed;
