const { GoogleGenerativeAI } = require('@google/generative-ai');
const Parser = require('rss-parser');
const sanitizeHtml = require('sanitize-html');

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const rssParser = new Parser({
  customFields: {
    item: [
      'content:encoded',
      'media:content',
      'media:thumbnail',
      'media:group',
      'media:player',
    ]
  }
});

const RSS_FEEDS = {
  breaking: [
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    'https://www.theguardian.com/world/rss',
    'https://moxie.foxnews.com/google-publisher/latest.xml',
    'https://feeds.reuters.com/reuters/topNews',
    'http://rss.cnn.com/rss/cnn_topstories.rss',
    'https://www.aljazeera.com/xml/rss/all.xml',
    'https://feeds.washingtonpost.com/rss/national',
    'https://feeds.nbcnews.com/nbcnews/public/news',
    'https://www.cbsnews.com/latest/rss/main',
    'https://feeds.abcnews.com/abcnews/topstories',
  ],
  politics: [
    'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
    'https://www.theguardian.com/politics/rss',
    'https://moxie.foxnews.com/google-publisher/politics.xml',
    'http://rss.cnn.com/rss/cnn_allpolitics.rss',
    'https://feeds.washingtonpost.com/rss/politics',
    'https://thehill.com/feed/',
    'https://www.politico.com/rss/politics08.xml',
  ],
  health: [
    'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
    'https://www.theguardian.com/society/health/rss',
    'http://rss.cnn.com/rss/cnn_health.rss',
    'https://feeds.washingtonpost.com/rss/health',
    'https://www.cbsnews.com/latest/rss/health',
  ],
  science: [
    'https://www.sciencedaily.com/rss/all.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml',
    'http://rss.cnn.com/rss/cnn_tech.rss',
    'https://www.wired.com/feed/rss',
    'https://www.theverge.com/rss/index.xml',
    'https://feeds.arstechnica.com/arstechnica/index',
  ],
  world: [
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    'https://www.aljazeera.com/xml/rss/all.xml',
    'https://feeds.reuters.com/Reuters/worldNews',
    'https://www.theguardian.com/world/rss',
    'https://feeds.washingtonpost.com/rss/world',
    'https://feeds.abcnews.com/abcnews/internationalheadlines',
  ],
  business: [
    'https://feeds.bbci.co.uk/news/business/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
    'https://feeds.reuters.com/reuters/businessNews',
    'https://www.theguardian.com/uk/business/rss',
    'https://feeds.washingtonpost.com/rss/business',
    'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    'https://feeds.bloomberg.com/markets/news.rss',
  ],
};

// Regional feeds for higher geo-specific relevance
const REGIONAL_FEEDS = {
  india: [
    'https://www.thehindu.com/news/national/feeder/default.rss',
    'https://www.hindustantimes.com/rss/india/rssfeed.xml',
    'https://indianexpress.com/section/india/feed/',
    'https://feeds.feedburner.com/ndtvnews-india-news',
    'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms'
  ],
  pakistan: [
    'https://www.dawn.com/feed',
    'https://www.thenews.com.pk/rss/1/1',
    'https://tribune.com.pk/rss/latest.xml',
    'https://feeds.feedburner.com/GeoPakistan'
  ]
};

const stripHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>(?=\s*\n?)/gi, '\n\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

// Try to build an embeddable URL for popular video hosts
function toEmbedFromUrl(url) {
  try {
    if (!url) return null;
    const u = new URL(url.startsWith('//') ? `https:${url}` : url);
    const host = u.hostname.replace(/^www\./, '');
    // YouTube
    if (host.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      if (id) return { kind: 'iframe', src: `https://www.youtube.com/embed/${id}` };
    }
    if (host === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id) return { kind: 'iframe', src: `https://www.youtube.com/embed/${id}` };
    }
    // Vimeo
    if (host.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id && /\d+/.test(id)) return { kind: 'iframe', src: `https://player.vimeo.com/video/${id}` };
    }
    // Direct MP4/WEBM
    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(u.pathname)) {
      return { kind: 'video', src: u.toString(), type: `video/${u.pathname.split('.').pop().toLowerCase()}` };
    }
  } catch {}
  return null;
}

