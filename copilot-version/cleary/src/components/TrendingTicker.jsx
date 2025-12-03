import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * TrendingTicker
 * Props:
 * - headlines: string[] | { id?: string; title: string }[]
 * - onClickHeadline?: (headline: string) => void
 * - speed?: number (px/sec)
 */
const TrendingTicker = ({ headlines = [], onClickHeadline, speed = 120 }) => {
  const items = useMemo(() => {
    return headlines.map((h) => typeof h === 'string' ? h : (h?.title || ''))
      .filter(Boolean);
  }, [headlines]);

  if (!items.length) return null;

  // Create a long repeated list for seamless marquee
  const repeated = [...items, ...items, ...items];

  return (
    <div className="relative w-full overflow-hidden ticker">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-transparent to-transparent" />
      <div className="flex items-center gap-3 px-2 py-2">
        <span className="text-xs font-semibold tracking-widest text-yellow-300/90">BREAKING</span>
        <div className="relative flex-1 overflow-hidden">
          <motion.div
            className="flex items-center gap-8 whitespace-nowrap"
            animate={{ x: [0, -2000] }}
            transition={{ repeat: Infinity, ease: 'linear', duration: Math.max(10, (repeated.join(' • ').length * 3) / speed) }}
          >
            {repeated.map((h, i) => (
              <AnimatePresence key={`${h}-${i}`}>
                <motion.button
                  initial={{ opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ scale: 1.05, y: -1 }}
                  className="ticker-item text-sm text-gray-200 hover:text-white hover:underline"
                  onClick={() => onClickHeadline && onClickHeadline(h)}
                >
                  {h}
                </motion.button>
              </AnimatePresence>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TrendingTicker;
