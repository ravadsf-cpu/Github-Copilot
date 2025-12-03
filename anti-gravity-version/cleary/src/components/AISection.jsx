import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2, ArrowRight, TrendingUp, Newspaper } from './Icons';

const AISection = ({ onAskNews }) => {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const quickPrompts = [
    { icon: TrendingUp, text: "What's trending in politics today?", category: 'politics' },
    { icon: Newspaper, text: "Give me the latest breaking news", category: 'breaking' },
    { icon: Sparkles, text: "What's happening in the economy?", category: 'economy' },
  ];

  const handleSubmit = async (e, promptText = null) => {
    e?.preventDefault();
    const queryText = promptText || question;
    if (!queryText.trim() || loading) return;

    setLoading(true);
    setIsExpanded(true);

    // Add user message to chat
    const userMessage = { role: 'user', content: queryText };
    setChatHistory(prev => [...prev, userMessage]);
    setQuestion('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: queryText,
          politicalLean: 'centrist',
          interests: []
        }),
      });

      const data = await response.json();
      
      // Add AI response to chat
      const aiMessage = { 
        role: 'assistant', 
        content: data.response,
        articles: data.articles || [],
        category: data.category
      };
      setChatHistory(prev => [...prev, aiMessage]);

      // Notify parent if articles were returned
      if (data.articles && data.articles.length > 0 && onAskNews) {
        onAskNews(data.articles, data.category);
      }
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.',
        articles: []
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    handleSubmit(null, prompt.text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="relative rounded-2xl backdrop-blur-xl theme-panel overflow-hidden">
        
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-white/10">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <span>AI News Assistant</span>
                </h2>
                <p className="text-sm text-gray-400">Ask me anything about the news or request specific articles</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              {isExpanded ? 'Minimize' : 'Expand'}
            </button>
          </div>

          {/* Chat History */}
          <AnimatePresence>
            {isExpanded && chatHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 space-y-3 max-h-96 overflow-y-auto pr-2"
              >
                {chatHistory.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-xl ${
                          msg.role === 'user'
                            ? 'bg-white/20 backdrop-blur-sm border border-white/10 text-gray-100'
                            : 'bg-white/10 backdrop-blur-sm border border-white/10 text-gray-200'
                        }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                      
                      {/* Show article count if available */}
                      {msg.articles && msg.articles.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/20">
                          <p className="text-xs text-gray-300">
                            📰 Found {msg.articles.length} relevant articles
                            {msg.category && msg.category !== 'breaking' && (
                              <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-white">
                                {msg.category}
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Prompts */}
          {chatHistory.length === 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {quickPrompts.map((prompt, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickPrompt(prompt)}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 hover:text-white transition-all disabled:opacity-50"
                >
                  <prompt.icon className="w-4 h-4" />
                  <span>{prompt.text}</span>
                  <ArrowRight className="w-3 h-3" />
                </motion.button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about news, request articles, or get insights..."
                disabled={loading}
                className="w-full px-5 py-3 rounded-xl theme-input backdrop-blur-sm placeholder-black/40 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 transition-all disabled:opacity-50"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading || !question.trim()}
              className="p-3 rounded-xl theme-button hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Send className="w-6 h-6" />
              )}
            </motion.button>
          </form>

          {/* Disclaimer */}
          <p className="mt-3 text-xs text-gray-500 text-center">
            Powered by Gemini AI • Responses are generated and may not always be accurate
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AISection;