const extractMediaFromHtml = (html) => {
  const images = [];
  const videos = [];
  if (!html) return { images, videos };
  try {
    const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      images.push({ src: match[1], alt: '' });
    }
    // iframes (often YouTube/Vimeo or publisher players)
    const iframeRegex = /<iframe[^>]*src=["']([^"']+)["'][^>]*>/gi;
    while ((match = iframeRegex.exec(html)) !== null) {
      videos.push({ kind: 'iframe', src: match[1] });
    }
    // <video> tags
    const videoSrcRegex = /<video[^>]*src=["']([^"']+)["'][^>]*>/gi;
    while ((match = videoSrcRegex.exec(html)) !== null) {
      const emb = toEmbedFromUrl(match[1]);
      if (emb) videos.push(emb);
      else videos.push({ kind: 'video', src: match[1] });
    }
    // <source> inside <video>
    const sourceRegex = /<source[^>]*src=["']([^"']+)["'][^>]*>/gi;
    while ((match = sourceRegex.exec(html)) !== null) {
      const emb = toEmbedFromUrl(match[1]);
      if (emb) videos.push(emb);
      else videos.push({ kind: 'video', src: match[1] });
    }
    // Plain links to YouTube/Vimeo
    const linkRegex = /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=([\w-]{6,})|youtu\.be\/([\w-]{6,})|vimeo\.com\/(\d+))/gi;
    let m;
    while ((m = linkRegex.exec(html)) !== null) {
      const full = m[0];
      const emb = toEmbedFromUrl(full);
      if (emb) videos.push(emb);
    }

    // JSON-LD VideoObject parsing
    const jsonLdRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let jmatch;
    while ((jmatch = jsonLdRegex.exec(html)) !== null) {
      try {
        const json = JSON.parse(jmatch[1].trim());
        const arr = Array.isArray(json) ? json : [json];
        arr.forEach(obj => {
          if (!obj || typeof obj !== 'object') return;
          if ((obj['@type'] === 'VideoObject') || (Array.isArray(obj['@type']) && obj['@type'].includes('VideoObject'))) {
            const vurl = obj.embedUrl || obj.contentUrl || obj.url;
            const emb = toEmbedFromUrl(vurl) || (vurl ? { kind: 'iframe', src: vurl } : null);
            if (emb) {
              // attach thumbnail if present
              const t = Array.isArray(obj.thumbnailUrl) ? obj.thumbnailUrl[0] : obj.thumbnailUrl;
              if (t) emb.thumbnail = t;
              videos.push(emb);
            }
            if (obj.thumbnailUrl) {
              const thumbs = Array.isArray(obj.thumbnailUrl) ? obj.thumbnailUrl : [obj.thumbnailUrl];
              thumbs.forEach(u => u && images.push({ src: u }));
            }
          }
        });
      } catch {}
    }
  } catch {}
  return { images, videos };
};

// Helper to probe URL-like values from various shapes
function getUrlish(v) {
  if (!v) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    return (
      v.url || v.href || v.src || v.link ||
      (v.$ && (v.$.url || v.$.href || v.$.src)) ||
      v['@_url'] || v['@_href'] || v['@_src'] ||
      null
    );
  }
  return null;
}

