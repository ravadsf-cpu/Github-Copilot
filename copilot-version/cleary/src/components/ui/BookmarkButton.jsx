import React from 'react';
import { motion } from 'framer-motion';

const BookmarkIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2h12a1 1 0 0 1 1 1v19l-7-4-7 4V3a1 1 0 0 1 1-1z" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

/**
 * BookmarkButton with fly-to-corner animation
 * Props: saved, onToggle
 */
const BookmarkButton = ({ saved = false, onToggle }) => {
  return (
    <div className="relative inline-flex">
      <motion.button
        aria-pressed={saved}
        whileTap={{ scale: 0.92 }}
        onClick={onToggle}
        className={`p-2 rounded-md ${saved ? 'text-yellow-300 bg-yellow-300/10' : 'text-gray-400 hover:text-yellow-200 hover:bg-yellow-200/10'} transition-colors`}
      >
        <motion.span animate={saved ? { y: [0, -4, 0] } : {}} transition={{ duration: 0.35 }}>
          <BookmarkIcon filled={saved} />
        </motion.span>
      </motion.button>

      {/* Fly-away bookmark when saved */}
      {saved && (
        <motion.div
          className="absolute"
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: 80, y: -60, scale: 0.6, rotate: -15 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <BookmarkIcon filled={true} />
        </motion.div>
      )}
    </div>
  );
};

export default BookmarkButton;
