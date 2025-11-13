import React, { useEffect, useState, useCallback } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import Header from '../components/Header';
import AISection from '../components/AISection';
import NewsCard from '../components/NewsCard';
import { fetchNews } from '../utils/aiService';
import { useApp } from '../contexts/AppContext';
import { motion } from 'framer-motion';
import { Globe2, Zap, Filter, RefreshCcw, Video, LayoutGrid, Search, Flame } from '../components/Icons';

// Command Center: unified high-density dashboard for power users
const QUICK_CATEGORIES = [
  'breaking','world','politics','business','science','health'
];

const CommandCenterPage = () => {
  const { currentMood } = useApp();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [strategy, setStrategy] = useState('balanced');
  const [videoSpotlight, setVideoSpotlight] = useState(null);
  const [category, setCategory] = useState('breaking');
  const [aiInjected, setAiInjected] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadArticles = useCallback(async (opts={}) => {
    setLoading(true);
    const data = await fetchNews({ category: opts.category || category, strategy: strategy, personalize: true });
    const list = data.articles || [];
    // Spotlight: first with video else first
    const vid = list.find(a => a.media?.videos?.length > 0) || list[0] || null;
    setVideoSpotlight(vid);
    setArticles(list);
    setLoading(false);
  }, [category, strategy]);

  // Include loadArticles in dependencies to satisfy exhaustive-deps and ensure correctness
  useEffect(() => { loadArticles({ category }); }, [loadArticles, category, refreshKey]);

  const handleAIArticles = (aiArticles, cat) => {
    setAiInjected({ articles: aiArticles, category: cat });
  };

  const displayed = aiInjected ? aiInjected.articles : articles.filter(a => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (a.title||'').toLowerCase().includes(s) || (a.summary||'').toLowerCase().includes(s);
  });

  return (
    <AnimatedBackground mood={currentMood}>
      <Header />
      <main className="container mx-auto px-6 pt-24 pb-16">
        {/* Title Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Launch Command Center</h1>
            <p className="text-gray-400 mt-2 text-sm max-w-xl">High-velocity intelligence hub: real-time feeds, AI intent queries, personalization switches and video spotlight—all in one unified surface.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setRefreshKey(k=>k+1)} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-2 text-sm"><RefreshCcw className="w-4 h-4"/>Refresh</button>
            <button onClick={() => setStrategy(s=> s==='balanced' ? 'reinforce' : s==='reinforce' ? 'challenge' : 'balanced')} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium flex items-center gap-2">
              <Filter className="w-4 h-4"/> {strategy.charAt(0).toUpperCase()+strategy.slice(1)}
            </button>
          </div>
        </div>

        {/* Spotlight Section */}
        {videoSpotlight && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-10 grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur group">
              <img src={videoSpotlight.urlToImage || videoSpotlight.media?.videos?.[0]?.thumbnail || ''} alt={videoSpotlight.title} className="w-full h-72 object-cover" onError={e=> e.target.style.display='none'} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 mb-2">
                  {videoSpotlight.media?.videos?.length > 0 && <span className="px-2 py-1 rounded-md bg-pink-600 text-xs font-bold">VIDEO</span>}
                  <span className="text-xs text-gray-300">{videoSpotlight.source?.name}</span>
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2 line-clamp-2">{videoSpotlight.title}</h2>
                <p className="text-gray-300 text-sm line-clamp-3">{videoSpotlight.summary || videoSpotlight.description}</p>
                <div className="mt-4 flex gap-3">
                  <a href={`/article/${encodeURIComponent(videoSpotlight.url)}`} className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-500">Open Article</a>
                  {videoSpotlight.media?.videos?.[0]?.src && <a href={videoSpotlight.media.videos[0].src} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 flex items-center gap-2"><Video className="w-4 h-4"/>Play External</a>}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Globe2 className="w-4 h-4"/> Quick Categories</h3>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_CATEGORIES.map(cat => (
                    <button key={cat} onClick={()=> setCategory(cat)} className={`text-xs px-2 py-1 rounded-md border ${category===cat ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent' : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Zap className="w-4 h-4"/> Search</h3>
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400"/>
                  <input value={search} onChange={e=> setSearch(e.target.value)} placeholder="Filter articles..." className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-500"/>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><LayoutGrid className="w-4 h-4"/> Metrics</h3>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>Total Articles: {articles.length}</li>
                  <li>AI Injected: {aiInjected ? aiInjected.articles.length : 0}</li>
                  <li>Video Articles: {articles.filter(a=> a.media?.videos?.length).length}</li>
                </ul>
              </div>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><Flame className="w-4 h-4"/> Mode</h3>
                <p className="text-xs text-gray-300 mb-2">Political balance strategy cycles through Balanced → Reinforce → Challenge.</p>
                <p className="text-[10px] text-gray-400">Current: {strategy}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Assistant */}
        <AISection onAskNews={handleAIArticles} />

        {/* Articles Grid */}
        {loading ? (
          <div className="py-20 flex justify-center"><div className="animate-spin w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full" /></div>
        ) : (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map((a,i)=> <NewsCard key={a.id+':'+i} article={a} index={i} />)}
          </motion.div>
        )}
      </main>
    </AnimatedBackground>
  );
};

export default CommandCenterPage;