async function fetchFromRSS(category = 'breaking', retries = 2) {
  const feeds = RSS_FEEDS[category] || RSS_FEEDS.breaking;
  const failedFeeds = [];

  // PARALLEL PROCESSING: Fetch all feeds concurrently for 5x speed boost!
  const feedPromises = feeds.map(async (feedUrl) => {
    let attempts = 0;
    let success = false;
    
    while (attempts <= retries && !success) {
      try {
        const feed = await Promise.race([
          rssParser.parseURL(feedUrl),
          new Promise((_, reject) => setTimeout(() => reject(new Error('RSS timeout')), 8000))
        ]);
        
        const articles = feed.items.slice(0, 30).map((item) => {
        let fullContent = item['content:encoded'] || item.content || item.summary || item.description || '';
        
        // Extract media BEFORE sanitizing to preserve img/iframe tags
        const { images: htmlImages, videos: htmlVideos } = extractMediaFromHtml(fullContent);
        const images = [...htmlImages];
        const videos = [...htmlVideos];
        // Enclosure video support
        if (item.enclosure?.url && /video/i.test(item.enclosure.type || '')) {
          videos.push({ kind: 'video', src: item.enclosure.url, type: item.enclosure.type });
        }
        // Enclosure image support
        if (item.enclosure?.url && /image/i.test(item.enclosure.type || '')) {
          images.push({ src: item.enclosure.url });
        }
        // media:content variants from RSS
        const mediaContent = item['media:content'] || item['media:group']?.['media:content'];
        const mcArr = Array.isArray(mediaContent) ? mediaContent : (mediaContent ? [mediaContent] : []);
        mcArr.forEach(mc => {
          const url = getUrlish(mc);
          const type = (typeof mc === 'object') ? (mc.type || mc.medium) : '';
          if (url && (/video/i.test(type || '') || /\.(mp4|webm|ogg)(\?.*)?$/i.test(url))) {
            videos.push({ kind: 'video', src: url, type: type?.startsWith('video/') ? type : undefined });
          } else if (url && (/image/i.test(type || '') || /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url))) {
            images.push({ src: url });
          } else if (url) {
            const emb = toEmbedFromUrl(url);
            if (emb) videos.push(emb);
          }
        });
        // media:thumbnail
        const thumbUrl = getUrlish(item['media:thumbnail']) || getUrlish(item['media:group']?.['media:thumbnail']);
        if (thumbUrl) images.push({ src: thumbUrl });
        
        // Now sanitize for display (preserve safe formatting and media)
        const contentHtml = fullContent ? sanitizeHtml(fullContent, {
          allowedTags: [
            'p','br','em','strong','b','i','u','a','ul','ol','li','blockquote',
            'img','figure','figcaption','h1','h2','h3','h4','pre','code','span','div','iframe'
          ],
          allowedAttributes: {
            a: ['href','name','target','rel'],
            img: ['src','alt','title','width','height','srcset','sizes','loading'],
            iframe: ['src','width','height','allow','allowfullscreen','frameborder','title'],
            '*': ['style']
          },
          allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
          transformTags: {
            a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' })
          }
        }) : '';
        const cleanContent = stripHtml(fullContent);

        return {
          title: item.title,
          description: item.contentSnippet || stripHtml(item.description) || '',
          url: item.link,
          urlToImage: (/image/i.test(item.enclosure?.type || '') ? item.enclosure?.url : '') || images[0]?.src || item.enclosure?.url || '',
          source: { name: feed.title || 'RSS Feed' },
          publishedAt: item.pubDate || new Date().toISOString(),
          content: cleanContent || item.contentSnippet || '',
          contentHtml,
          media: { images, videos },
        };
      });
      success = true;
      return articles;
    } catch (e) {
      attempts++;
      console.error(`RSS error for ${feedUrl} (attempt ${attempts}/${retries + 1}):`, e.message);
      if (attempts > retries) {
        failedFeeds.push(feedUrl);
        return [];
      } else {
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 500 * attempts));
      }
    }
    }
    return [];
  });

  // Wait for all feeds to complete in parallel
  const results = await Promise.all(feedPromises);
  const allArticles = results.flat();
  
  if (failedFeeds.length > 0) {
    console.warn(`Failed to fetch from ${failedFeeds.length} feeds:`, failedFeeds);
  }
  
  // If no articles were fetched, return cached or mock data to prevent empty responses
  if (allArticles.length === 0) {
    console.warn('No articles fetched from any RSS feed, returning fallback');
    return getFallbackArticles(category);
  }
  
  return allArticles;
}

// Fallback articles when RSS feeds fail
function getFallbackArticles(category) {
  const now = new Date().toISOString();
  return [
    {
      title: 'News Feed Temporarily Unavailable',
      description: 'We are experiencing technical difficulties fetching the latest news. Please try again in a few moments.',
      url: '#',
      urlToImage: '',
      source: { name: 'System' },
      publishedAt: now,
      content: 'The news feed is temporarily unavailable. This could be due to network issues or RSS feed downtime.',
      contentHtml: '<p>The news feed is temporarily unavailable. This could be due to network issues or RSS feed downtime.</p>',
      media: { images: [], videos: [] },
    }
  ];
}

