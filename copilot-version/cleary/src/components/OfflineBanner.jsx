import React from 'react';
import { motion } from 'framer-motion';

const OfflineBanner = ({ online }) => {
  if (online) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/10 border-b border-yellow-400/30 text-yellow-200 text-sm px-4 py-2 backdrop-blur"
    >
      You are offline. Showing cached content. New updates will appear once you reconnect.
    </motion.div>
  );
};

export default OfflineBanner;
