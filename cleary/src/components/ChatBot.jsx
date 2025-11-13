import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles, Settings } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001';

export default function ChatBot({ politicalLean, interests, preference: propPreference }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { userPreferences, setUserPreferences } = useApp();
  const [localPreference, setLocalPreference] = useState(propPreference || userPreferences?.politicalBalance || 'balanced');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your news assistant. Ask me about current events, or tell me what topics interest you.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedArticles, setSuggestedArticles] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setLocalPreference(propPreference || userPreferences?.politicalBalance || 'balanced');
  }, [propPreference, userPreferences?.politicalBalance]);

  const handlePreferenceChange = (pref) => {
    setLocalPreference(pref);
    setUserPreferences({ ...userPreferences, politicalBalance: pref });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          politicalLean,
          interests,
          preference: localPreference
        })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        category: data.category
      }]);
      
      if (data.articles && data.articles.length > 0) {
        setSuggestedArticles(data.articles);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (article) => {
    navigate(`/article/${encodeURIComponent(article.url)}`, { state: { article } });
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating chat button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full p-4 shadow-2xl hover:shadow-purple-500/50 transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{ display: isOpen ? 'none' : 'block' }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-slate-900 rounded-2xl shadow-2xl border border-purple-500/30 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">News Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSettings(!showSettings)}
                  className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </motion.button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Settings panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-800/50 border-b border-purple-500/30 overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    <div className="text-xs font-semibold text-slate-300 mb-2">Personalization Mode</div>
                    <div className="grid grid-cols-3 gap-2">
                      {['reinforce', 'balanced', 'challenge'].map((mode) => (
                        <motion.button
                          key={mode}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePreferenceChange(mode)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            localPreference === mode
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {mode === 'reinforce' && '🎯 Reinforce'}
                          {mode === 'balanced' && '⚖️ Balanced'}
                          {mode === 'challenge' && '🔄 Challenge'}
                        </motion.button>
                      ))}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2">
                      {localPreference === 'reinforce' && 'Prioritize sources aligned with your views'}
                      {localPreference === 'balanced' && 'Show diverse perspectives equally'}
                      {localPreference === 'challenge' && 'Show viewpoints that challenge yours'}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 whitespace-pre-wrap break-words ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    {msg.content}
                    {msg.category && msg.category !== 'breaking' && (
                      <div className="mt-2 text-xs opacity-70">
                        📁 Category: {msg.category}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested articles */}
            {suggestedArticles.length > 0 && (
              <div className="border-t border-purple-500/30 p-3 max-h-40 overflow-y-auto bg-slate-800/50">
                <div className="text-xs text-slate-400 mb-2 font-semibold">Suggested Articles:</div>
                <div className="space-y-2">
                  {suggestedArticles.slice(0, 3).map((article, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleArticleClick(article)}
                      className="w-full text-left text-xs bg-slate-700/50 hover:bg-slate-700 p-2 rounded-lg transition-colors border border-purple-500/20"
                    >
                      <div className="font-medium text-slate-200 line-clamp-2">{article.title}</div>
                      <div className="text-slate-400 text-[10px] mt-1">
                        {typeof article.source === 'string' ? article.source : (article.source?.name || 'Source')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-purple-500/30 bg-slate-800/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about news..."
                  className="flex-1 bg-slate-900 border border-purple-500/30 rounded-full px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full p-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