// Fetch from an explicit list of feed URLs (used for regional/grouped feeds)
async function fetchFromFeeds(feedUrls = []) {
  const allArticles = [];
  for (const feedUrl of feedUrls) {
    try {
      const feed = await rssParser.parseURL(feedUrl);
      const articles = feed.items.slice(0, 30).map((item) => {
        let fullContent = item['content:encoded'] || item.content || item.summary || item.description || '';
        
        // Extract media BEFORE sanitizing to preserve img/iframe tags
        const { images: htmlImages, videos: htmlVideos } = extractMediaFromHtml(fullContent);
        const images = [...htmlImages];
        const videos = [...htmlVideos];
        if (item.enclosure?.url && /video/i.test(item.enclosure.type || '')) {
          videos.push({ kind: 'video', src: item.enclosure.url, type: item.enclosure.type });
        }
        if (item.enclosure?.url && /image/i.test(item.enclosure.type || '')) {
          images.push({ src: item.enclosure.url });
        }
        const mediaContent = item['media:content'] || item['media:group']?.['media:content'];
        const mcArr = Array.isArray(mediaContent) ? mediaContent : (mediaContent ? [mediaContent] : []);
        mcArr.forEach(mc => {
          const url = getUrlish(mc);
          const type = (typeof mc === 'object') ? (mc.type || mc.medium) : '';
          if (url && (/video/i.test(type || '') || /\.(mp4|webm|ogg)(\?.*)?$/i.test(url))) {
            videos.push({ kind: 'video', src: url, type: type?.startsWith('video/') ? type : undefined });
          } else if (url && (/image/i.test(type || '') || /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url))) {
            images.push({ src: url });
          } else if (url) {
            const emb = toEmbedFromUrl(url);
            if (emb) videos.push(emb);
          }
        });
        const thumbUrl2 = getUrlish(item['media:thumbnail']) || getUrlish(item['media:group']?.['media:thumbnail']);
        if (thumbUrl2) images.push({ src: thumbUrl2 });
        
        // Now sanitize for display (preserve safe formatting and media)
        const contentHtml = fullContent ? sanitizeHtml(fullContent, {
          allowedTags: [
            'p','br','em','strong','b','i','u','a','ul','ol','li','blockquote',
            'img','figure','figcaption','h1','h2','h3','h4','pre','code','span','div','iframe'
          ],
          allowedAttributes: {
            a: ['href','name','target','rel'],
            img: ['src','alt','title','width','height','srcset','sizes','loading'],
            iframe: ['src','width','height','allow','allowfullscreen','frameborder','title'],
            '*': ['style']
          },
          allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
          transformTags: {
            a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' })
          }
        }) : '';
        const cleanContent = stripHtml(fullContent);

        return {
          title: item.title,
          description: item.contentSnippet || stripHtml(item.description) || '',
          url: item.link,
          urlToImage: (/image/i.test(item.enclosure?.type || '') ? item.enclosure?.url : '') || images[0]?.src || item.enclosure?.url || '',
          source: { name: feed.title || 'RSS Feed' },
          publishedAt: item.pubDate || new Date().toISOString(),
          content: cleanContent || item.contentSnippet || '',
          contentHtml,
          media: { images, videos },
        };
      });
      allArticles.push(...articles);
    } catch (e) {
      console.error(`RSS error for ${feedUrl}:`, e.message);
    }
  }
  return allArticles;
}

async function summarizeWithAI(text, maxLength = 300, retries = 2) {
  if (!genAI || !text) {
    // Better fallback: extract first few sentences intelligently
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    let summary = '';
    for (const sent of sentences) {
      if ((summary + sent).length > maxLength) break;
      summary += sent;
    }
    return summary || text.slice(0, maxLength);
  }
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Write a comprehensive 3-4 sentence summary of this news article. Include key facts, people involved, and why it matters. Keep it under ${maxLength} characters:\n\n${text.slice(0, 2000)}`;
      
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), 10000))
      ]);
      
      const summary = result.response.text().trim();
      return summary.length > maxLength ? summary.slice(0, maxLength - 3) + '...' : summary;
    } catch (error) {
      console.error(`AI summarize error (attempt ${attempt + 1}/${retries + 1}):`, error.message);
      if (attempt === retries) {
        // Better fallback: extract first few sentences
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        let summary = '';
        for (const sent of sentences) {
          if ((summary + sent).length > maxLength) break;
          summary += sent;
        }
        return summary || text.slice(0, maxLength);
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  return text.slice(0, maxLength);
}

async function detectCategory(title, description, retries = 1) {
  if (!genAI) return 'general';
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Categorize this news article into ONE of these: politics, health, science, technology, business, world, sports. Title: ${title}. Description: ${description}. Return ONLY the category name.`;
      
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), 8000))
      ]);
      
      const cat = result.response.text().trim().toLowerCase();
      return ['politics', 'health', 'science', 'technology', 'business', 'world', 'sports'].includes(cat) ? cat : 'general';
    } catch (error) {
      console.error(`AI category error (attempt ${attempt + 1}/${retries + 1}):`, error.message);
      if (attempt === retries) {
        return 'general';
      }
      await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  return 'general';
}

function inferLean(source) {
  const leftSources = ['cnn', 'msnbc', 'huffpost', 'guardian', 'nytimes'];
  const rightSources = ['fox', 'breitbart', 'newsmax', 'dailycaller'];
  const lowerSource = source.toLowerCase();
  if (leftSources.some(s => lowerSource.includes(s))) return 'left';
  if (rightSources.some(s => lowerSource.includes(s))) return 'right';
  return 'center';
}

