import React from 'react';
import { motion } from 'framer-motion';
import { updateProfileWithInteraction } from '../services/personalization';

const RecommendationFeedback = ({ article, onFeedback }) => {
  const handle = (value) => {
    const profile = updateProfileWithInteraction(article, { type: 'feedback', liked: value === 'up' });
    onFeedback && onFeedback(value, profile);
  };
  return (
    <div className="inline-flex gap-1">
      <motion.button whileTap={{ scale: 0.92 }} onClick={() => handle('up')} className="px-2 py-1 rounded bg-green-500/10 text-green-300 text-xs">👍</motion.button>
      <motion.button whileTap={{ scale: 0.92 }} onClick={() => handle('down')} className="px-2 py-1 rounded bg-red-500/10 text-red-300 text-xs">👎</motion.button>
    </div>
  );
};

export default RecommendationFeedback;
