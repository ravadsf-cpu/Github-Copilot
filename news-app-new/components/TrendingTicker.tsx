"use client";
import { motion } from 'framer-motion';

export default function TrendingTicker({ headlines }: { headlines: string[] }) {
  const text = headlines.join(' • ');
  return (
    <div className="overflow-hidden whitespace-nowrap border-b border-white/10 py-2 text-sm text-white/80">
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: ['0%', '-100%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {text}
      </motion.div>
    </div>
  );
}