// Expanded source bias map (-2 strong left, -1 lean left, 0 center, 1 lean right, 2 strong right)
const SOURCE_BIAS = new Map([
  // Strong left
  ['jacobin', -2], ['mother jones', -2], ['the nation', -2],
  // Lean left
  ['nytimes', -1], ['new york times', -1], ['guardian', -1], ['washington post', -1], ['vox', -1], ['msnbc', -1], ['huffpost', -1],
  // Center
  ['reuters', 0], ['ap news', 0], ['associated press', 0], ['bbc', 0], ['npr', 0],
  // Lean right
  ['wall street journal', 1], ['wsj', 1], ['financial times', 1], ['the economist', 1], ['telegraph', 1], ['new york post', 1],
  // Strong right
  ['fox', 2], ['breitbart', 2], ['newsmax', 2], ['daily caller', 2], ['dailywire', 2]
]);

const RIGHT_KEYWORDS = [
  'border security','illegal immigration','build the wall','second amendment','pro-life','anti-abortion','tax cuts','deregulation','small government','law and order','back the blue','strong on crime','woke','critical race theory','energy independence','drill baby drill','lower taxes','free market','fiscal conservative','school choice','voter id','election integrity'
];
const LEFT_KEYWORDS = [
  'climate crisis','renewable energy','reproductive rights','abortion rights','gun control','common sense gun laws','universal healthcare','medicare for all','living wage','labor union','wealth tax','racial justice','police reform','criminal justice reform','student debt relief','paid family leave','voting rights','lgbtq rights','trans rights','equity','dei'
];

const RIGHT_ENTITIES = ['republican','gop','conservative','trump','desantis','mccarthy','mitch mcconnell','ted cruz'];
const LEFT_ENTITIES = ['democrat','progressive','biden','harris','pelosi','schumer','ocasio-cortez','aoc','bernie sanders'];

function negated(text, idx, window = 5) {
  // crude negation: look back a few tokens for negators
  const tokens = text.toLowerCase().split(/\s+/);
  const start = Math.max(0, idx - window);
  const slice = tokens.slice(start, idx).join(' ');
  return /(not|isn\'t|wasn\'t|aren\'t|no|without|lack of|criticize|condemn|oppose|against)/.test(slice);
}

function scoreLean(text = '', source = '', url = '') {
  const reasons = [];
  let score = 0; // negative left, positive right

  // Source/domain weighting
  const src = (source || '').toLowerCase();
  let sourceKey = '';
  for (const key of SOURCE_BIAS.keys()) {
    if (src.includes(key)) { sourceKey = key; break; }
  }
  if (!sourceKey && url) {
    try {
      const host = new URL(url).hostname.replace(/^www\./,'');
      const hostKey = Array.from(SOURCE_BIAS.keys()).find(k => host.includes(k.replace(/\s+/g,'')));
      if (hostKey) sourceKey = hostKey;
    } catch {}
  }
  if (sourceKey) {
    const s = SOURCE_BIAS.get(sourceKey) || 0;
    score += s * 1.0; // modest weight for source
    reasons.push(`Source bias: ${sourceKey} (${s})`);
  }

  const lower = (text || '').toLowerCase();
  const tokens = lower.split(/\s+/);

  // Keyword scoring
  RIGHT_KEYWORDS.forEach(kw => {
    if (lower.includes(kw)) {
      // Find first occurrence for negation check
      const firstWord = kw.split(' ')[0];
      const idx = tokens.indexOf(firstWord);
      if (idx >= 0 && !negated(lower, idx)) {
        score += 0.8;
        reasons.push(`Right keyword: ${kw}`);
      }
    }
  });
  LEFT_KEYWORDS.forEach(kw => {
    if (lower.includes(kw)) {
      const firstWord = kw.split(' ')[0];
      const idx = tokens.indexOf(firstWord);
      if (idx >= 0 && !negated(lower, idx)) {
        score -= 0.8;
        reasons.push(`Left keyword: ${kw}`);
      }
    }
  });

  // Entity hints (lighter weight)
  RIGHT_ENTITIES.forEach(n => { if (lower.includes(n)) { score += 0.3; reasons.push(`Right entity: ${n}`); } });
  LEFT_ENTITIES.forEach(n => { if (lower.includes(n)) { score -= 0.3; reasons.push(`Left entity: ${n}`); } });

  // Clamp and label
  if (score > 3) score = 3;
  if (score < -3) score = -3;
  const norm = score / 3; // -1..1
  let label = 'center';
  if (norm <= -0.66) label = 'left';
  else if (norm < -0.2) label = 'lean-left';
  else if (norm > 0.66) label = 'right';
  else if (norm > 0.2) label = 'lean-right';

  return { score: Number(norm.toFixed(3)), label, reasons };
}

// AI-enhanced political lean detection with better accuracy
async function detectPoliticalLeanAI(title, description, content) {
  if (!genAI) {
    // Fallback to keyword-based if no AI
    return scoreLean(`${title} ${description} ${content}`);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const text = `${title}\n${description}\n${content || ''}`.slice(0, 1500);
    
    const prompt = `Analyze the political lean of this news article. Consider:
- Source credibility and known bias
- Language and framing choices
- Which political party/ideology it favors
- Keywords and talking points used

Article:
${text}

Respond with ONLY a JSON object in this format:
{
  "lean": "left" | "lean-left" | "center" | "lean-right" | "right",
  "score": -1.0 to 1.0 (negative=left, positive=right),
  "confidence": 0.0 to 1.0,
  "reasoning": "brief explanation"
}`;

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), 8000))
    ]);
    
    const responseText = result.response.text().trim();
    // Extract JSON from markdown code blocks if present
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        label: parsed.lean || 'center',
        score: parsed.score || 0,
        confidence: parsed.confidence || 0.5,
        reasons: [parsed.reasoning || 'AI analysis']
      };
    }
  } catch (error) {
    console.error('AI political lean detection failed:', error.message);
  }
  
  // Fallback to keyword-based
  return scoreLean(`${title} ${description} ${content}`);
}

