import React from 'react';
import { motion } from 'framer-motion';

const Heart = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21s-6.716-4.33-9.121-7.293C1.268 11.864 1 10.93 1 9.955 1 7.232 3.239 5 5.99 5c1.59 0 3.028.77 4.01 1.97C11.982 5.77 13.42 5 15.01 5 17.761 5 20 7.232 20 9.955c0 .975-.268 1.909-1.879 3.752C18.716 16.67 12 21 12 21z" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

/**
 * LikeButton with heart burst animation
 * Props: liked, count, onToggle
 */
const LikeButton = ({ liked = false, count = 0, onToggle }) => {
  return (
    <div className="relative inline-flex flex-col items-center">
      <motion.button
        aria-pressed={liked}
        whileTap={{ scale: 0.9 }}
        onClick={onToggle}
        className={`p-2 rounded-full ${liked ? 'text-pink-400 bg-pink-400/10' : 'text-gray-400 hover:text-pink-300 hover:bg-pink-300/10'} transition-colors`}
      >
        <motion.span
          animate={liked ? { scale: [1, 1.3, 1], rotate: [0, -10, 0] } : {}}
          transition={{ type: 'spring', stiffness: 500, damping: 12 }}
          className="block"
        >
          <Heart filled={liked} />
        </motion.span>
      </motion.button>
      <span className="text-xs text-gray-400 mt-0.5">{count}</span>

      {/* Burst particles */}
      {liked && (
        <div className="pointer-events-none absolute -top-1">
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute w-1 h-1 bg-pink-400 rounded-full"
              initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              animate={{ opacity: 0, scale: 0.5, x: Math.cos((i/6)*Math.PI*2)*16, y: Math.sin((i/6)*Math.PI*2)*-16 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LikeButton;
