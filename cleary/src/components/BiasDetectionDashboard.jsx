import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, Target, Zap, TrendingUp } from './Icons';

const BiasDetectionDashboard = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [biasData] = useState([
    { source: 'Reuters', bias: 0, credibility: 98, articles: 1250 },
    { source: 'Bloomberg', bias: -15, credibility: 96, articles: 980 },
    { source: 'The Guardian', bias: -25, credibility: 89, articles: 850 },
    { source: 'Fox News', bias: 45, credibility: 72, articles: 620 },
    { source: 'CNN', bias: -20, credibility: 81, articles: 890 },
  ]);

  const [animatedBias, setAnimatedBias] = useState(biasData.map(() => 0));
  const [animatedCredibility, setAnimatedCredibility] = useState(biasData.map(() => 0));

  useEffect(() => {
    if (!isInView) return;

    // Animate bias bars
    biasData.forEach((source, index) => {
      setTimeout(() => {
        const duration = 1000;
        const steps = 60;
        const interval = duration / steps;
        let step = 0;

        const timer = setInterval(() => {
          step++;
          const progress = step / steps;
          const easeProgress = 1 - Math.pow(1 - progress, 3);

          setAnimatedBias(prev => {
            const newBias = [...prev];
            newBias[index] = source.bias * easeProgress;
            return newBias;
          });

          setAnimatedCredibility(prev => {
            const newCred = [...prev];
            newCred[index] = source.credibility * easeProgress;
            return newCred;
          });

          if (step >= steps) clearInterval(timer);
        }, interval);
      }, index * 150);
    });
  }, [isInView, biasData]);

  const getBiasColor = (bias) => {
    if (bias < -30) return '#ef4444'; // red (left)
    if (bias < -10) return '#f59e0b'; // orange
    if (bias > 30) return '#3b82f6'; // blue (right)
    if (bias > 10) return '#8b5cf6'; // purple
    return '#10b981'; // green (center)
  };

  const getBiasLabel = (bias) => {
    if (bias < -30) return 'LEFT';
    if (bias < -10) return 'LEFT-CENTER';
    if (bias > 30) return 'RIGHT';
    if (bias > 10) return 'RIGHT-CENTER';
    return 'CENTER';
  };

  return (
    <div ref={ref} className="w-full py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
          >
            <Shield className="w-6 h-6 text-purple-400" />
            <span className="text-purple-300 font-semibold uppercase tracking-wider text-sm">
              AI-Powered Bias Detection
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Unbiased Intelligence
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Advanced AI analyzes articles across the political spectrum for balanced perspectives
          </p>
        </div>

        {/* Bias visualization */}
        <div className="space-y-6">
          {biasData.map((source, index) => (
            <motion.div
              key={source.source}
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {source.source[0]}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{source.source}</h3>
                    <p className="text-gray-500 text-sm">{source.articles} articles analyzed</p>
                  </div>
                </div>

                {/* Credibility meter */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-white mb-1">
                    {Math.round(animatedCredibility[index])}%
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Credibility</div>
                </div>
              </div>

              {/* Bias spectrum bar */}
              <div className="relative">
                {/* Center line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20" />
                
                {/* Bias bar background */}
                <div className="relative h-12 bg-black/30 rounded-full overflow-hidden">
                  {/* Left/Right labels */}
                  <div className="absolute inset-0 flex items-center justify-between px-4 text-xs font-semibold text-white/40">
                    <span>LEFT</span>
                    <span>CENTER</span>
                    <span>RIGHT</span>
                  </div>

                  {/* Animated bias indicator */}
                  <motion.div
                    initial={{ width: 0 }}
                    style={{
                      width: `${Math.abs(animatedBias[index])}%`,
                      left: animatedBias[index] < 0 ? `${50 + animatedBias[index]}%` : '50%',
                    }}
                    className="absolute top-0 bottom-0 transition-all duration-300"
                  >
                    <div
                      style={{ backgroundColor: getBiasColor(source.bias) }}
                      className="h-full opacity-60 group-hover:opacity-80 transition-opacity"
                    />
                  </motion.div>

                  {/* Bias marker */}
                  <motion.div
                    initial={{ left: '50%' }}
                    animate={{
                      left: `${50 + animatedBias[index]}%`,
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-6 h-6 rounded-full border-4 border-white shadow-lg"
                      style={{ backgroundColor: getBiasColor(source.bias) }}
                    />
                  </motion.div>
                </div>

                {/* Bias label */}
                <div className="flex justify-between items-center mt-2">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: getBiasColor(source.bias) + '20',
                      color: getBiasColor(source.bias)
                    }}
                  >
                    {getBiasLabel(source.bias)}
                  </span>
                  <span className="text-xs text-gray-500">
                    Bias Score: {source.bias > 0 ? '+' : ''}{source.bias}
                  </span>
                </div>
              </div>

              {/* Credibility bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Source Reliability</span>
                  <span className="text-xs text-gray-500">{Math.round(animatedCredibility[index])}% verified</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${animatedCredibility[index]}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="grid md:grid-cols-3 gap-6 mt-12"
        >
          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-2xl p-6 text-center">
            <Target className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-2">94%</div>
            <div className="text-sm text-gray-400">Accuracy Rate</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/30 rounded-2xl p-6 text-center">
            <Zap className="w-8 h-8 text-pink-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-2">Instant</div>
            <div className="text-sm text-gray-400">Analysis</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 rounded-2xl p-6 text-center">
            <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-2">2.5K+</div>
            <div className="text-sm text-gray-400">Sources Tracked</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BiasDetectionDashboard;
