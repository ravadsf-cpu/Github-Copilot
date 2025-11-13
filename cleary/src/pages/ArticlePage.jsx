import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, User, ExternalLink, Share2, Bookmark } from '../components/Icons';
import TiltEmbed from '../components/TiltEmbed';
import AnimatedBackground from '../components/AnimatedBackground';
import Header from '../components/Header';
import { postInteraction } from '../utils/aiService';

const ArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [iframeErrors, setIframeErrors] = useState({});

  useEffect(() => {
    const loadArticle = async () => {
      try {
        // Fetch article from NewsAPI or cache
        const res = await fetch(`/api/news`);
        const data = await res.json();
        const found = data.articles.find(a => encodeURIComponent(a.url) === id || a.id === id);
        if (found) {
          setArticle(found);
          await postInteraction(found);
          // If no videos present, try enriching from the source page
          try {
            const missingVideos = !found.media || !found.media.videos || found.media.videos.length === 0;
            const missingImage = !(found.urlToImage || found.image || (found.media && found.media.images && found.media.images.length > 0));
            if (missingVideos || missingImage) {
              const enr = await fetch(`/api/article?url=${encodeURIComponent(found.url)}`);
              if (enr.ok) {
                const extra = await enr.json();
                setArticle(prev => {
                  if (!prev) return prev;
                  const prevImages = prev.media?.images || [];
                  const prevVideos = prev.media?.videos || [];
                  const newImages = extra.media?.images || [];
                  const newVideos = extra.media?.videos || [];
                  // Dedup by src
                  const dedup = (arr) => {
                    const seen = new Set();
                    return arr.filter(x => {
                      const key = typeof x === 'string' ? x : x.src;
                      if (!key || seen.has(key)) return false;
                      seen.add(key); return true;
                    });
                  };
                  return {
                    ...prev,
                    urlToImage: prev.urlToImage || newImages[0]?.src || prev.urlToImage,
                    contentHtml: prev.contentHtml || extra.contentHtml || prev.contentHtml,
                    media: {
                      images: dedup([...(prevImages || []), ...(newImages || [])]),
                      videos: dedup([...(prevVideos || []), ...(newVideos || [])]),
                    }
                  };
                });
              }
            }
          } catch (enrichErr) {
            console.warn('Media enrichment failed', enrichErr);
          }
        }
      } catch (e) {
        console.error('Failed to load article', e);
      } finally {
        setLoading(false);
      }
    };
    loadArticle();
  }, [id]);

  // Improve auto-generation context: set document title and meta description
  useEffect(() => {
    if (!article) return;
    const prevTitle = document.title;
    document.title = `${article.title || 'Article'} — Cleary`;

    let meta = document.querySelector('meta[name="description"]');
    const prevMeta = meta ? meta.getAttribute('content') : null;
    const desc = article.description || article.summary || '';
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    if (desc) meta.setAttribute('content', desc);

    return () => {
      document.title = prevTitle;
      if (meta && prevMeta !== null) meta.setAttribute('content', prevMeta);
    };
  }, [article]);

  if (loading) {
    return (
      <AnimatedBackground>
        <Header />
        <div className="h-screen flex items-center justify-center">
          <div className="text-white">Loading article...</div>
        </div>
      </AnimatedBackground>
    );
  }

  if (!article) {
    return (
      <AnimatedBackground>
        <Header />
        <div className="container mx-auto px-6 pt-24">
          <p className="text-gray-400">Article not found</p>
          <button onClick={() => navigate('/feed')} className="mt-4 text-purple-400 hover:text-purple-300">
            Back to Feed
          </button>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground mood={article.mood}>
      <Header />
      
      <main className="container mx-auto px-6 pt-24 pb-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Back button */}
          <button
            onClick={() => navigate('/feed')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Feed</span>
          </button>

          {/* Article header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 capitalize">
                {article.category}
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{article.readTime || 5} min read</span>
              </span>
              {article.author && (
                <span className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{article.author}</span>
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center justify-between py-4 border-y border-white/10">
              <div className="text-gray-400">
                <span className="font-semibold text-white">
                  {typeof article.source === 'string' ? article.source : (article.source?.name || 'Source')}
                </span>
                {article.publishedAt && (
                  <span className="ml-2">
                    · {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <Bookmark className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Featured image */}
          {(() => {
            const featuredImage = article.urlToImage || article.image || article.media?.images?.[0]?.src;
            return featuredImage ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative h-96 rounded-2xl overflow-hidden mb-8"
              >
                <img
                  src={featuredImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.display = 'none'; }}
                />
              </motion.div>
            ) : null;
          })()}

          {/* AI Summary */}
          {article.summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20"
            >
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                <span className="text-purple-400">✨</span>
                <span>AI Summary</span>
              </h2>
              <p className="text-gray-300 leading-relaxed">{article.summary}</p>
            </motion.div>
          )}

          {/* Media Gallery - Images */}
          {article.media && article.media.images && article.media.images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Images ({article.media.images.length})</h2>
              <div className={`grid gap-4 ${article.media.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {(() => {
                  const featuredImage = article.urlToImage || article.image || article.media?.images?.[0]?.src;
                  // Try to get video thumbnail if present
                  let videoThumb = null;
                  if (article.media && article.media.videos && article.media.videos.length > 0) {
                    const video = article.media.videos[0];
                    if (video && video.thumbnail) videoThumb = video.thumbnail;
                  }
                  // Filter out both featured image and video thumbnail from gallery
                  const galleryImages = article.media.images.filter(img => {
                    const imgSrc = typeof img === 'string' ? img : img.src;
                    return imgSrc && imgSrc !== featuredImage && imgSrc !== videoThumb;
                  });
                  return galleryImages.slice(0, 8).map((img, idx) => {
                    const imgSrc = typeof img === 'string' ? img : img.src;
                    const imgAlt = typeof img === 'object' ? img.alt : '';
                    return (
                      <div key={idx} className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10">
                        <img
                          src={imgSrc}
                          alt={imgAlt || `Article image ${idx + 1}`}
                          className="w-full h-auto object-cover max-h-96"
                          loading="lazy"
                          onError={(e) => { 
                            console.log('Image failed to load:', imgSrc);
                            e.target.parentElement.style.display = 'none'; 
                          }}
                        />
                        {imgAlt && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2">
                            <p className="text-xs text-gray-300">{imgAlt}</p>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </motion.div>
          )}

          {/* Media Gallery - Videos */}
          {article.media && article.media.videos && article.media.videos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.37 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Videos ({article.media.videos.length})</h2>
              <div className="space-y-4">
                {article.media.videos.slice(0, 4).map((vid, idx) => {
                  console.log('Video data:', vid);
                  const videoSrc = typeof vid === 'string' ? vid : vid.src;
                  const videoKind = typeof vid === 'object' ? vid.kind : 'iframe';
                  console.log('Video src:', videoSrc, 'kind:', videoKind);
                  // Custom video player for direct video files
                  if (videoKind === 'video' && videoSrc) {
                    return (
                      <div key={idx} className="relative rounded-xl overflow-hidden bg-black border border-white/10">
                        <video
                          controls
                          className="w-full h-auto bg-black rounded-xl"
                          src={videoSrc}
                          type={vid.type || 'video/mp4'}
                          preload="metadata"
                          style={{ maxHeight: '480px' }}
                        >
                          Your browser does not support the video tag.
                        </video>
                        {/* Custom controls: playback speed, volume, fullscreen */}
                        <div className="absolute bottom-2 right-2 flex gap-2 items-center bg-black/60 rounded-lg px-3 py-1">
                          <label className="text-xs text-white">Speed
                            <select className="ml-1 bg-gray-800 text-white rounded px-1 py-0.5 text-xs" onChange={e => {
                              const v = e.target.closest('div').previousSibling;
                              if (v && v.tagName === 'VIDEO') v.playbackRate = parseFloat(e.target.value);
                            }}>
                              <option value="0.5">0.5x</option>
                              <option value="0.75">0.75x</option>
                              <option value="1" selected>1x</option>
                              <option value="1.25">1.25x</option>
                              <option value="1.5">1.5x</option>
                              <option value="2">2x</option>
                            </select>
                          </label>
                          <button className="text-xs text-white px-2 py-1 rounded bg-purple-600/80 hover:bg-purple-700" onClick={e => {
                            const v = e.target.closest('div').previousSibling;
                            if (v && v.tagName === 'VIDEO') {
                              if (v.requestFullscreen) v.requestFullscreen();
                              else if (v.webkitRequestFullscreen) v.webkitRequestFullscreen();
                            }
                          }}>Fullscreen</button>
                        </div>
                      </div>
                    );
                  }
                  // Iframe videos (YouTube/Vimeo)
                  if (videoKind === 'iframe' && videoSrc) {
                    // Try to show a preview thumbnail for YouTube/Vimeo
                    let thumb = null;
                    let videoId = null;
                    console.log('Processing iframe video:', videoSrc);
                    
                    if (/youtube\.com|youtu\.be/.test(videoSrc)) {
                      const match = videoSrc.match(/embed\/([\w-]{11})/);
                      if (match) {
                        videoId = match[1];
                        thumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                        console.log('YouTube thumbnail:', thumb);
                      }
                    } else if (/vimeo\.com/.test(videoSrc)) {
                      const match = videoSrc.match(/video\/([0-9]+)/);
                      if (match) {
                        videoId = match[1];
                        thumb = `https://vumbnail.com/${videoId}.jpg`;
                        console.log('Vimeo thumbnail:', thumb);
                      }
                    }
                    // Fallback image if no thumb
                    const fallbackImg = article.urlToImage || article.image || (article.media?.images?.[0]?.src);
                    const displayThumb = thumb || fallbackImg;
                    console.log('Display thumbnail:', displayThumb);
                    
                    return (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-white/10 bg-gray-900" style={{ minHeight: '450px' }}>
                        {/* Debug info */}
                        <div className="absolute top-0 left-0 bg-red-600 text-white text-xs p-2 z-50">
                          DEBUG: {thumb ? 'Has thumb' : 'No thumb'} | {fallbackImg ? 'Has fallback' : 'No fallback'}
                        </div>
                        
                        {/* Video thumbnail */}
                        {displayThumb ? (
                          <img 
                            src={displayThumb} 
                            alt="Video preview" 
                            className="w-full h-full object-cover"
                            style={{ minHeight: '450px' }}
                            onLoad={() => console.log('Thumbnail loaded:', displayThumb)}
                            onError={(e) => {
                              console.log('Thumbnail failed to load:', displayThumb);
                              if (fallbackImg && e.target.src !== fallbackImg) {
                                console.log('Trying fallback:', fallbackImg);
                                e.target.src = fallbackImg;
                              } else {
                                console.log('All thumbnails failed, hiding image');
                                e.target.style.display = 'none';
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800" style={{ minHeight: '450px' }}>
                            <div className="text-white text-center">
                              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" className="mx-auto mb-4">
                                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                                <line x1="7" y1="2" x2="7" y2="22"></line>
                                <line x1="17" y1="2" x2="17" y2="22"></line>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                              </svg>
                              <p className="text-sm">No thumbnail available</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Large clickable play button overlay */}
                        <a 
                          href={videoSrc} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center group cursor-pointer bg-black/30 hover:bg-black/20 transition-all"
                        >
                          <div className="bg-red-600 group-hover:bg-red-700 rounded-full p-8 shadow-2xl transition-all transform group-hover:scale-110">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="white" stroke="none">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </div>
                        </a>
                        
                        {/* Video label */}
                        <div className="absolute top-4 left-4 px-3 py-1 rounded bg-red-600 text-white text-xs font-bold">
                          VIDEO
                        </div>
                        
                        {/* Open in YouTube/Vimeo button */}
                        <a 
                          href={videoSrc} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg bg-purple-600 text-white text-base font-semibold hover:bg-purple-700 shadow-lg transition-all z-20"
                        >
                          Watch on YouTube
                        </a>
                      </div>
                    );
                  }
                  // Unknown type fallback
                  return (
                    <div key={idx} className="relative rounded-xl overflow-hidden bg-black border border-white/10 flex items-center justify-center min-h-[240px]">
                      <span className="text-white text-xs">Video format not supported</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Full Article Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="prose prose-invert prose-lg max-w-none mb-8"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Full Article</h2>
            <div className="text-gray-300 leading-relaxed text-lg space-y-6">
              {article.contentHtml ? (
                <>
                  <div 
                    className="article-content"
                    dangerouslySetInnerHTML={{ __html: article.contentHtml }}
                    style={{
                      lineHeight: '1.8',
                      fontSize: '1.125rem'
                    }}
                  />
                  {article.contentHtml.length < 500 && (
                    <div className="mt-8 p-4 bg-purple-600/10 border border-purple-500/20 rounded-xl">
                      <p className="text-gray-400 text-base">
                        💡 This is the content available from the feed. For the complete article with images and interactive elements, visit the source below.
                      </p>
                    </div>
                  )}
                </>
              ) : article.content ? (
                <>
                  {article.content.split('\n\n').filter(p => p.trim()).map((paragraph, idx) => (
                    <p key={idx} className="mb-4 leading-8">{paragraph.trim()}</p>
                  ))}
                  {article.content.length < 500 && (
                    <div className="mt-8 p-4 bg-purple-600/10 border border-purple-500/20 rounded-xl">
                      <p className="text-gray-400 text-base">
                        💡 This is the content available from the feed. For the complete article with images and interactive elements, visit the source below.
                      </p>
                    </div>
                  )}
                </>
              ) : article.description ? (
                <>
                  <p className="leading-8">{article.description}</p>
                  <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-gray-400 text-base">
                      📰 This is a preview. Read the complete article at the source for the full story and additional content.
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-gray-400 text-base">
                    Full article content is available at the source. Click the button below to continue reading.
                  </p>
                </div>
              )}
            </div>
          </motion.article>

          {/* Tilt debate embed (auto-generation mode) */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-white mb-4">Debate this article</h2>
            <p className="text-gray-400 mb-4">
              Join the discussion. The widget below creates a debate automatically from this page's context.
            </p>
            <TiltEmbed apiKey="tilt_N61DPyzbaYJOIDAO2z-3VN-UZA2TzWpt3WOXrAoIE_4" theme="midnight" />
          </div>

          {/* Read more at source button */}
          {article.url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/40 transition-all"
              >
                <span>Read Full Article at Source</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          )}

          {/* Source attribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <p className="text-gray-400 text-sm">
              This article was originally published by{' '}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                {typeof article.source === 'string' ? article.source : (article.source?.name || 'Source')}
              </a>
            </p>
          </motion.div>
        </motion.div>
      </main>
    </AnimatedBackground>
  );
};

export default ArticlePage;
