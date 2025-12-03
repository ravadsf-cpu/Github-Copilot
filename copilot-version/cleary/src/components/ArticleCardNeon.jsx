import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LikeButton from './ui/LikeButton';
import BookmarkButton from './ui/BookmarkButton';

/**
 * ArticleCardNeon - immersive article card with tilt, glow, and hover reveal
 * Props: title, snippet, source, leaning ('left'|'lean-left'|'center'|'lean-right'|'right'), publishedAt, image, onClick
 */
const leanToColor = (lean) => {
  switch (lean) {
    case 'left':
    case 'lean-left': return { ring: 'ring-blue-500/40', glow: 'lean-left-glow', dot: 'bg-blue-400' };
    case 'right':
    case 'lean-right': return { ring: 'ring-red-500/40', glow: 'lean-right-glow', dot: 'bg-red-400' };
    default: return { ring: 'ring-amber-400/40', glow: 'lean-center-glow', dot: 'bg-amber-300' };
  }
};

const ArticleCardNeon = ({
  title,
  snippet,
  source,
  leaning = 'center',
  publishedAt,
  image,
  onClick,
}) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hovered, setHovered] = useState(false);
  const color = leanToColor(leaning);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-white/10 ring-1 ${color.ring} glass-panel cursor-pointer ${color.glow}`}
    >
      {/* Glow gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 pointer-events-none" />

      {/* Media */}
      <div className="relative h-44 overflow-hidden">
        {image ? (
          <motion.img src={image} alt="cover" className="w-full h-full object-cover"
            animate={{ scale: hovered ? 1.08 : 1 }} transition={{ duration: 0.4 }} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Lean badge */}
        <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-2 py-1 rounded-md bg-black/60 border border-white/10">
          <span className={`w-2 h-2 rounded-full ${color.dot}`} />
          <span className="text-[10px] uppercase tracking-wider text-white/90">{leaning}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-medium text-gray-300">{source}</span>
          <span>{publishedAt}</span>
        </div>
        <h3 className="text-white text-lg font-semibold leading-snug">{title}</h3>
        {snippet && (
          <p className="text-gray-300 text-sm line-clamp-3">{snippet}</p>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <LikeButton liked={liked} count={liked ? 1 : 0} onToggle={() => setLiked(v => !v)} />
            <BookmarkButton saved={saved} onToggle={() => setSaved(v => !v)} />
          </div>
          <motion.span
            className="text-xs text-gray-400"
            animate={{ opacity: hovered ? 1 : 0.6 }}
          >
            Click to open
          </motion.span>
        </div>
      </div>

      {/* Pop-in indicator for new cards */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.4), rgba(168,85,247,0.2), transparent 70%)'
            }}
          />
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export default ArticleCardNeon;
