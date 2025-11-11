import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, Sparkles } from 'lucide-react';

const LiveNewsVisualization = () => {
  const [biasMetrics, setBiasMetrics] = useState([]);
  const [credibilityScores, setCredibilityScores] = useState({});
  const tickerRef = useRef(null);

  const newsCategories = useMemo(() => [
    { name: 'Politics', bias: -15, credibility: 87, color: 'from-blue-500 to-cyan-500', articles: 234 },
    { name: 'Technology', bias: 5, credibility: 92, color: 'from-purple-500 to-pink-500', articles: 189 },
    { name: 'Business', bias: 10, credibility: 89, color: 'from-green-500 to-emerald-500', articles: 156 },
    { name: 'Health', bias: -5, credibility: 94, color: 'from-red-500 to-orange-500', articles: 112 },
    { name: 'Science', bias: 0, credibility: 96, color: 'from-indigo-500 to-purple-500', articles: 98 }
  ], []);

  const tickerNews = [
    "Federal Reserve signals rate stability through Q1 2026",
    "EU passes landmark AI regulation framework",
    "S&P 500 maintains record highs amid tech sector growth",
    "FDA fast-tracks new cardiovascular treatment",
    "Renewable energy accounts for 45% of new power generation",
    "Major cybersecurity breach affects financial institutions",
    "Climate summit reaches historic carbon reduction agreement"
  ];

  // Animate bias metrics
  useEffect(() => {
    const timer = setTimeout(() => {
      setBiasMetrics(newsCategories);
    }, 500);
    return () => clearTimeout(timer);
  }, [newsCategories]);

  // Credibility score animation
  useEffect(() => {
    newsCategories.forEach((category, index) => {
      setTimeout(() => {
        setCredibilityScores(prev => ({
          ...prev,
          [category.name]: category.credibility
        }));
      }, 200 * index);
    });
  }, [newsCategories]);

  const getBiasPosition = (bias) => {
    // Convert bias from -50 to +50 to percentage 0-100
    return ((bias + 50) / 100) * 100;
  };

  return (
    <div className="relative w-full py-20 overflow-hidden">
      {/* News Ticker */}
      <div className="relative w-full overflow-hidden bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20 py-3 mb-16 border-y border-purple-500/30">
        <motion.div
          ref={tickerRef}
          animate={{ x: [0, -2000] }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear"
          }}
          className="flex items-center gap-12 whitespace-nowrap"
        >
          {[...tickerNews, ...tickerNews].map((news, index) => (
            <div key={index} className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300 text-sm font-medium">{news}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Real-Time News Intelligence
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Advanced AI monitors bias, credibility, and coverage across categories
          </p>
        </motion.div>

        {/* Bias Detection Dashboard */}
        <div className="grid grid-cols-1 gap-8 mb-16">
          {biasMetrics.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative backdrop-blur-xl bg-white/5 border border-purple-500/30 rounded-2xl p-6 cursor-pointer group overflow-hidden"
            >
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className={`p-3 rounded-xl bg-gradient-to-br ${category.color}`}
                    >
                      <Activity className="w-6 h-6 text-white" />
                    </motion.div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{category.name}</h3>
                      <p className="text-gray-400 text-sm">{category.articles} articles analyzed</p>
                    </div>
                  </div>

                  {/* Credibility Score */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: credibilityScores[category.name] ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="relative"
                  >
                    <svg className="w-24 h-24 -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <motion.circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: (credibilityScores[category.name] || 0) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeDasharray="251.2"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {credibilityScores[category.name] || 0}
                      </span>
                      <span className="text-xs text-gray-400">credibility</span>
                    </div>
                  </motion.div>
                </div>

                {/* Bias Spectrum */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-400 font-semibold">LEFT</span>
                    <span className="text-gray-400 font-semibold">CENTER</span>
                    <span className="text-blue-400 font-semibold">RIGHT</span>
                  </div>

                  {/* Bias Bar */}
                  <div className="relative h-3 bg-gradient-to-r from-red-500/20 via-gray-500/20 to-blue-500/20 rounded-full overflow-hidden">
                    {/* Center marker */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/50" />
                    
                    {/* Bias indicator */}
                    <motion.div
                      initial={{ left: "50%" }}
                      animate={{ left: `${getBiasPosition(category.bias)}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute top-0 bottom-0 w-1 -ml-0.5"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-4 h-4 -mt-0.5 -ml-1.5 rounded-full bg-purple-500 border-2 border-white shadow-lg"
                      />
                    </motion.div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">-50</span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                      className={`font-bold ${
                        category.bias < -10 ? 'text-red-400' :
                        category.bias > 10 ? 'text-blue-400' :
                        'text-green-400'
                      }`}
                    >
                      Bias Score: {category.bias > 0 ? '+' : ''}{category.bias}
                    </motion.span>
                    <span className="text-gray-500">+50</span>
                  </div>
                </div>

                {/* Processing indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="mt-4 flex items-center gap-2 text-xs text-gray-400"
                >
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-green-500 rounded-full"
                  />
                  <span>Processing in real-time</span>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Data Stream Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative backdrop-blur-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-3xl p-8 overflow-hidden"
        >
          {/* Animated data streams */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: -100, y: Math.random() * 100 + '%' }}
                animate={{
                  x: '100vw',
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "linear"
                }}
                className="absolute w-32 h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
                style={{ top: `${Math.random() * 100}%` }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center">
            <Shield className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4">
              Continuous Article Processing
            </h3>
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { label: 'Articles/min', value: '342', color: 'from-purple-500 to-pink-500' },
                { label: 'Sources Active', value: '2.5K', color: 'from-blue-500 to-cyan-500' },
                { label: 'Accuracy Rate', value: '94%', color: 'from-green-500 to-emerald-500' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, type: "spring" }}
                  className="text-center"
                >
                  <div className={`text-5xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LiveNewsVisualization;