// SMART DEDUPLICATION: Remove duplicate articles across sources
function deduplicateArticles(articles) {
  const seen = new Map();
  const unique = [];
  
  for (const article of articles) {
    // Create fingerprint from title (normalized)
    const titleKey = article.title.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 50); // First 50 chars for fuzzy matching
    
    if (!seen.has(titleKey)) {
      seen.set(titleKey, true);
      unique.push(article);
    } else {
      // Duplicate found - merge media if the duplicate has more content
      const existing = unique.find(a => {
        const existingKey = a.title.toLowerCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 50);
        return existingKey === titleKey;
      });
      
      if (existing && article.media) {
        // Merge videos and images from duplicate
        if (article.media.videos && article.media.videos.length > 0) {
          existing.media = existing.media || { images: [], videos: [] };
          existing.media.videos = [...(existing.media.videos || []), ...article.media.videos]
            .filter((v, i, arr) => arr.findIndex(x => x.src === v.src) === i);
        }
        if (article.media.images && article.media.images.length > 0) {
          existing.media = existing.media || { images: [], videos: [] };
          existing.media.images = [...(existing.media.images || []), ...article.media.images]
            .filter((img, i, arr) => {
              const src = typeof img === 'string' ? img : img.src;
              return arr.findIndex(x => (typeof x === 'string' ? x : x.src) === src) === i;
            });
        }
      }
    }
  }
  
  return unique;
}

// AI-POWERED TRENDING TOPICS: Analyze articles to find emerging stories
async function detectTrendingTopics(articles, topN = 10) {
  if (!articles || articles.length === 0) return [];
  
  // Fast keyword extraction
  const wordCounts = new Map();
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too', 'very', 'said', 'says', 'new', 'news', 'just', 'after', 'about', 'also', 'into', 'over', 'out']);
  
  // Extract keywords from titles and descriptions
  articles.forEach(article => {
    const text = `${article.title} ${article.description || ''}`.toLowerCase();
    const words = text.match(/\b[a-z]{4,}\b/g) || [];
    
    words.forEach(word => {
      if (!stopWords.has(word)) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    });
  });
  
  // Get top trending words
  const trending = Array.from(wordCounts.entries())
    .filter(([word, count]) => count >= 3) // Must appear in at least 3 articles
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ topic: word, mentions: count, trending: true }));
  
  return trending;
}

module.exports = {
  genAI,
  rssParser,
  fetchFromRSS,
  fetchFromFeeds,
  summarizeWithAI,
  detectCategory,
  inferLean,
  scoreLean,
  detectPoliticalLeanAI,
  stripHtml,
  REGIONAL_FEEDS,
  toEmbedFromUrl,
  extractMediaFromHtml,
  deduplicateArticles,
  detectTrendingTopics,
};
