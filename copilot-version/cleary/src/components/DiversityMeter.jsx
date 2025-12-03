import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Scale, Lightbulb } from './Icons';
import { getAdaptiveRecommendation } from '../utils/adaptiveLearning';

export default function DiversityMeter({ articles = [] }) {
  const [adaptive, setAdaptive] = useState(null);

  useEffect(() => {
    const rec = getAdaptiveRecommendation();
    setAdaptive(rec);
  }, []);

  const stats = useMemo(() => {
    const counts = { left: 0, 'lean-left': 0, center: 0, 'lean-right': 0, right: 0 };
    let totalScore = 0;
    let validCount = 0;

    articles.forEach(a => {
      if (a.lean) {
        counts[a.lean] = (counts[a.lean] || 0) + 1;
      }
      if (typeof a.leanScore === 'number') {
        totalScore += a.leanScore;
        validCount++;
      }
    });

    const total = articles.length || 1;
    const avgScore = validCount > 0 ? totalScore / validCount : 0;
    
    // Diversity score: how evenly spread across categories (simple shannon-like)
    const dist = Object.values(counts).map(c => c / total).filter(p => p > 0);
    const diversity = dist.length > 0 
      ? -dist.reduce((sum, p) => sum + p * Math.log2(p), 0) / Math.log2(5) // normalized 0-1
      : 0;

    return {
      counts,
      total,
      avgScore,
      diversity: diversity * 100, // 0-100
      avgLean: avgScore < -0.4 ? 'Left' : avgScore < -0.1 ? 'Lean Left' : avgScore < 0.1 ? 'Center' : avgScore < 0.4 ? 'Lean Right' : 'Right'
    };
  }, [articles]);

  const leanColors = {
    left: 'bg-blue-500',
    'lean-left': 'bg-blue-400',
    center: 'bg-gray-400',
    'lean-right': 'bg-red-400',
    right: 'bg-red-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-pink-600/10 rounded-2xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Feed Diversity</h3>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30">
            <TrendingUp className="w-4 h-4 text-purple-300" />
            <span className="text-sm font-semibold text-purple-200">{stats.diversity.toFixed(0)}%</span>
          </div>
        </div>

        {/* Distribution bars */}
        <div className="space-y-2 mb-4">
          {Object.entries(stats.counts).map(([lean, count]) => {
            const pct = (count / stats.total) * 100;
            if (pct === 0) return null;
            const label = lean === 'lean-left' ? 'Lean Left' : lean === 'lean-right' ? 'Lean Right' : lean.charAt(0).toUpperCase() + lean.slice(1);
            return (
              <div key={lean} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span className="font-medium">{label}</span>
                  <span className="text-gray-400">{count} ({pct.toFixed(0)}%)</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                    className={`h-full ${leanColors[lean]}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Average lean indicator */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Average Lean:</span>
            <span className="font-semibold text-white">{stats.avgLean}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {stats.diversity > 70 ? '🎯 Highly diverse feed' : stats.diversity > 40 ? '⚖️ Moderate diversity' : '🔄 Low diversity - try Balanced mode'}
          </div>
        </div>

        {/* Adaptive recommendation */}
        {adaptive && adaptive.clickCount > 5 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-white/10"
          >
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-purple-500/10 border border-purple-400/30">
              <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs font-semibold text-purple-200 mb-1">
                  Your reading lean: {adaptive.userLean.charAt(0).toUpperCase() + adaptive.userLean.slice(1)}
                </div>
                <div className="text-[10px] text-gray-300 leading-relaxed">{adaptive.suggestion}</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
