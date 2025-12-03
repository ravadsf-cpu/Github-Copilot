import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import LikeButton from './ui/LikeButton';

/**
 * ShortsVideo - lightweight demo component to showcase auto-play/pause and overlays
 * Props: videoUrl, duration, title, source, onLike, onShare
 */
const ShortsVideo = ({ videoUrl, duration = 150, title, source, onLike, onShare }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => setInView(e.isIntersecting));
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const video = ref.current?.querySelector('video');
    if (!video) return;
    if (inView) video.play().catch(() => {});
    else video.pause();
  }, [inView]);

  return (
    <div ref={ref} className="relative w-full h-[80vh] rounded-2xl overflow-hidden border border-white/10">
      <video src={videoUrl} muted playsInline loop className="w-full h-full object-cover" />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-3 left-3 right-16 text-white">
        <div className="flex items-center gap-2 text-xs opacity-90 mb-1">
          <span className="px-2 py-0.5 rounded bg-white/20 border border-white/20">{source}</span>
          <span className="opacity-80">{Math.ceil(duration/60)} min</span>
        </div>
        <h3 className="font-semibold text-lg drop-shadow">{title}</h3>
      </div>

      {/* Actions */}
      <div className="absolute bottom-16 right-3 flex flex-col items-center gap-3">
        <LikeButton liked={liked} count={liked ? 1 : 0} onToggle={() => { setLiked(v=>!v); onLike && onLike(); }} />
        <motion.button whileTap={{ scale: 0.92 }} onClick={onShare} className="p-2 rounded-full text-blue-300 bg-blue-300/10">🔗</motion.button>
      </div>
    </div>
  );
};

export default ShortsVideo;
