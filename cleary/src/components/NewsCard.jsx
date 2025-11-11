import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Bookmark, Share2, ExternalLink } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { postInteraction } from '../utils/aiService';

const NewsCard = ({ article, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { trackArticleInteraction, setBackgroundMood } = useApp();

  const springConfig = { stiffness: 300, damping: 30 };
  const organicEase = [0.17, 0.67, 0.83, 0.67];

  const handleClick = async () => {
    trackArticleInteraction(article, { type: 'read', readTime: 0 });
    setBackgroundMood(article.mood);
    // Fire and forget interaction logging
    try { await postInteraction(article); } catch {}
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: organicEase }}
      whileHover={{ y: -12, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all group cursor-pointer"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-pink-600/0 to-purple-600/0 group-hover:from-purple-600/20 group-hover:via-pink-600/20 group-hover:to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
      
      <Link
        to={`/article/${encodeURIComponent(article.url || article.id)}`}
        onClick={handleClick}
        className="block relative"
      >
        {/* Image */}
        {(() => {
          const cardImage = article.image || article.media?.images?.[0]?.src;
          return cardImage ? (
          <div className="relative h-48 overflow-hidden">
            <motion.img
              src={cardImage}
              alt={article.title}
              className="w-full h-full object-cover"
              animate={{
                scale: isHovered ? 1.05 : 1
              }}
              transition={{ duration: 0.3 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Mood badge */}
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/20 text-xs font-medium text-white capitalize">
              {article.mood}
            </div>

            {/* Bias indicator */}
            {article.bias && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/20 text-xs font-medium text-white capitalize">
                {article.bias}
              </div>
            )}

            {/* Media badges */}
            {(article.media?.images?.length || article.media?.videos?.length) && (
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                {article.media?.images?.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-semibold">
                    {article.media.images.length} img
                  </span>
                )}
                {article.media?.videos?.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-semibold">
                    {article.media.videos.length} vid
                  </span>
                )}
              </div>
            )}
          </div>
          ) : null;
        })()}

        {/* Content */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-medium text-gray-300">
              {typeof article.source === 'string' ? article.source : article.source?.name || 'Unknown'}
            </span>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{article.readTime || 5} min</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white leading-snug group-hover:text-purple-300 transition-colors line-clamp-2">
            {article.title}
          </h3>

          <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
            {article.summary || article.description}
          </p>

          {/* Full doc indicator */}
          {(article.contentHtml && article.contentHtml.length > 800) && (
            <div className="text-[11px] text-purple-300">Full document available</div>
          )}

          {/* Actions with enhanced animations */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <motion.button
              whileHover={{ scale: 1.1, x: 3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', ...springConfig }}
              className="flex items-center space-x-1 text-sm text-gray-400 hover:text-purple-400 transition-colors group/btn"
              onClick={(e) => {
                e.preventDefault();
                // Handle read action
              }}
            >
              <motion.div
                animate={{ rotate: isHovered ? 15 : 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <ExternalLink className="w-4 h-4" />
              </motion.div>
              <span className="font-medium">Read</span>
            </motion.button>

            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', ...springConfig }}
                onClick={(e) => {
                  e.preventDefault();
                  // Handle bookmark
                }}
                className="relative p-2 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors group/bookmark"
              >
                <div className="absolute inset-0 bg-yellow-400/0 group-hover/bookmark:bg-yellow-400/10 rounded-lg blur transition-all" />
                <Bookmark className="w-4 h-4 relative z-10" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', ...springConfig }}
                onClick={(e) => {
                  e.preventDefault();
                  // Handle share
                }}
                className="relative p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors group/share"
              >
                <div className="absolute inset-0 bg-blue-400/0 group-hover/share:bg-blue-400/10 rounded-lg blur transition-all" />
                <Share2 className="w-4 h-4 relative z-10" />
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default NewsCard;
