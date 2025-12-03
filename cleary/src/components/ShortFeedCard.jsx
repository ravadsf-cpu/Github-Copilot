import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, ExternalLink, Clock, Eye } from './Icons';

const MAX_DURATION_SEC = 150;

const ShortFeedCard = ({ article, index = 0, onEngagement, active = false, onAdvance }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [pendingStart, setPendingStart] = useState(false);
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(MAX_DURATION_SEC);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const timersRef = useRef([]);

  const engagementKey = 'shortsEngagement';
  const trimKey = 'shortsTrim';
  const articleKey = article.url || article.title || ('idx-' + index);

  useEffect(() => {
    try {
      const eRaw = localStorage.getItem(engagementKey);
      if (eRaw) {
        const eData = JSON.parse(eRaw)[articleKey];
        if (eData) {
          setLikes(eData.likes || 0);
          setDislikes(eData.dislikes || 0);
          setComments(eData.comments || []);
        }
      }
      const tRaw = localStorage.getItem(trimKey);
      if (tRaw) {
        const tData = JSON.parse(tRaw)[articleKey];
        if (tData) {
          setStartSec(tData.startSec || 0);
          setEndSec(Math.min(tData.endSec || MAX_DURATION_SEC, MAX_DURATION_SEC));
        }
      }
    } catch { }
  }, [articleKey]);

  function persistEngagement(next) {
    try {
      const raw = localStorage.getItem(engagementKey);
      const data = raw ? JSON.parse(raw) : {};
      data[articleKey] = { likes, dislikes, comments, ...next };
      localStorage.setItem(engagementKey, JSON.stringify(data));
      if (onEngagement) onEngagement(articleKey, data[articleKey]);
    } catch { }
  }
  function persistTrim(start, end) {
    try {
      const raw = localStorage.getItem(trimKey);
      const data = raw ? JSON.parse(raw) : {};
      data[articleKey] = { startSec: start, endSec: end };
      localStorage.setItem(trimKey, JSON.stringify(data));
    } catch { }
  }

  const videos = article.media?.videos || [];
  const currentVideo = videos[0];
  const thumbnail = currentVideo?.thumbnail || article.urlToImage || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800';

  const formatSource = (s) => (typeof s === 'string' ? s : s?.name) || 'News';
  const formatTimeAgo = (d) => {
    if (!d) return 'Recently';
    const date = new Date(d); const diff = Date.now() - date.getTime();
    const m = Math.floor(diff / 60000), h = Math.floor(m / 60), day = Math.floor(h / 24);
    if (m < 60) return m + 'm ago'; if (h < 24) return h + 'h ago'; if (day < 7) return day + 'd ago'; return date.toLocaleDateString();
  };

  const handlePlay = () => { clearTimers(); setPendingStart(false); setIsPlaying(true); scheduleAdvance(); };
  const handleLike = () => setLikes(l => { const nl = l + 1; persistEngagement({ likes: nl }); return nl; });
  const handleDislike = () => setDislikes(d => { const nd = d + 1; persistEngagement({ dislikes: nd }); return nd; });
  const handleAddComment = () => { if (!commentText.trim()) return; setComments(prev => { const next = [...prev, { id: Date.now(), text: commentText.trim(), ts: new Date().toISOString() }]; persistEngagement({ comments: next }); return next; }); setCommentText(''); };

  useEffect(() => {
    clearTimers();
    if (!active) { setIsPlaying(false); setPendingStart(false); return; }
    if (startSec > 0) {
      setPendingStart(true);
      timersRef.current.push(setTimeout(() => { setPendingStart(false); setIsPlaying(true); scheduleAdvance(); }, startSec * 1000));
    } else { setIsPlaying(true); scheduleAdvance(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, startSec, endSec]);

  function scheduleAdvance() {
    const windowLen = Math.max(1, Math.min(endSec, MAX_DURATION_SEC) - Math.min(startSec, endSec));
    timersRef.current.push(setTimeout(() => { if (onAdvance) onAdvance(); }, windowLen * 1000));
  }
  function clearTimers() { timersRef.current.forEach(t => clearTimeout(t)); timersRef.current = []; }
  useEffect(() => () => clearTimers(), []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`w-full h-full snap-start flex flex-col bg-black overflow-hidden relative`}>
      <div className="relative flex-1">
        {pendingStart && (<div className="absolute inset-0 flex items-center justify-center text-white text-sm">Starting at {formatSeconds(startSec)}...</div>)}
        {isPlaying && !pendingStart && currentVideo && (
          <iframe src={currentVideo.src} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={article.title} />
        )}
        {(!isPlaying || !currentVideo) && !pendingStart && (
          <img src={thumbnail} alt={article.title} className="w-full h-full object-cover" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800'; }} />
        )}
        {!isPlaying && !pendingStart && (
          <motion.button onClick={handlePlay} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 text-black px-6 py-3 rounded-full font-medium shadow-lg hover:bg-purple-600 hover:text-white">Play</motion.button>
        )}

      </div>
      {/* Info Overlay (Bottom) */}
      <div className="absolute bottom-0 left-0 right-16 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
        <div className="pointer-events-auto space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium text-white">{formatSource(article.source)}</span>
            <span className="text-xs text-gray-300 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTimeAgo(article.publishedAt)}</span>
          </div>
          <h3 className="text-white font-bold text-xl leading-tight shadow-black drop-shadow-md">{article.title}</h3>
          {article.description && <p className="text-gray-200 text-sm line-clamp-2 drop-shadow-md">{article.description}</p>}

          <div className="flex items-center gap-4 pt-2">
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-white bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium transition-colors">
              <span>Read Article</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="absolute bottom-20 right-2 flex flex-col items-center gap-6 z-20">
        {/* Like */}
        <div className="flex flex-col items-center gap-1">
          <button onClick={handleLike} className="p-3 rounded-full bg-black/40 backdrop-blur-md hover:bg-white/20 text-white transition-all active:scale-95">
            <span className="text-2xl">👍</span>
          </button>
          <span className="text-xs font-medium text-white shadow-black drop-shadow-md">{likes}</span>
        </div>

        {/* Dislike */}
        <div className="flex flex-col items-center gap-1">
          <button onClick={handleDislike} className="p-3 rounded-full bg-black/40 backdrop-blur-md hover:bg-white/20 text-white transition-all active:scale-95">
            <span className="text-2xl">👎</span>
          </button>
          <span className="text-xs font-medium text-white shadow-black drop-shadow-md">{dislikes}</span>
        </div>

        {/* Comments */}
        <div className="flex flex-col items-center gap-1">
          <button onClick={() => setShowComments(s => !s)} className="p-3 rounded-full bg-black/40 backdrop-blur-md hover:bg-white/20 text-white transition-all active:scale-95">
            <span className="text-2xl">💬</span>
          </button>
          <span className="text-xs font-medium text-white shadow-black drop-shadow-md">{comments.length}</span>
        </div>

        {/* Trim (Tools) */}
        <div className="flex flex-col items-center gap-1">
          <button onClick={() => setShowEditor(s => !s)} className="p-3 rounded-full bg-black/40 backdrop-blur-md hover:bg-white/20 text-white transition-all active:scale-95">
            <span className="text-xl">✂️</span>
          </button>
          <span className="text-xs font-medium text-white shadow-black drop-shadow-md">Trim</span>
        </div>
      </div>

      {/* Popups (Comments/Editor) - Absolute positioned over video */}
      {showComments && (
        <div className="absolute bottom-0 right-0 w-full sm:w-80 h-1/2 sm:h-auto sm:max-h-[60vh] bg-black/90 backdrop-blur-xl border-t sm:border-l border-white/10 p-4 flex flex-col gap-3 z-30 rounded-t-2xl sm:rounded-tl-2xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h4 className="text-white font-bold">Comments</h4>
            <button onClick={() => setShowComments(false)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {comments.map(c => (<div key={c.id} className="text-sm text-gray-200 bg-white/5 rounded p-2">{c.text}</div>))}
            {comments.length === 0 && <div className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first!</div>}
          </div>
          <div className="flex gap-2 mt-auto">
            <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add comment..." className="flex-1 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-400/50" />
            <button onClick={handleAddComment} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-full">Post</button>
          </div>
        </div>
      )}

      {showEditor && (
        <div className="absolute bottom-20 left-4 right-16 bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl z-30">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-white text-sm font-bold">Trim Video</h4>
            <button onClick={() => setShowEditor(false)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <div className="space-y-3 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <label className="flex-1">Start
                <input type="range" min={0} max={MAX_DURATION_SEC - 1} value={startSec} onChange={e => { const v = parseInt(e.target.value, 10); setStartSec(v); if (v >= endSec) setEndSec(Math.min(v + 1, MAX_DURATION_SEC)); persistTrim(v, endSec); }} className="w-full accent-purple-500" />
              </label>
              <div className="w-12 text-right font-mono">{formatSeconds(startSec)}</div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex-1">End
                <input type="range" min={startSec + 1} max={MAX_DURATION_SEC} value={endSec} onChange={e => { const v = parseInt(e.target.value, 10); setEndSec(v); persistTrim(startSec, v); }} className="w-full accent-purple-500" />
              </label>
              <div className="w-12 text-right font-mono">{formatSeconds(Math.min(endSec, MAX_DURATION_SEC))}</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

function formatSeconds(sec) { const m = Math.floor(sec / 60); const s = sec % 60; return `${m}:${s.toString().padStart(2, '0')}`; }

export default ShortFeedCard;