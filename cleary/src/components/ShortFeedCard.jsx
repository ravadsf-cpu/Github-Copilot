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
    } catch {}
  }, [articleKey]);

  function persistEngagement(next) {
    try {
      const raw = localStorage.getItem(engagementKey);
      const data = raw ? JSON.parse(raw) : {};
      data[articleKey] = { likes, dislikes, comments, ...next };
      localStorage.setItem(engagementKey, JSON.stringify(data));
      if (onEngagement) onEngagement(articleKey, data[articleKey]);
    } catch {}
  }
  function persistTrim(start, end) {
    try {
      const raw = localStorage.getItem(trimKey);
      const data = raw ? JSON.parse(raw) : {};
      data[articleKey] = { startSec: start, endSec: end };
      localStorage.setItem(trimKey, JSON.stringify(data));
    } catch {}
  }

  const videos = article.media?.videos || [];
  const currentVideo = videos[0];
  const thumbnail = currentVideo?.thumbnail || article.urlToImage || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800';

  const formatSource = (s) => (typeof s === 'string' ? s : s?.name) || 'News';
  const formatTimeAgo = (d) => {
    if (!d) return 'Recently';
    const date = new Date(d); const diff = Date.now() - date.getTime();
    const m = Math.floor(diff/60000), h = Math.floor(m/60), day = Math.floor(h/24);
    if (m < 60) return m + 'm ago'; if (h < 24) return h + 'h ago'; if (day < 7) return day + 'd ago'; return date.toLocaleDateString();
  };

  const handlePlay = () => { clearTimers(); setPendingStart(false); setIsPlaying(true); scheduleAdvance(); };
  const handleLike = () => setLikes(l => { const nl = l+1; persistEngagement({ likes: nl }); return nl; });
  const handleDislike = () => setDislikes(d => { const nd = d+1; persistEngagement({ dislikes: nd }); return nd; });
  const handleAddComment = () => { if (!commentText.trim()) return; setComments(prev => { const next=[...prev,{id:Date.now(),text:commentText.trim(),ts:new Date().toISOString()}]; persistEngagement({comments:next}); return next;}); setCommentText(''); };

  useEffect(() => {
    clearTimers();
    if (!active) { setIsPlaying(false); setPendingStart(false); return; }
    if (startSec > 0) {
      setPendingStart(true);
      timersRef.current.push(setTimeout(() => { setPendingStart(false); setIsPlaying(true); scheduleAdvance(); }, startSec*1000));
    } else { setIsPlaying(true); scheduleAdvance(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, startSec, endSec]);

  function scheduleAdvance() {
    const windowLen = Math.max(1, Math.min(endSec, MAX_DURATION_SEC) - Math.min(startSec, endSec));
    timersRef.current.push(setTimeout(() => { if (onAdvance) onAdvance(); }, windowLen*1000));
  }
  function clearTimers(){ timersRef.current.forEach(t=>clearTimeout(t)); timersRef.current=[]; }
  useEffect(()=>()=>clearTimers(),[]);

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className={`w-full h-[calc(100vh-88px)] snap-start flex flex-col bg-black rounded-xl overflow-hidden border border-white/10 ${active?'ring-2 ring-purple-500':''}`}>
      <div className="relative flex-1">
        {pendingStart && (<div className="absolute inset-0 flex items-center justify-center text-white text-sm">Starting at {formatSeconds(startSec)}...</div>)}
        {isPlaying && !pendingStart && currentVideo && (
          <iframe src={currentVideo.src} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={article.title} />
        )}
        {(!isPlaying || !currentVideo) && !pendingStart && (
          <img src={thumbnail} alt={article.title} className="w-full h-full object-cover" onError={e=>{e.target.src='https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800';}} />
        )}
        {!isPlaying && !pendingStart && (
          <motion.button onClick={handlePlay} whileHover={{scale:1.05}} whileTap={{scale:0.95}} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 text-black px-6 py-3 rounded-full font-medium shadow-lg hover:bg-purple-600 hover:text-white">Play</motion.button>
        )}
        {active && (
          <div className="absolute top-4 left-4 flex gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-white/10 text-white">{formatSource(article.source)}</span>
            <span className="px-2 py-1 rounded bg-white/10 text-purple-300">{formatTimeAgo(article.publishedAt)}</span>
          </div>
        )}
      </div>
      <div className="p-4 space-y-3 bg-gradient-to-t from-black via-black/70 to-transparent">
        <h3 className="text-white font-bold text-lg">{article.title}</h3>
        {article.description && <p className="text-gray-300 text-sm max-h-24 overflow-hidden leading-relaxed">{article.description}</p>}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 text-sm font-medium"><span>Read</span><ExternalLink className="w-3.5 h-3.5" /></a>
            <button onClick={handlePlay} className="flex items-center space-x-1 text-gray-400 hover:text-white text-xs"><Eye className="w-3.5 h-3.5" /><span>{isPlaying?'Playing':'Watch'}</span></button>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <button onClick={handleLike} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-green-300">👍 <span className="ml-1 font-medium">{likes}</span></button>
            <button onClick={handleDislike} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-red-300">👎 <span className="ml-1 font-medium">{dislikes}</span></button>
            <button onClick={()=>setShowEditor(s=>!s)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-purple-300">✂️ Trim</button>
            <button onClick={()=>setShowComments(s=>!s)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-gray-300">💬 {comments.length}</button>
          </div>
          {showEditor && (
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <label className="flex-1">Start
                  <input type="range" min={0} max={MAX_DURATION_SEC-1} value={startSec} onChange={e=>{const v=parseInt(e.target.value,10); setStartSec(v); if(v>=endSec) setEndSec(Math.min(v+1,MAX_DURATION_SEC)); persistTrim(v,endSec);}} className="w-full" />
                </label>
                <div className="w-16 text-right">{formatSeconds(startSec)}</div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex-1">End
                  <input type="range" min={startSec+1} max={MAX_DURATION_SEC} value={endSec} onChange={e=>{const v=parseInt(e.target.value,10); setEndSec(v); persistTrim(startSec,v);}} className="w-full" />
                </label>
                <div className="w-16 text-right">{formatSeconds(Math.min(endSec,MAX_DURATION_SEC))}</div>
              </div>
              <div className="text-gray-400">Playback: {formatSeconds(startSec)} - {formatSeconds(Math.min(endSec,MAX_DURATION_SEC))}</div>
              <div className="text-[10px] text-gray-500">External embeds: start trim simulated by delay.</div>
            </div>
          )}
          {showComments && (
            <div className="space-y-2">
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {comments.map(c=>(<div key={c.id} className="text-xs text-gray-300 bg-white/5 rounded px-2 py-1">{c.text}</div>))}
                {comments.length===0 && <div className="text-xs text-gray-500">No comments yet.</div>}
              </div>
              <div className="flex gap-2">
                <input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add comment" className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-400/50" />
                <button onClick={handleAddComment} className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded">Post</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

function formatSeconds(sec){const m=Math.floor(sec/60);const s=sec%60;return `${m}:${s.toString().padStart(2,'0')}`;}

export default ShortFeedCard;