import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ExternalLink, Clock, Eye } from './Icons';

/**
 * VideoCard - Specialized card for displaying video news content
 * Features: Video embed, thumbnail preview, play button, metadata
 */
const VideoCard = ({ article, index = 0, onEngagement }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);

  const storageKey = 'shortsEngagement';
  const articleKey = article.url || article.title || ('idx-' + index);

  // Load engagement from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        const e = data[articleKey];
        if (e) {
          setLikes(e.likes || 0);
          setDislikes(e.dislikes || 0);
          setComments(e.comments || []);
        }
      }
    } catch {}
  }, [articleKey]);

  function persist(next) {
    try {
      const raw = localStorage.getItem(storageKey);
      const data = raw ? JSON.parse(raw) : {};
      data[articleKey] = { likes, dislikes, comments, ...next };
      localStorage.setItem(storageKey, JSON.stringify(data));
      if (onEngagement) onEngagement(articleKey, data[articleKey]);
    } catch {}
  }

  const videos = article.media?.videos || [];
  const images = article.media?.images || [];
  const currentVideo = videos[selectedVideoIndex];
  
  const thumbnail = currentVideo?.thumbnail || 
                    images[0]?.src || 
                    images[0] || 
                    article.urlToImage ||
                    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800';

  const formatSource = (source) => {
    if (!source) return 'Unknown';
    return typeof source === 'string' ? source : (source.name || 'News');
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handlePlay = () => setIsPlaying(true);

  const handleLike = () => {
    setLikes(l => {
      const nl = l + 1;
      persist({ likes: nl });
      return nl;
    });
  };
  const handleDislike = () => {
    setDislikes(d => {
      const nd = d + 1;
      persist({ dislikes: nd });
      return nd;
    });
  };
  const handleAddComment = () => {
    if (!commentText.trim()) return;
    setComments(prev => {
      const next = [...prev, { id: Date.now(), text: commentText.trim(), ts: new Date().toISOString() }];
      persist({ comments: next });
      return next;
    });
    setCommentText('');
  };

  const renderVideoEmbed = () => {
    if (!currentVideo) return null;

    const embedSrc = currentVideo.src;
    
    return (
      <div className="relative w-full h-full bg-black">
        <iframe
          src={embedSrc}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={article.title}
        />
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl overflow-hidden border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"
    >
      {/* Video Display Area */}
      <div className="relative aspect-video bg-black overflow-hidden">
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {renderVideoEmbed()}
            </motion.div>
          ) : (
            <motion.div
              key="thumbnail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {/* Thumbnail */}
              <img
                src={thumbnail}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800';
                }}
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Play Button */}
              <motion.button
                onClick={handlePlay}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute inset-0 flex items-center justify-center group/play"
              >
                <div className="relative">
                  {/* Pulsing ring */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-purple-500 rounded-full blur-xl"
                  />
                  
                  {/* Play button */}
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-full p-6 group-hover/play:bg-purple-500 transition-all duration-300">
                    <Play className="w-8 h-8 text-black group-hover/play:text-white fill-current transition-colors" />
                  </div>
                </div>
              </motion.button>

              {/* Video count badge */}
              {videos.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                  <span className="text-white text-sm font-medium">{videos.length} videos</span>
                </div>
              )}

              {/* Duration badge (if available) */}
              {currentVideo?.duration && (
                <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-white text-xs font-medium">
                  {currentVideo.duration}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Area */}
      <div className="p-5 space-y-3">
        {/* Source & Time */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-purple-300 font-medium">{formatSource(article.source)}</span>
          <div className="flex items-center space-x-1 text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(article.publishedAt)}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 group-hover:text-purple-300 transition-colors">
          {article.title}
        </h3>

        {/* Description */}
        {article.description && (
          <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">
            {article.description}
          </p>
        )}

        {/* Video Selector (if multiple videos) */}
        {videos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-500/50">
            {videos.map((video, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedVideoIndex(idx);
                  setIsPlaying(false);
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  idx === selectedVideoIndex
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                Video {idx + 1}
              </button>
            ))}
          </div>
        )}

        {/* Actions & Engagement */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors group/link"
            >
              <span>Read</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
            </a>
            <button
              onClick={handlePlay}
              className="flex items-center space-x-1 text-gray-400 hover:text-white text-xs transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Watch</span>
            </button>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <button onClick={handleLike} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-green-300">
                👍 <span className="ml-1 font-medium">{likes}</span>
              </button>
              <button onClick={handleDislike} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-red-300">
                👎 <span className="ml-1 font-medium">{dislikes}</span>
              </button>
            </div>
            <button onClick={() => setShowComments(s => !s)} className="text-gray-400 hover:text-white">
              💬 {comments.length}
            </button>
          </div>
          {showComments && (
            <div className="space-y-2">
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {comments.map(c => (
                  <div key={c.id} className="text-xs text-gray-300 bg-white/5 rounded px-2 py-1">{c.text}</div>
                ))}
                {comments.length === 0 && <div className="text-xs text-gray-500">No comments yet.</div>}
              </div>
              <div className="flex gap-2">
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Add comment"
                  className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-400/50"
                />
                <button
                  onClick={handleAddComment}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded"
                >Post</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 via-transparent to-pink-600/10" />
      </div>
    </motion.div>
  );
};

export default VideoCard;
