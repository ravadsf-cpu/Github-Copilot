const express = require('express');
const cors = require('cors');
// Load env from .env.local (preferred) falling back to .env
try {
  const path = require('path');
  const dotenv = require('dotenv');
  const localEnvPath = path.resolve(__dirname, '../.env.local');
  const defaultEnvPath = path.resolve(__dirname, '../.env');
  // Try .env.local first
  const localResult = dotenv.config({ path: localEnvPath });
  if (localResult.error) {
    // Fallback to .env
    dotenv.config({ path: defaultEnvPath });
  }
} catch {}
const fetch = require('node-fetch');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Parser = require('rss-parser');
const sanitizeHtml = require('sanitize-html');
// Google APIs (added for Gmail & OAuth integration)
const { google } = require('googleapis');

const PORT = process.env.PORT || 5001;
const app = express();

app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const rssParser = new Parser();

// Mock articles imported locally (keep backend independent of frontend build)
const mockArticles = [
  {
    id: 1,
    title: 'Breakthrough in Renewable Energy Storage',
    summary:
      'Scientists develop new battery technology that could revolutionize solar and wind energy storage, making renewable energy more viable than ever.',
    mood: 'hopeful',
    category: 'technology',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
    readTime: 5,
    source: 'Tech Daily',
    timestamp: Date.now() - 3600000,
  },
  {
    id: 2,
    title: 'Global Markets React to Economic Uncertainty',
    summary:
      'Stock markets worldwide show volatility as investors navigate changing economic conditions and policy shifts.',
    mood: 'concerning',
    category: 'business',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    readTime: 4,
    source: 'Financial Times',
    timestamp: Date.now() - 7200000,
  },
  {
    id: 3,
    title: 'AI Helps Doctors Detect Diseases Earlier',
    summary:
      'New artificial intelligence system shows remarkable accuracy in early disease detection, potentially saving countless lives.',
    mood: 'inspiring',
    category: 'health',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    readTime: 6,
    source: 'Medical News',
    timestamp: Date.now() - 10800000,
  },
  {
    id: 4,
    title: 'Climate Summit Ends with Mixed Results',
    summary:
      'World leaders conclude major climate conference with some agreements reached, but activists say more action is needed.',
    mood: 'mixed',
    category: 'world',
    image: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b4?w=800',
    readTime: 7,
    source: 'World Report',
    timestamp: Date.now() - 14400000,
  },
];

function summarize(text, max = 160) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max - 3) + '...' : text;
}

// RSS Feeds for free news (no API key needed)
const RSS_FEEDS = {
  breaking: [
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    'https://www.theguardian.com/world/rss',
    'https://moxie.foxnews.com/google-publisher/latest.xml',
    'https://feeds.reuters.com/reuters/topNews',
    'https://feeds.reuters.com/reuters/breakingviews',
    'http://rss.cnn.com/rss/cnn_topstories.rss',
    'http://rss.cnn.com/rss/cnn_latest.rss',
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://www.theguardian.com/uk-news/rss',
    'https://feeds.washingtonpost.com/rss/world',
    'https://feeds.washingtonpost.com/rss/national',
    'http://rss.cnn.com/rss/cnn_us.rss',
    'https://www.aljazeera.com/xml/rss/all.xml',
  ],
  economy: [
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://www.ft.com/?format=rss',
    'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
    'https://moxie.foxnews.com/google-publisher/economy.xml',
    'http://rss.cnn.com/rss/money_latest.rss',
  ],
  war: [
    'https://www.theguardian.com/world/rss',
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    'http://rss.cnn.com/rss/cnn_world.rss',
  ],
  politics: [
    'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
    'https://www.theguardian.com/politics/rss',
    'https://moxie.foxnews.com/google-publisher/politics.xml',
    'https://feeds.bbci.co.uk/news/politics/rss.xml',
    'http://rss.cnn.com/rss/cnn_allpolitics.rss',
  ],
  health: [
    'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
    'https://www.theguardian.com/society/health/rss',
    'https://feeds.bbci.co.uk/news/health/rss.xml',
    'http://rss.cnn.com/rss/cnn_health.rss',
  ],
  science: [
    'https://www.sciencedaily.com/rss/all.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml',
    'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
    'http://rss.cnn.com/rss/cnn_tech.rss',
  ],
};

async function fetchFromRSS(category = 'breaking') {
  const feeds = RSS_FEEDS[category] || RSS_FEEDS.breaking;
  const allArticles = [];

  // Helpers: strip text, extract media, and sanitize HTML
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

  const extractMediaFromHtml = (html) => {
    const images = [];
    const videos = [];
    if (!html) return { images, videos };
    try {
      // Images
      const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*alt=["']?([^"']*)["']?[^>]*>/gi;
      const imgRegexNoAlt = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
      let match;
      while ((match = imgRegex.exec(html)) !== null) {
        images.push({ src: match[1], alt: match[2] || '' });
      }
      if (images.length === 0) {
        while ((match = imgRegexNoAlt.exec(html)) !== null) {
          images.push({ src: match[1], alt: '' });
        }
      }
      // Iframes (YouTube/Vimeo/CNN/Brightcove etc.) - support both with and without explicit closing tag
      const iframeRegex = /<iframe[^>]*src=["']([^"']+)["'][^>]*>(?:<\/iframe>)?/gi;
      while ((match = iframeRegex.exec(html)) !== null) {
        videos.push({ kind: 'iframe', src: match[1] });
      }
      // Video sources
      const videoSrcRegex = /<source[^>]*src=["']([^"']+)["'][^>]*type=["']([^"']+)["'][^>]*>/gi;
      while ((match = videoSrcRegex.exec(html)) !== null) {
        videos.push({ kind: 'video', src: match[1], type: match[2] });
      }
    } catch {}
    return { images, videos };
  };

  const sanitizeOptions = {
    allowedTags: [
      'p','br','strong','em','ul','ol','li','blockquote','a','img','figure','figcaption',
      'video','source','iframe','h1','h2','h3','h4','h5','h6','table','thead','tbody','tr','th','td','span','div'
    ],
    allowedAttributes: {
      a: ['href','name','target','rel'],
      img: ['src','alt','srcset','sizes','title','loading'],
      video: ['src','poster','controls','autoplay','muted','loop','playsinline'],
      source: ['src','type'],
      iframe: ['src','width','height','allow','allowfullscreen','frameborder','title'],
      '*': ['class','style']
    },
    allowedIframeHostnames: [
      'www.youtube.com','youtube.com','www.youtube-nocookie.com',
      'player.vimeo.com',
      'www.cnn.com','edition.cnn.com',
      'players.brightcove.net',
      'www.dailymotion.com','player.dailymotion.com',
      'www.instagram.com'
    ],
    allowedSchemes: ['http','https','mailto','data'],
  };

  for (const feedUrl of feeds) {
    try {
      const feed = await rssParser.parseURL(feedUrl);
      const articles = feed.items.slice(0, 20).map((item) => {
        // Extract full content from RSS item
        let fullContent = '';
        if (item['content:encoded']) fullContent = item['content:encoded'];
        else if (item.content) fullContent = item.content;
        else if (item.summary) fullContent = item.summary;
        else if (item.description) fullContent = item.description;

        // Sanitize HTML and extract media
        const contentHtml = fullContent ? sanitizeHtml(fullContent, sanitizeOptions) : '';
        const { images: htmlImages, videos: htmlVideos } = extractMediaFromHtml(contentHtml);

        // Media from enclosures
        const mediaImages = [];
        const mediaVideos = [];
        if (item.enclosure?.url) {
          const type = item.enclosure.type || '';
          if (type.startsWith('image')) mediaImages.push({ src: item.enclosure.url, alt: item.title || '' });
          if (type.startsWith('video')) mediaVideos.push({ kind: 'video', src: item.enclosure.url, type });
        }

        const cleanContent = stripHtml(fullContent);

        return {
          title: item.title,
          description: item.contentSnippet || stripHtml(item.description) || '',
          url: item.link,
          urlToImage:
            (item.enclosure && item.enclosure.type && item.enclosure.type.startsWith('image') && item.enclosure.url) ||
            item.image?.url || item.media?.thumbnail?.url || htmlImages[0]?.src || '',
          source: { name: feed.title || 'RSS Feed' },
          publishedAt: item.pubDate || new Date().toISOString(),
          content: cleanContent || item.contentSnippet || stripHtml(item.description) || '',
          contentHtml,
          media: {
            images: [...mediaImages, ...htmlImages],
            videos: [...mediaVideos, ...htmlVideos],
          },
        };
      });
      allArticles.push(...articles);
    } catch (e) {
      console.error(`RSS feed error for ${feedUrl}:`, e.message);
    }
  }

  return allArticles;
}

// Fast minimal fetch with caching and parallelism (stale-while-revalidate)
const FAST_CACHE = Object.create(null); // { category: { ts, data } }
const FAST_TTL_MS = 60_000; // reuse window (slightly longer so more hits served instantly)
const FEED_TIMEOUT_MS = 1500; // tighter per-feed timeout for faster first byte
const OVERALL_TIMEOUT_MS = 3000; // overall ceiling for fast route
const MAX_ARTICLES_PER_FEED = 6; // fewer items per feed -> parse less HTML
const MAX_TOTAL_ARTICLES = 32; // cap combined list

async function fetchFastFeeds(category = 'breaking') {
  const now = Date.now();
  const cached = FAST_CACHE[category];
  if (cached && (now - cached.ts) < FAST_TTL_MS && cached.data?.length) {
    // Kick off background refresh (non-blocking)
    backgroundRefresh(category);
    return cached.data;
  }

  const feeds = RSS_FEEDS[category] || RSS_FEEDS.breaking;
  const controllerForOverall = new AbortController();
  const overallTimer = setTimeout(() => controllerForOverall.abort(), OVERALL_TIMEOUT_MS);

  const parseWithTimeout = async (feedUrl) => {
    const timerPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('feed-timeout')), FEED_TIMEOUT_MS);
    });
    try {
      const feed = await Promise.race([rssParser.parseURL(feedUrl), timerPromise]);
      if (!feed || !feed.items) return [];
      return feed.items.slice(0, MAX_ARTICLES_PER_FEED).map(item => ({
        title: item.title,
        description: item.contentSnippet || (item.summary || '').slice(0,160),
        url: item.link,
        source: { name: feed.title || 'RSS' },
        publishedAt: item.pubDate || new Date().toISOString(),
        urlToImage: (item.enclosure && /image/i.test(item.enclosure.type || '') && item.enclosure.url) || '',
        id: item.link,
        content: '',
        summary: item.contentSnippet || '',
      }));
    } catch (e) {
      if (e.message !== 'feed-timeout') console.warn('[fast-feed] parse error', feedUrl, e.message);
      return [];
    }
  };

  let results = [];
  try {
    const settled = await Promise.allSettled(feeds.map(parseWithTimeout));
    for (const s of settled) {
      if (s.status === 'fulfilled') {
        results.push(...s.value);
        if (results.length >= MAX_TOTAL_ARTICLES) break;
      }
    }
  } catch (e) {
    // If overall abort triggers, keep any partial results
  } finally {
    clearTimeout(overallTimer);
  }

  // Sort newest first
  results.sort((a,b) => new Date(b.publishedAt||0) - new Date(a.publishedAt||0));
  results = results.slice(0, MAX_TOTAL_ARTICLES);
  FAST_CACHE[category] = { ts: Date.now(), data: results };
  return results;
}

function backgroundRefresh(category) {
  // Fire-and-forget deep enrichment to update cache with full articles later
  (async () => {
    try {
      const full = await fetchFromRSS(category); // existing heavy path
      if (full && full.length) {
        FAST_CACHE[category] = { ts: Date.now(), data: full.map(a => ({
          // merge minimal & enriched fields
          title: a.title,
          description: a.description,
            url: a.url,
            source: a.source,
            publishedAt: a.publishedAt,
            urlToImage: a.urlToImage,
            id: a.url,
            content: a.content,
            summary: a.summary || a.description,
            contentHtml: a.contentHtml,
            media: a.media
        }))};
      }
    } catch {}
  })();
}

// Expanded bias map for hundreds of sources
const SOURCE_BIAS = {
  // left-leaning
  'nytimes.com': 'left',
  'washingtonpost.com': 'left',
  'cnn.com': 'left',
  'msnbc.com': 'left',
  'huffpost.com': 'left',
  'theguardian.com': 'left',
  'vox.com': 'left',
  'slate.com': 'left',
  'motherjones.com': 'left',
  'thedailybeast.com': 'left',
  'politico.com': 'left',
  'theatlantic.com': 'left',
  'newrepublic.com': 'left',
  'thenation.com': 'left',
  'salon.com': 'left',
  // right-leaning
  'foxnews.com': 'right',
  'breitbart.com': 'right',
  'nationalreview.com': 'right',
  'nypost.com': 'right',
  'thefederalist.com': 'right',
  'dailycaller.com': 'right',
  'theblaze.com': 'right',
  'washingtonexaminer.com': 'right',
  'townhall.com': 'right',
  'oann.com': 'right',
  'newsmax.com': 'right',
  'washingtontimes.com': 'right',
  'realclearpolitics.com': 'right',
  'spectator.org': 'right',
  'redstate.com': 'right',
  // center
  'apnews.com': 'center',
  'reuters.com': 'center',
  'bbc.com': 'center',
  'bbc.co.uk': 'center',
  'npr.org': 'center',
  'wsj.com': 'center',
  'usatoday.com': 'center',
  'csmonitor.com': 'center',
  'thehill.com': 'center',
  'axios.com': 'center',
  'bloomberg.com': 'center',
  'ft.com': 'center',
  'economist.com': 'center',
  'time.com': 'center',
  'newsweek.com': 'center',
};

const userLeanStore = {
  // sessionless demo store: {leftClicks: n, rightClicks: n}
  leftClicks: 0,
  rightClicks: 0,
};

function inferLean() {
  const { leftClicks, rightClicks } = userLeanStore;
  if (leftClicks + rightClicks < 5) return 'centrist';
  if (leftClicks > rightClicks * 1.2) return 'democrat';
  if (rightClicks > leftClicks * 1.2) return 'republican';
  return 'centrist';
}

function getDomain(url = '') {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

async function summarizeWithAI({ title, description, content, url }) {
  const text = [title, description, content].filter(Boolean).join('\n');
  if (!text) return '';

  try {
    if (process.env.GEMINI_API_KEY) {
      // Use gemini-2.0-flash-exp for speed (as requested: NOT pro)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      const prompt = `Summarize the following news for a general audience in 3-4 sentences. Add a neutral, clear tone.\n\n${text}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text()?.trim() || summarize(text, 280);
    }
  } catch (e) {
    console.error('AI summarize error', e.message);
  }
  return summarize(text, 280);
}

function fallbackCategoryDetection(text) {
  const lower = text.toLowerCase();
  
  // Strict exclusions for entertainment/awards/sports
  if (/\b(oscar|emmy|grammy|award|ceremony|movie|film|actor|actress|celebrity|sport|game|player|team|championship)\b/.test(lower)) {
    return 'breaking';
  }
  
  // War - very strict
  if (/\b(war|warfare|military operation|combat|battlefield|troops deployment|soldiers|invasion|airstrike|missile attack|armed conflict)\b/.test(lower) &&
      !/\b(election|campaign|ceremony|award)\b/.test(lower)) {
    return 'war';
  }
  
  // Economy
  if (/\b(stock market|wall street|nasdaq|dow jones|trading|gdp|inflation|federal reserve|earnings|revenue)\b/.test(lower)) {
    return 'economy';
  }
  
  // Politics
  if (/\b(election|senate|congress|governor|legislative|bill passes|white house|presidential)\b/.test(lower)) {
    return 'politics';
  }
  
  // Health
  if (/\b(hospital|disease|vaccine|medical treatment|pandemic|health crisis)\b/.test(lower)) {
    return 'health';
  }
  
  // Science
  if (/\b(research|discovery|scientific|experiment|nasa|space mission)\b/.test(lower)) {
    return 'science';
  }
  
  return 'breaking';
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Fast news endpoint (target <5s response)
app.get('/api/news-fast', async (req, res) => {
  const started = Date.now();
  try {
    const category = req.query.category || 'breaking';
    const articles = await fetchFastFeeds(category);
    const latency = Date.now() - started;
    if (latency > 2500) {
      console.warn(`[news-fast] slow response category=${category} latency=${latency}ms articles=${articles.length}`);
    } else {
      console.log(`[news-fast] ok category=${category} latency=${latency}ms articles=${articles.length}`);
    }
    res.status(200).json({ articles, category, fast: true, latencyMs: latency, respondedAt: new Date().toISOString() });
  } catch (e) {
    const latency = Date.now() - started;
    console.error('[news-fast] error', e.message, 'latency=', latency, 'ms');
    res.status(500).json({ articles: [], error: 'failed-fast', latencyMs: latency });
  }
});

// Get list of active elections based on current date
app.get('/api/elections/active', async (_req, res) => {
  try {
    const now = new Date();
    const activeElections = [];
    
    // Define election schedule (dates when elections are active/visible)
    const electionSchedule = [
      {
        id: 'presidential-2025',
        type: 'presidential',
        name: 'Presidential Election 2025',
        startDate: new Date('2025-11-01'),
        endDate: new Date('2025-11-15'),
        active: now >= new Date('2025-11-01') && now <= new Date('2025-11-15')
      },
      {
        id: 'gubernatorial-2025',
        type: 'gubernatorial',
        name: 'Gubernatorial Elections 2025',
        startDate: new Date('2025-11-01'),
        endDate: new Date('2025-12-01'),
        states: ['VA', 'NJ', 'KY', 'MS', 'LA'],
        active: now >= new Date('2025-11-01') && now <= new Date('2025-12-01')
      },
      {
        id: 'mayoral-2025',
        type: 'mayoral',
        name: 'Major City Elections 2025',
        startDate: new Date('2025-11-01'),
        endDate: new Date('2025-12-15'),
        cities: ['New York', 'Philadelphia', 'Pittsburgh', 'Houston', 'San Antonio', 'Phoenix', 'San Francisco', 'Seattle'],
        active: now >= new Date('2025-11-01') && now <= new Date('2025-12-15')
      }
    ];
    
    // Filter to only active elections
    const active = electionSchedule.filter(e => e.active);
    
    res.json({
      activeElections: active,
      currentDate: now.toISOString()
    });
  } catch (error) {
    console.error('[elections/active] error:', error.message);
    res.status(500).json({ error: 'Failed to fetch active elections' });
  }
});

// Election Results API - Mock data for demonstration
// In production, this would fetch from AP, Decision Desk HQ, or similar services
app.get('/api/election-results', async (req, res) => {
  try {
    const { type = 'presidential' } = req.query;
    
    if (type === 'gubernatorial') {
      // Gubernatorial elections (state governor races)
      const gubernatorialData = {
        lastUpdated: new Date().toISOString(),
        type: 'gubernatorial',
        race: 'Gubernatorial Elections 2025',
        states: {
          VA: {
            name: 'Virginia',
            democrat: { votes: 1520000, candidate: 'Jennifer McClellan' },
            republican: { votes: 1680000, candidate: 'Glenn Youngkin' },
            called: true,
            reporting: 96,
            winner: 'republican'
          },
          NJ: {
            name: 'New Jersey',
            democrat: { votes: 1950000, candidate: 'Phil Murphy' },
            republican: { votes: 1720000, candidate: 'Jack Ciattarelli' },
            called: true,
            reporting: 94,
            winner: 'democrat'
          },
          KY: {
            name: 'Kentucky',
            democrat: { votes: 720000, candidate: 'Andy Beshear' },
            republican: { votes: 810000, candidate: 'Daniel Cameron' },
            called: false,
            reporting: 87,
            winner: null
          }
        }
      };
      return res.json(gubernatorialData);
    }
    
    if (type === 'mayoral') {
      // If an override file exists, use it for freshest data
      try {
        const fs = require('fs');
        const path = require('path');
        const overridePath = path.join(__dirname, 'data', 'mayoralResults.json');
        if (fs.existsSync(overridePath)) {
          const raw = fs.readFileSync(overridePath, 'utf-8');
          const json = JSON.parse(raw);
          return res.json({ lastUpdated: new Date().toISOString(), ...json });
        }
      } catch (e) {
        console.warn('[mayoral] override read failed:', e.message);
      }

      // Major city mayoral elections with district-level results
      const mayoralData = {
        lastUpdated: new Date().toISOString(),
        type: 'mayoral',
        race: 'Major City Elections 2025',
        cities: {
          'New York': {
            candidates: {
              democrat: 'Eric Adams',
              republican: 'Curtis Sliwa',
              independent: 'John Smith'
            },
            districts: {
              'Manhattan': {
                democrat: { votes: 220000, candidate: 'Eric Adams' },
                republican: { votes: 85000, candidate: 'Curtis Sliwa' },
                independent: { votes: 35000, candidate: 'John Smith' },
                called: true,
                reporting: 94,
                winner: 'democrat'
              },
              'Brooklyn': {
                democrat: { votes: 280000, candidate: 'Eric Adams' },
                republican: { votes: 120000, candidate: 'Curtis Sliwa' },
                independent: { votes: 28000, candidate: 'John Smith' },
                called: true,
                reporting: 91,
                winner: 'democrat'
              },
              'Queens': {
                democrat: { votes: 195000, candidate: 'Eric Adams' },
                republican: { votes: 145000, candidate: 'Curtis Sliwa' },
                independent: { votes: 32000, candidate: 'John Smith' },
                called: true,
                reporting: 88,
                winner: 'democrat'
              },
              'Bronx': {
                democrat: { votes: 165000, candidate: 'Eric Adams' },
                republican: { votes: 52000, candidate: 'Curtis Sliwa' },
                independent: { votes: 18000, candidate: 'John Smith' },
                called: true,
                reporting: 95,
                winner: 'democrat'
              },
              'Staten Island': {
                democrat: { votes: 42000, candidate: 'Eric Adams' },
                republican: { votes: 68000, candidate: 'Curtis Sliwa' },
                independent: { votes: 12000, candidate: 'John Smith' },
                called: true,
                reporting: 89,
                winner: 'republican'
              }
            }
          },
          'Los Angeles': {
            candidates: {
              democrat: 'Karen Bass',
              republican: 'Rick Caruso'
            },
            districts: {
              'CD1': {
                democrat: { votes: 82000, candidate: 'Karen Bass' },
                republican: { votes: 68000, candidate: 'Rick Caruso' },
                called: false,
                reporting: 73,
                winner: null
              },
              'CD4': {
                democrat: { votes: 95000, candidate: 'Karen Bass' },
                republican: { votes: 105000, candidate: 'Rick Caruso' },
                called: false,
                reporting: 78,
                winner: null
              },
              'CD8': {
                democrat: { votes: 128000, candidate: 'Karen Bass' },
                republican: { votes: 92000, candidate: 'Rick Caruso' },
                called: true,
                reporting: 81,
                winner: 'democrat'
              },
              'CD11': {
                democrat: { votes: 110000, candidate: 'Karen Bass' },
                republican: { votes: 125000, candidate: 'Rick Caruso' },
                called: false,
                reporting: 75,
                winner: null
              },
              'CD14': {
                democrat: { votes: 145000, candidate: 'Karen Bass' },
                republican: { votes: 88000, candidate: 'Rick Caruso' },
                called: true,
                reporting: 79,
                winner: 'democrat'
              }
            }
          },
          'Chicago': {
            candidates: {
              democrat: 'Brandon Johnson',
              republican: 'Paul Vallas',
              independent: 'Willie Wilson'
            },
            districts: {
              'Ward 1': {
                democrat: { votes: 85000, candidate: 'Brandon Johnson' },
                republican: { votes: 45000, candidate: 'Paul Vallas' },
                independent: { votes: 15000, candidate: 'Willie Wilson' },
                called: true,
                reporting: 93,
                winner: 'democrat'
              },
              'Ward 5': {
                democrat: { votes: 92000, candidate: 'Brandon Johnson' },
                republican: { votes: 52000, candidate: 'Paul Vallas' },
                independent: { votes: 18000, candidate: 'Willie Wilson' },
                called: true,
                reporting: 91,
                winner: 'democrat'
              },
              'Ward 27': {
                democrat: { votes: 68000, candidate: 'Brandon Johnson' },
                republican: { votes: 78000, candidate: 'Paul Vallas' },
                independent: { votes: 22000, candidate: 'Willie Wilson' },
                called: true,
                reporting: 94,
                winner: 'republican'
              },
              'Ward 32': {
                democrat: { votes: 112000, candidate: 'Brandon Johnson' },
                republican: { votes: 58000, candidate: 'Paul Vallas' },
                independent: { votes: 25000, candidate: 'Willie Wilson' },
                called: true,
                reporting: 90,
                winner: 'democrat'
              },
              'Ward 43': {
                democrat: { votes: 105000, candidate: 'Brandon Johnson' },
                republican: { votes: 62000, candidate: 'Paul Vallas' },
                independent: { votes: 19000, candidate: 'Willie Wilson' },
                called: true,
                reporting: 92,
                winner: 'democrat'
              }
            }
          },
          'Houston': {
            candidates: {
              democrat: 'Sylvester Turner',
              republican: 'John Whitmire'
            },
            districts: {
              'District A': {
                democrat: { votes: 58000, candidate: 'Sylvester Turner' },
                republican: { votes: 72000, candidate: 'John Whitmire' },
                called: false,
                reporting: 79,
                winner: null
              },
              'District B': {
                democrat: { votes: 62000, candidate: 'Sylvester Turner' },
                republican: { votes: 68000, candidate: 'John Whitmire' },
                called: false,
                reporting: 82,
                winner: null
              },
              'District C': {
                democrat: { votes: 85000, candidate: 'Sylvester Turner' },
                republican: { votes: 75000, candidate: 'John Whitmire' },
                called: true,
                reporting: 84,
                winner: 'democrat'
              },
              'District D': {
                democrat: { votes: 92000, candidate: 'Sylvester Turner' },
                republican: { votes: 105000, candidate: 'John Whitmire' },
                called: false,
                reporting: 80,
                winner: null
              },
              'District I': {
                democrat: { votes: 48000, candidate: 'Sylvester Turner' },
                republican: { votes: 65000, candidate: 'John Whitmire' },
                called: true,
                reporting: 83,
                winner: 'republican'
              }
            }
          },
          'Phoenix': {
            candidates: {
              democrat: 'Kate Gallego',
              republican: 'Matt Evans'
            },
            districts: {
              'District 1': {
                democrat: { votes: 42000, candidate: 'Kate Gallego' },
                republican: { votes: 58000, candidate: 'Matt Evans' },
                called: true,
                reporting: 87,
                winner: 'republican'
              },
              'District 3': {
                democrat: { votes: 52000, candidate: 'Kate Gallego' },
                republican: { votes: 62000, candidate: 'Matt Evans' },
                called: true,
                reporting: 89,
                winner: 'republican'
              },
              'District 5': {
                democrat: { votes: 68000, candidate: 'Kate Gallego' },
                republican: { votes: 55000, candidate: 'Matt Evans' },
                called: true,
                reporting: 91,
                winner: 'democrat'
              },
              'District 7': {
                democrat: { votes: 75000, candidate: 'Kate Gallego' },
                republican: { votes: 82000, candidate: 'Matt Evans' },
                called: true,
                reporting: 88,
                winner: 'republican'
              },
              'District 8': {
                democrat: { votes: 58000, candidate: 'Kate Gallego' },
                republican: { votes: 72000, candidate: 'Matt Evans' },
                called: true,
                reporting: 86,
                winner: 'republican'
              }
            }
          },
          'Philadelphia': {
            candidates: {
              democrat: 'Cherelle Parker',
              republican: 'David Oh',
              independent: 'James DeLeon'
            },
            districts: {
              'District 1': {
                democrat: { votes: 95000, candidate: 'Cherelle Parker' },
                republican: { votes: 32000, candidate: 'David Oh' },
                independent: { votes: 12000, candidate: 'James DeLeon' },
                called: true,
                reporting: 96,
                winner: 'democrat'
              },
              'District 3': {
                democrat: { votes: 88000, candidate: 'Cherelle Parker' },
                republican: { votes: 38000, candidate: 'David Oh' },
                independent: { votes: 14000, candidate: 'James DeLeon' },
                called: true,
                reporting: 94,
                winner: 'democrat'
              },
              'District 5': {
                democrat: { votes: 102000, candidate: 'Cherelle Parker' },
                republican: { votes: 42000, candidate: 'David Oh' },
                independent: { votes: 16000, candidate: 'James DeLeon' },
                called: true,
                reporting: 95,
                winner: 'democrat'
              },
              'District 6': {
                democrat: { votes: 78000, candidate: 'Cherelle Parker' },
                republican: { votes: 48000, candidate: 'David Oh' },
                independent: { votes: 15000, candidate: 'James DeLeon' },
                called: true,
                reporting: 93,
                winner: 'democrat'
              },
              'District 7': {
                democrat: { votes: 68000, candidate: 'Cherelle Parker' },
                republican: { votes: 35000, candidate: 'David Oh' },
                independent: { votes: 11000, candidate: 'James DeLeon' },
                called: true,
                reporting: 97,
                winner: 'democrat'
              }
            }
          }
        }
      };
      return res.json(mayoralData);
    }
    
    // Default: Presidential Election data
    // Mock 2024 Presidential Election data
    // In real implementation: fetch from external API like AP Elections API
    const electionData = {
      lastUpdated: new Date().toISOString(),
      type: 'presidential',
      race: 'Presidential Election 2024',
      totalEV: 538,
      needed: 270,
      
      // National totals
      totals: {
        democrat: { votes: 71250000, ev: 226, candidate: 'Harris' },
        republican: { votes: 74180000, ev: 312, candidate: 'Trump' },
      },
      
      // State-by-state results
      states: {
        // Swing states
        PA: { democrat: 3380000, republican: 3520000, called: true, reporting: 98, winner: 'republican' },
        GA: { democrat: 2450000, republican: 2610000, called: true, reporting: 97, winner: 'republican' },
        NC: { democrat: 2680000, republican: 2820000, called: true, reporting: 96, winner: 'republican' },
        MI: { democrat: 2740000, republican: 2690000, called: true, reporting: 95, winner: 'democrat' },
        WI: { democrat: 1680000, republican: 1650000, called: true, reporting: 94, winner: 'democrat' },
        AZ: { democrat: 1520000, republican: 1640000, called: true, reporting: 89, winner: 'republican' },
        NV: { democrat: 720000, republican: 710000, called: false, reporting: 87, winner: null },
        
        // Solid Blue
        CA: { democrat: 8950000, republican: 4820000, called: true, reporting: 65, winner: 'democrat' },
        NY: { democrat: 4120000, republican: 2980000, called: true, reporting: 78, winner: 'democrat' },
        IL: { democrat: 2840000, republican: 2150000, called: true, reporting: 91, winner: 'democrat' },
        WA: { democrat: 1880000, republican: 1320000, called: true, reporting: 73, winner: 'democrat' },
        MA: { democrat: 1650000, republican: 980000, called: true, reporting: 82, winner: 'democrat' },
        OR: { democrat: 1120000, republican: 850000, called: true, reporting: 69, winner: 'democrat' },
        CO: { democrat: 1520000, republican: 1280000, called: true, reporting: 86, winner: 'democrat' },
        NJ: { democrat: 2180000, republican: 1820000, called: true, reporting: 88, winner: 'democrat' },
        VA: { democrat: 2050000, republican: 1840000, called: true, reporting: 93, winner: 'democrat' },
        MD: { democrat: 1420000, republican: 890000, called: true, reporting: 85, winner: 'democrat' },
        MN: { democrat: 1580000, republican: 1420000, called: true, reporting: 92, winner: 'democrat' },
        CT: { democrat: 920000, republican: 680000, called: true, reporting: 84, winner: 'democrat' },
        VT: { democrat: 240000, republican: 180000, called: true, reporting: 78, winner: 'democrat' },
        NH: { democrat: 420000, republican: 380000, called: true, reporting: 81, winner: 'democrat' },
        RI: { democrat: 280000, republican: 190000, called: true, reporting: 76, winner: 'democrat' },
        DE: { democrat: 280000, republican: 220000, called: true, reporting: 79, winner: 'democrat' },
        ME: { democrat: 380000, republican: 340000, called: true, reporting: 72, winner: 'democrat' },
        DC: { democrat: 280000, republican: 18000, called: true, reporting: 89, winner: 'democrat' },
        NM: { democrat: 520000, republican: 480000, called: true, reporting: 75, winner: 'democrat' },
        
        // Solid Red
        TX: { democrat: 5250000, republican: 6180000, called: true, reporting: 88, winner: 'republican' },
        FL: { democrat: 5120000, republican: 5980000, called: true, reporting: 99, winner: 'republican' },
        OH: { democrat: 2380000, republican: 2920000, called: true, reporting: 96, winner: 'republican' },
        TN: { democrat: 1120000, republican: 1820000, called: true, reporting: 91, winner: 'republican' },
        IN: { democrat: 1150000, republican: 1720000, called: true, reporting: 87, winner: 'republican' },
        MO: { democrat: 1280000, republican: 1780000, called: true, reporting: 93, winner: 'republican' },
        SC: { democrat: 1050000, republican: 1420000, called: true, reporting: 89, winner: 'republican' },
        AL: { democrat: 820000, republican: 1420000, called: true, reporting: 86, winner: 'republican' },
        KY: { democrat: 780000, republican: 1350000, called: true, reporting: 84, winner: 'republican' },
        LA: { democrat: 850000, republican: 1280000, called: true, reporting: 82, winner: 'republican' },
        OK: { democrat: 520000, republican: 1050000, called: true, reporting: 77, winner: 'republican' },
        AR: { democrat: 420000, republican: 780000, called: true, reporting: 79, winner: 'republican' },
        MS: { democrat: 520000, republican: 720000, called: true, reporting: 81, winner: 'republican' },
        UT: { democrat: 520000, republican: 820000, called: true, reporting: 74, winner: 'republican' },
        KS: { democrat: 520000, republican: 780000, called: true, reporting: 83, winner: 'republican' },
        NE: { democrat: 380000, republican: 580000, called: true, reporting: 76, winner: 'republican' },
        IA: { democrat: 780000, republican: 920000, called: true, reporting: 88, winner: 'republican' },
        ID: { democrat: 320000, republican: 520000, called: true, reporting: 71, winner: 'republican' },
        WV: { democrat: 280000, republican: 520000, called: true, reporting: 79, winner: 'republican' },
        MT: { democrat: 280000, republican: 380000, called: true, reporting: 73, winner: 'republican' },
        WY: { democrat: 120000, republican: 220000, called: true, reporting: 68, winner: 'republican' },
        ND: { democrat: 140000, republican: 240000, called: true, reporting: 69, winner: 'republican' },
        SD: { democrat: 180000, republican: 280000, called: true, reporting: 72, winner: 'republican' },
        AK: { democrat: 180000, republican: 220000, called: true, reporting: 56, winner: 'republican' },
        HI: { democrat: 320000, republican: 180000, called: true, reporting: 71, winner: 'democrat' },
      }
    };
    
    res.json(electionData);
  } catch (error) {
    console.error('[election] error:', error.message);
    res.status(500).json({ error: 'Failed to fetch election results' });
  }
});


// Enhanced news fetcher with hundreds of articles and full content
app.get('/api/news', async (req, res) => {
  const { mood, category, q, personalize, strategy, page = 1, pageSize = 100 } = req.query;
  const search = (q || '').toLowerCase();
  
  console.log(`[API /news] Request - category: ${category}, mood: ${mood}, search: ${q}`);
  
  const newsApiKey = process.env.NEWS_API_KEY;
  let results = [];

  if (newsApiKey) {
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      params.set('pageSize', pageSize);
      params.set('page', page);
      params.set('language', 'en');
      if (q) {
        // everything endpoint for search
        const eparams = new URLSearchParams();
        eparams.set('q', q);
        eparams.set('pageSize', pageSize);
        eparams.set('page', page);
        eparams.set('language', 'en');
        eparams.set('sortBy', 'publishedAt');
        const r = await fetch(`https://newsapi.org/v2/everything?${eparams.toString()}`, {
          headers: { 'X-Api-Key': newsApiKey },
        });
        const json = await r.json();
        results = json.articles || [];
      } else {
        const r = await fetch(`https://newsapi.org/v2/top-headlines?country=us&${params.toString()}`, {
          headers: { 'X-Api-Key': newsApiKey },
        });
        const json = await r.json();
        results = json.articles || [];
      }
    } catch (e) {
      console.error('NewsAPI error', e.message);
    }
  }

  // If no NewsAPI key or no results, use RSS feeds
  if (!results.length) {
    try {
      // Map 'recommended' to 'breaking' for fetching, and default to 'breaking'
      const rssCategory = !category || category === 'breaking' || category === 'recommended'
        ? 'breaking'
        : category;
      console.log(`[RSS] Fetching from category: ${rssCategory}`);
      results = await fetchFromRSS(rssCategory);
      console.log(`[RSS] Fetched ${results.length} articles`);
    } catch (e) {
      console.error('RSS error', e.message);
    }
  }

  // fallback to mock if still no results
  if (!results.length) {
    results = mockArticles.map((a) => ({
      title: a.title,
      description: a.summary,
      urlToImage: a.image,
      url: 'https://example.com/article/' + a.id,
      source: { name: a.source, id: null },
      content: a.summary,
      category: a.category,
      mood: a.mood,
    }));
  }

  // Enrich with AI summary, mood detection, and full content
  const enriched = await Promise.all(
    results.map(async (r) => {
      const domain = getDomain(r.url);
      const bias = SOURCE_BIAS[domain] || 'center';
      const base = {
        id: r.url || r.title,
        title: r.title,
        image: r.urlToImage,
        source: r.source?.name || domain || 'Unknown',
        url: r.url,
        category: r.category || category || 'breaking',
        bias,
        publishedAt: r.publishedAt,
        author: r.author,
        content: r.content || r.description || '',
        contentHtml: r.contentHtml,
        media: r.media,
        description: r.description || '',
      };
      
      // AI summary
      const summary = await summarizeWithAI({
        title: r.title,
        description: r.description,
        content: r.content,
        url: r.url,
      });

      // Use AI to detect category more accurately
      const title = (r.title || '').toLowerCase();
      const desc = (r.description || '').toLowerCase();
      const text = [title, desc].filter(Boolean).join(' ');
      let detectedCategory = category || 'breaking';
      
      // Use Gemini AI for better category detection
      if (!r.category || r.category === 'breaking' || r.category === 'general') {
        try {
          if (process.env.GEMINI_API_KEY) {
            // Use gemini-2.0-flash-exp for speed (as requested: NOT pro)
            const catModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
            const prompt = `Categorize this news article into EXACTLY ONE category. Return ONLY the category name, nothing else.

Categories:
- war: Military conflicts, armed forces, warfare, battles, defense operations
- economy: Stock markets, business, finance, trade, GDP, inflation, corporate earnings
- politics: Elections, government, legislation, policy, political campaigns
- health: Medical news, diseases, healthcare, hospitals, medicine
- science: Research, discoveries, technology, space, environment, innovation
- breaking: Major breaking news, important events, entertainment, sports, culture, awards, celebrities, other significant topics

Article: "${text.substring(0, 500)}"

Category:`;
            
            const result = await catModel.generateContent(prompt);
            const response = await result.response;
            const aiCategory = response.text()?.trim().toLowerCase() || '';
            
            // Validate AI response
            const validCategories = ['war', 'economy', 'politics', 'health', 'science', 'breaking'];
            if (validCategories.includes(aiCategory)) {
              detectedCategory = aiCategory;
            }
          }
        } catch (e) {
          console.error('AI category detection error', e.message);
          // Fallback to keyword matching
          detectedCategory = fallbackCategoryDetection(text);
        }
      } else {
        detectedCategory = r.category;
      }

      const mood = detectedCategory;

      return { ...base, summary, mood, category: detectedCategory, _domain: domain };
    })
  );

  let data = enriched;
  console.log(`[Filtering] Before: ${data.length} articles, category filter: ${category}`);
  
  // Handle recommended category - show articles matching user's political lean
  if (category === 'recommended') {
    const lean = inferLean();
    if (lean === 'democrat') {
      data = data.filter((a) => a.bias === 'left' || a.bias === 'center');
    } else if (lean === 'republican') {
      data = data.filter((a) => a.bias === 'right' || a.bias === 'center');
    }
    // For centrist, show all articles (no filtering)
    console.log(`[Recommended] Filtered for ${lean} lean: ${data.length} articles`);
  } else if (category && category !== 'breaking') {
    data = data.filter((a) => a.category === category);
    console.log(`[Filtering] After category filter: ${data.length} articles`);
  }
  // For 'breaking' category, show all articles (no filtering by category)
  
  // Enhanced search filtering - word-boundary aware and prioritize title matches
  if (search) {
    const searchLower = search.toLowerCase();
    
    // Create regex for whole word matching
    const wordBoundaryRegex = new RegExp(`\\b${searchLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    
    // Split into exact word matches, partial matches, and content matches
    const exactWordMatches = [];
    const partialMatches = [];
    const contentMatches = [];
    
    data.forEach((a) => {
      const title = (a.title || '');
      const titleLower = title.toLowerCase();
      const summary = (a.summary || '').toLowerCase();
      
      // Check for exact word boundary match in title first (ICE as a whole word)
      if (wordBoundaryRegex.test(title)) {
        exactWordMatches.push(a);
      }
      // Then check if it's a partial match in title (like "rice", "pricing")
      else if (titleLower.includes(searchLower)) {
        partialMatches.push(a);
      }
      // Finally check in summary/content
      else if (wordBoundaryRegex.test(summary) || summary.includes(searchLower)) {
        contentMatches.push(a);
      }
    });
    
    // Sort exact word matches by position of the match
    exactWordMatches.sort((a, b) => {
      const aTitle = (a.title || '');
      const bTitle = (b.title || '');
      const aMatch = aTitle.match(wordBoundaryRegex);
      const bMatch = bTitle.match(wordBoundaryRegex);
      const aPos = aMatch ? aMatch.index : 999;
      const bPos = bMatch ? bMatch.index : 999;
      
      if (aPos !== bPos) return aPos - bPos;
      return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
    });
    
    // Sort partial matches by position
    partialMatches.sort((a, b) => {
      const aPos = (a.title || '').toLowerCase().indexOf(searchLower);
      const bPos = (b.title || '').toLowerCase().indexOf(searchLower);
      if (aPos !== bPos) return aPos - bPos;
      return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
    });
    
    // Sort content matches by date
    contentMatches.sort((a, b) => 
      new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)
    );
    
    // Combine: exact word matches first (ICE), then partials (rice, price), then content
    data = [...exactWordMatches, ...partialMatches, ...contentMatches];
    
    console.log(`[Search "${search}"] Exact: ${exactWordMatches.length}, Partial: ${partialMatches.length}, Content: ${contentMatches.length}`);
  } else {
    // No search - score by recency, impact keywords, and premium source boost (CNN first)
    const impactKeywords = [
      'breaking','urgent','exclusive','bombshell','crisis','attack','shooting','explosion','war','indicted','charged','election','vote','victory','defeat','results','historic','record','unprecedented','confirms','reveals','announces'
    ];
    const premiumDomains = new Set(['cnn.com','www.cnn.com','edition.cnn.com','reuters.com','apnews.com','nytimes.com','washingtonpost.com','bbc.com']);

    const scored = data.map(a => {
      let score = 0;
      const title = (a.title || '').toLowerCase();
      const desc = (a.summary || a.description || '').toLowerCase();
      // recency
      try {
        const hours = (Date.now() - new Date(a.publishedAt || 0).getTime()) / 36e5;
        if (!isNaN(hours)) {
          if (hours <= 2) score += 15;
          else if (hours <= 6) score += 12;
          else if (hours <= 12) score += 9;
          else if (hours <= 24) score += 6;
          else if (hours <= 48) score += 3;
        }
      } catch {}
      // impact
      impactKeywords.forEach(k => {
        if (title.includes(k)) score += 8;
        if (desc.includes(k)) score += 3;
      });
      // premium
      const domain = a._domain || getDomain(a.url);
      if (domain) {
        if (domain.endsWith('cnn.com')) score += 14; // prioritize CNN top stories
        if (premiumDomains.has(domain)) score += 10;
      }
      return { ...a, _score: score };
    });

    scored.sort((x, y) => {
      if (y._score !== x._score) return y._score - x._score;
      return new Date(y.publishedAt || 0) - new Date(x.publishedAt || 0);
    });
    data = scored;
  }

  // Personalization: reorder or filter by user lean
  if (personalize === 'true') {
    const lean = inferLean();
    if (strategy === 'reinforce') {
      data.sort((a, b) => {
        const pref = lean === 'democrat' ? 'left' : lean === 'republican' ? 'right' : 'center';
        const aw = a.bias === pref ? 0 : 1;
        const bw = b.bias === pref ? 0 : 1;
        // If same preference weight, sort by date
        if (aw === bw) {
          return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
        }
        return aw - bw;
      });
    } else if (strategy === 'challenge') {
      data.sort((a, b) => {
        const opp = lean === 'democrat' ? 'right' : lean === 'republican' ? 'left' : 'center';
        const aw = a.bias === opp ? 0 : 1;
        const bw = b.bias === opp ? 0 : 1;
        // If same preference weight, sort by date
        if (aw === bw) {
          return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
        }
        return aw - bw;
      });
    } else {
      // balanced: interleave center/left/right
      const centers = data.filter((d) => d.bias === 'center');
      const lefts = data.filter((d) => d.bias === 'left');
      const rights = data.filter((d) => d.bias === 'right');
      const max = Math.max(centers.length, lefts.length, rights.length);
      const arr = [];
      for (let i = 0; i < max; i++) {
        if (centers[i]) arr.push(centers[i]);
        if (lefts[i]) arr.push(lefts[i]);
        if (rights[i]) arr.push(rights[i]);
      }
      data = arr;
    }
  }

  res.json({ articles: data.map(({ _score, _domain, ...rest }) => rest), total: data.length, lean: inferLean() });
});

// Track interactions to infer lean (demo: uses in-memory store)
app.post('/api/interactions', (req, res) => {
  const { url, source } = req.body || {};
  const domain = getDomain(url) || getDomain(`https://${(source || '').toLowerCase()}`);
  const bias = SOURCE_BIAS[domain];
  if (bias === 'left') userLeanStore.leftClicks += 1;
  if (bias === 'right') userLeanStore.rightClicks += 1;
  res.json({ ok: true, lean: inferLean(), counts: userLeanStore });
});

app.get('/api/lean', (_req, res) => {
  res.json({ lean: inferLean(), counts: userLeanStore });
});

// AI chatbot endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, politicalLean, interests } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('[chat] Processing message:', message);

    // Determine category from message using simple keyword matching
    const categoryMap = {
      'politic': 'politics',
      'election': 'politics',
      'congress': 'politics',
      'senate': 'politics',
      'president': 'politics',
      'economy': 'economy',
      'business': 'economy',
      'market': 'economy',
      'stock': 'economy',
      'trade': 'economy',
      'war': 'war',
      'military': 'war',
      'conflict': 'war',
      'battle': 'war',
      'health': 'health',
      'medical': 'health',
      'hospital': 'health',
      'disease': 'health',
      'science': 'science',
      'technology': 'science',
      'research': 'science',
      'discovery': 'science'
    };
    
    const lowerMessage = message.toLowerCase();
    let detectedCategory = 'breaking';
    let chatResponse = {
      response: '',
      category: 'breaking',
      searchTerms: message
    };

    // Try to use Gemini AI for better response
    let useAI = false;
    try {
      if (process.env.GEMINI_API_KEY) {
        // Use gemini-2.0-flash-exp for speed (as requested: NOT pro)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const chatPrompt = `You are a helpful news assistant. The user has the following profile:
- Political lean: ${politicalLean || 'unknown'}
- Interests: ${interests && interests.length > 0 ? interests.join(', ') : 'general news'}

User query: "${message}"

Analyze this query and respond with:
1. A helpful response (2-3 sentences)
2. Recommended news category (one of: breaking, economy, war, politics, health, science)
3. Suggested search terms (comma-separated)

Format your response as JSON:
{
  "response": "Your helpful response here",
  "category": "category name",
  "searchTerms": "term1, term2, term3"
}`;

        const result = await model.generateContent(chatPrompt);
        const text = result.response.text();
        console.log('[chat] Gemini response:', text);

        // Try to extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          chatResponse = JSON.parse(jsonMatch[0]);
          useAI = true;
        }
      }
    } catch (aiError) {
      console.log('[chat] AI error, using fallback:', aiError.message);
    }

    // Fallback if AI didn't work
    if (!useAI) {
      // Detect category from keywords
      for (const [keyword, cat] of Object.entries(categoryMap)) {
        if (lowerMessage.includes(keyword)) {
          detectedCategory = cat;
          break;
        }
      }
      
      // Fetch articles from ALL categories for broader search
      let allArticles = [];
      const categoriesToSearch = ['breaking', 'economy', 'war', 'politics', 'health', 'science'];
      
      try {
        // Fetch from all categories in parallel
        const fetchPromises = categoriesToSearch.map(cat => 
          fetchFromRSS(cat).catch(err => {
            console.log(`[chat] Error fetching ${cat}:`, err.message);
            return [];
          })
        );
        const results = await Promise.all(fetchPromises);
        allArticles = results.flat();
        console.log('[chat] Fetched', allArticles.length, 'total articles from all categories');
      } catch (err) {
        console.error('[chat] Error fetching articles:', err.message);
      }
      
      // Extract meaningful search terms (better filtering)
      const rawMessage = message.toLowerCase().replace(/[?.,!]/g, '');
      const searchTerms = rawMessage
        .split(' ')
        .filter(word => {
          // Keep words that are:
          // - 4+ characters long, OR
          // - 3 characters as standalone important terms (ICE, FBI, CIA, etc)
          const isLongEnough = word.length > 3;
          const isThreeLetters = word.length === 3;
          const isStopWord = ['what', 'when', 'where', 'how', 'the', 'about', 'with', 'from', 'this', 'that', 'have', 'been', 'your', 'news', 'latest', 'tell', 'show', 'give', 'today', 'happening', 'are', 'what\'s', 'whats', 'new'].includes(word);
          
          return (isLongEnough || isThreeLetters) && !isStopWord;
        });
      
      // Special handling for specific acronyms and terms
      const specialTerms = {
        'ice': 'immigration customs enforcement',
        'fbi': 'federal bureau investigation',
        'cia': 'central intelligence agency',
        'gop': 'republican party',
        'nba': 'basketball',
        'nfl': 'football'
      };

      // Synonyms/related terms expansion for key acronyms to catch relevant news
      const expandedTerms = {
        'ice': [
          'immigration',
          'immigration and customs enforcement',
          'customs enforcement',
          'deportation',
          'detention',
          'border patrol',
          'border security',
          'homeland security',
          'department of homeland security',
          'dhs',
          'hsi',
          'migrant',
          'asylum',
          'removal proceedings'
        ]
      };
      
      // Check if query contains a special term that needs exact matching
      const hasSpecialTerm = Object.keys(specialTerms).some(term => 
        rawMessage.split(' ').includes(term)
      );
      
  console.log('[chat] Search terms:', searchTerms);
  console.log('[chat] Has special term:', hasSpecialTerm);
      
      let relevantArticles = allArticles;
      
      // If we have search terms, filter and rank by relevance with stricter matching
      if (searchTerms.length > 0) {
        // Precompute US focus preference if user asked for breaking/politics/war or similar
        const lowerMsg = message.toLowerCase();
        const preferUS = /\b(breaking|politic|war|us|u\.s\.|united states|america)\b/.test(lowerMsg);
        const usCues = [
          'u.s.', ' us ', 'united states', 'america', 'american', 'washington', 'capitol', 'congress', 'senate', 'house of representatives',
          'white house', 'biden', 'trump', 'kamala', 'supreme court', 'scotus', 'pentagon', 'dhs', 'ice', 'homeland security'
        ];

        const US_DOMAINS = [
          'nytimes.com','washingtonpost.com','cnn.com','foxnews.com','apnews.com','reuters.com','npr.org','wsj.com','usatoday.com',
          'thehill.com','axios.com','bloomberg.com','politico.com','cbsnews.com','abcnews.go.com','latimes.com','time.com','newsweek.com'
        ];

        relevantArticles = allArticles.map(article => {
          const titleLower = (article.title || '').toLowerCase();
          const descLower = (article.description || '').toLowerCase();
          const contentLower = (article.content || '').toLowerCase();
          const textCombo = `${titleLower}\n${descLower}`;
          const hasUSCue = usCues.some(cue => textCombo.includes(cue));
          
          // Breaking news impact boost - prioritize shocking/major headlines
          let impactBoost = 0;
          const highImpactKeywords = [
            'breaking', 'just in', 'urgent', 'alert', 'exclusive', 'bombshell', 'shock',
            'crisis', 'disaster', 'emergency', 'catastrophe', 'death', 'killed', 'murdered',
            'war', 'attack', 'explosion', 'shooting', 'fire', 'crash', 'collision',
            'scandal', 'resignation', 'arrested', 'indicted', 'charged', 'convicted',
            'election', 'vote', 'winner', 'results', 'victory', 'defeat',
            'breakthrough', 'historic', 'unprecedented', 'record', 'first ever',
            'announce', 'reveals', 'confirms', 'unveils', 'major', 'massive'
          ];
          highImpactKeywords.forEach(keyword => {
            if (titleLower.includes(keyword)) impactBoost += 8;
            if (descLower.includes(keyword)) impactBoost += 3;
          });
          
          // Premium source boost - CNN, NYT, WaPo, Reuters get priority
          let sourceBoost = 0;
          const premiumDomains = ['cnn.com', 'nytimes.com', 'washingtonpost.com', 'reuters.com', 'bbc.com', 'apnews.com'];
          const domain = getDomain(article.url);
          if (premiumDomains.includes(domain)) sourceBoost = 12;
          
          // Recency boost: up to +15 points if very recent, taper over 72h
          let recencyBoost = 0;
          try {
            const published = new Date(article.publishedAt || 0).getTime();
            const hoursAgo = (Date.now() - published) / 36e5;
            if (!isNaN(hoursAgo)) {
              if (hoursAgo <= 2) recencyBoost = 15;      // Ultra fresh: last 2 hours
              else if (hoursAgo <= 6) recencyBoost = 12;  // Very fresh: last 6 hours
              else if (hoursAgo <= 12) recencyBoost = 9;  // Fresh: last 12 hours
              else if (hoursAgo <= 24) recencyBoost = 6;  // Recent: last day
              else if (hoursAgo <= 48) recencyBoost = 3;  // Moderately recent
              else if (hoursAgo <= 72) recencyBoost = 1;  // Still relevant
            }
          } catch {}
          
          // Calculate relevance score with word boundaries for exact matching
          let score = 0;
          searchTerms.forEach(term => {
            // For special terms like "ICE", use VERY strict word boundary matching
            // This prevents matching "ice" in "police", "service", "office", etc.
            const wordBoundaryRegex = new RegExp(`\\b${term}\\b`, 'i');
            
            // For 3-letter terms, be extra strict - must be standalone word
            const isThreeLetterTerm = term.length === 3;
            
            if (isThreeLetterTerm && hasSpecialTerm) {
              // Super strict: must be uppercase or at word boundary with spaces/punctuation
              // Check for ICE as standalone word (not in "police", "service", etc.)
              const strictRegex = new RegExp(`(^|\\s|,|\\(|\\[|"|')${term.toUpperCase()}(\\s|,|\\)|\\]|"|'|\\.|:|$)`, 'i');
              
              // Negative lookbehind/lookahead to exclude when surrounded by letters
              // This prevents matching "ice" in "police", "service", "justice", "office", "price", "notice", "device", "choice", "advice"
              const standaloneRegex = new RegExp(`(?<![a-z])${term}(?![a-z])`, 'i');
              
              // Match if it's uppercase ICE or lowercase ice but truly standalone
              const titleMatch = strictRegex.test(article.title || '') || standaloneRegex.test(titleLower);
              const descMatch = strictRegex.test(article.description || '') || standaloneRegex.test(descLower);
              const contentMatch = standaloneRegex.test(contentLower);
              
              if (titleMatch) score += 30;
              if (descMatch) score += 15;
              if (contentMatch) score += 5;
            } else {
              // Normal word boundary matching for longer terms
              if (wordBoundaryRegex.test(titleLower)) score += 20;
              if (wordBoundaryRegex.test(descLower)) score += 10;
              if (wordBoundaryRegex.test(contentLower)) score += 3;
            }
          });

          // If searching for ICE, expand with related terms for partial scoring
          if (searchTerms.includes('ice')) {
            const rel = expandedTerms['ice'] || [];
            rel.forEach(rt => {
              const rtRegex = new RegExp(`\\b${rt.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'i');
              if (rtRegex.test(titleLower)) score += 14; // partial but strong
              if (rtRegex.test(descLower)) score += 7;
              if (rtRegex.test(contentLower)) score += 2;
            });
          }

          // US focus boost when applicable
          if (preferUS && hasUSCue) {
            score += 10;
          }

          // Prefer US domains if US focus requested
          if (preferUS) {
            const domain = getDomain(article.url);
            if (US_DOMAINS.includes(domain)) score += 12;
          }

          // Apply all boosts to score
          score += recencyBoost + impactBoost + sourceBoost;
          
          return { ...article, relevanceScore: score, _hasUSCue: hasUSCue };
        })
        .filter(a => a.relevanceScore > 0)
        .sort((a, b) => {
          // Sort by relevance first, then by date
          if (b.relevanceScore !== a.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
          }
          return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
        });
        
        // If US focus preferred, narrow to US-signaled items when we have enough
        if (preferUS) {
          const domainFiltered = (arr) => arr.filter(a => {
            const domain = getDomain(a.url);
            return a._hasUSCue || ['nytimes.com','washingtonpost.com','cnn.com','foxnews.com','apnews.com','reuters.com','npr.org','wsj.com','usatoday.com','thehill.com','axios.com','bloomberg.com','politico.com','cbsnews.com','abcnews.go.com','latimes.com','time.com','newsweek.com'].includes(domain);
          });
          const narrowed = domainFiltered(relevantArticles);
          if (narrowed.length >= 1) {
            relevantArticles = narrowed;
          }
        }

        console.log('[chat] Found', relevantArticles.length, 'relevant articles');
      } else {
        // No specific search terms, filter by detected category
        if (detectedCategory !== 'breaking') {
          relevantArticles = allArticles.filter(a => a.category === detectedCategory);
        }
        relevantArticles = relevantArticles.sort((a, b) => 
          new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)
        );
      }
      
      // Dedupe by URL and title, then take top 10 for display
      const seen = new Set();
      const deduped = [];
      for (const a of relevantArticles) {
        const key = (a.url || '') + '|' + (a.title || '');
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(a);
        }
        if (deduped.length >= 20) break; // keep some headroom for longer summaries
      }
      const topArticles = deduped.slice(0, 10);
      
      // Create a comprehensive summary from articles
      let summaryText = '';
      
      if (topArticles.length === 0) {
        // If no exact matches and ICE was requested, broaden to immigration context
        const askedForICE = /\bice\b/i.test(message);
        if (askedForICE) {
          summaryText = `I couldn't find articles explicitly mentioning ICE by name. However, here are broader topics you can try that often cover ICE actions: immigration policy, deportations, border security, DHS/HSI operations, and detention practices.`;
        } else {
          summaryText = `I couldn't find recent articles about "${message}". Try asking about current events in politics, economy, war, health, or science.`;
        }
      } else if (searchTerms.length > 0) {
        // Build a longer narrative summary from the articles
        const isUSFocus = /\b(breaking|politic|war|us|u\.s\.|united states|america)\b/i.test(message);
        const leadIn = isUSFocus
          ? `Here's a U.S.-focused roundup`
          : `Based on recent news`;
        const topics = searchTerms.length > 0 ? ` about ${searchTerms.join(', ')}` : '';
        summaryText = `${leadIn}${topics}:

`;

        // Provide 8 items with longer snippets when the user asked for breaking/war/politics
        const itemCount = isUSFocus ? Math.min(8, topArticles.length) : Math.min(6, topArticles.length);
        const summaries = [];
        topArticles.slice(0, itemCount).forEach((article) => {
          if (article.description || article.content) {
            const base = (article.description || article.content || '').replace(/\s+/g, ' ').trim();
            const snippet = base.substring(0, 240);
            summaries.push(`• ${article.title}
  ${snippet}...`);
          } else {
            summaries.push(`• ${article.title}`);
          }
        });

        summaryText += summaries.join('\n\n');

        if (topArticles.length > itemCount) {
          summaryText += `\n\nPlus ${topArticles.length - itemCount} more related articles available.`;
        }
      } else {
        // Category-based summary (longer for breaking/war/politics)
        const isLong = /\b(breaking|war|politic)\b/i.test(detectedCategory) || /\b(breaking|war|politic)\b/i.test(message);
        const header = isLong ? `Here are the latest developments in ${detectedCategory} (U.S.-focused where applicable):\n\n`
                              : `Here are the latest developments in ${detectedCategory}:\n\n`;
        summaryText = header;
        const count = isLong ? 8 : 3;
        topArticles.slice(0, count).forEach((article) => {
          if (article.description || article.content) {
            const base = (article.description || article.content || '').replace(/\s+/g, ' ').trim();
            const snippet = base.substring(0, isLong ? 240 : 120);
            summaryText += `• ${article.title}\n  ${snippet}...\n\n`;
          } else {
            summaryText += `• ${article.title}\n\n`;
          }
        });
      }
      
      chatResponse = {
        response: summaryText,
        category: detectedCategory,
        searchTerms: message
      };
      
      // Return early with the articles we found
      console.log('[chat] Returning', topArticles.length, 'articles');
      return res.json({
        response: chatResponse.response,
        category: chatResponse.category,
        articles: topArticles
      });
    }

    console.log('[chat] Using category:', chatResponse.category);

    // Fetch relevant articles based on category
    const categoryToFetch = chatResponse.category || 'breaking';
    let relevantArticles = [];
    
    try {
      relevantArticles = await fetchFromRSS(categoryToFetch);
      console.log('[chat] Fetched', relevantArticles.length, 'articles from RSS');
    } catch (fetchError) {
      console.error('[chat] Error fetching articles:', fetchError.message);
    }

    // Filter by political lean if specified
    if (politicalLean && politicalLean !== 'centrist' && relevantArticles.length > 0) {
      const preferredBias = politicalLean === 'democrat' ? 'left' : 'right';
      const filtered = relevantArticles.filter(a => {
        const domain = getDomain(a.url);
        const bias = SOURCE_BIAS[domain];
        return bias === preferredBias || bias === 'center';
      });
      if (filtered.length > 0) {
        relevantArticles = filtered;
      }
      console.log('[chat] Filtered by lean, now have', relevantArticles.length, 'articles');
    }

    // Sort by date and limit to top 10
    relevantArticles = relevantArticles
      .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
      .slice(0, 10);

    console.log('[chat] Returning', relevantArticles.length, 'articles');

    res.json({
      response: chatResponse.response,
      category: chatResponse.category,
      articles: relevantArticles
    });

  } catch (error) {
    console.error('[chat] error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to process chat request',
      response: 'I apologize, but I encountered an error. Please try again.',
      articles: []
    });
  }
});

// ------------------------------
// Google OAuth + Gmail API
// ------------------------------
// In-memory token storage (replace with persistent DB for production)
const gmailTokensByUser = new Map(); // userId -> tokens

function createOAuthClient() {
  // Support both naming conventions
  const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT || process.env.OAUTH_REDIRECT_URI;
  console.log('[oauth] env check', {
    CLIENT_ID,
    CLIENT_SECRET: CLIENT_SECRET ? '***set***' : undefined,
    REDIRECT_URI
  });

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    console.warn('[oauth] Missing env vars: GOOGLE_OAUTH_CLIENT_ID/GOOGLE_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET/GOOGLE_CLIENT_SECRET, or GOOGLE_OAUTH_REDIRECT/OAUTH_REDIRECT_URI');
    return null;
  }
  try {
    return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  } catch (e) {
    console.error('[oauth] Failed to create OAuth client:', e.message);
    return null;
  }
}

// Step 1: Generate consent URL
app.get('/api/auth/google/init', (req, res) => {
  try {
    const userId = req.query.userId || 'anon';
    const client = createOAuthClient();
    if (!client) {
      return res.status(503).json({
        error: 'missing_oauth_config',
        message: 'Google OAuth environment variables are missing. Set either GOOGLE_OAUTH_CLIENT_ID/GOOGLE_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET/GOOGLE_CLIENT_SECRET, and GOOGLE_OAUTH_REDIRECT/OAUTH_REDIRECT_URI.'
      });
    }
    const scopes = [
      'openid',
      'profile',
      'email',
      'https://www.googleapis.com/auth/gmail.readonly'
    ];
    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // force consent so we get refresh_token
      state: userId
    });
    res.json({ url });
  } catch (e) {
    console.error('[auth/init] error:', e.message);
    res.status(500).json({ error: 'internal_error', message: 'Failed to initialize OAuth' });
  }
});

// Step 2: OAuth callback exchanges code for tokens
app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const client = createOAuthClient();
    if (!client) return res.status(500).send('OAuth not configured');
    if (!code) return res.status(400).send('Missing code');
    const { tokens } = await client.getToken(code);
    // Persist tokens in memory
    gmailTokensByUser.set(state || 'anon', tokens);
    console.log('[oauth] stored tokens for user=', state, 'scopes=', tokens.scope);
    // Redirect to post-login page if specified, else provide window-close helper
    const postLoginRedirect = process.env.OAUTH_POST_LOGIN_REDIRECT;
    if (postLoginRedirect) {
      try {
        return res.redirect(postLoginRedirect);
      } catch (e) {
        console.warn('[oauth] redirect failed, falling back to close-page:', e.message);
      }
    }
    res.send('<html><body><script>window.close();</script>Authentication complete. You can close this window.</body></html>');
  } catch (e) {
    console.error('[oauth] callback error:', e.message);
    res.status(500).send('OAuth error: ' + e.message);
  }
});

// Gmail messages endpoint (reads recent messages metadata)
app.get('/api/gmail/messages', async (req, res) => {
  try {
    const userId = req.query.userId || 'anon';
    const tokens = gmailTokensByUser.get(userId);
    if (!tokens) {
      return res.status(401).json({ error: 'not_authenticated', message: 'No Gmail tokens for user. Initiate OAuth first.' });
    }
    const client = createOAuthClient();
    if (!client) return res.status(500).json({ error: 'oauth_not_configured' });
    client.setCredentials(tokens);

    // Auto-refresh handling: update stored tokens if refreshed
    client.on('tokens', (newTokens) => {
      if (newTokens.refresh_token) tokens.refresh_token = newTokens.refresh_token;
      if (newTokens.access_token) tokens.access_token = newTokens.access_token;
      gmailTokensByUser.set(userId, tokens);
    });

    const gmail = google.gmail({ version: 'v1', auth: client });
    const listResp = await gmail.users.messages.list({ userId: 'me', maxResults: 10 });
    const messageIds = (listResp.data.messages || []).map(m => m.id);
    const details = await Promise.all(messageIds.map(async (id) => {
      try {
        const msg = await gmail.users.messages.get({ userId: 'me', id, format: 'metadata', metadataHeaders: ['Subject', 'From', 'Date'] });
        const headers = msg.data.payload?.headers || [];
        const getHeader = (name) => headers.find(h => h.name === name)?.value || '';
        return {
          id,
          subject: getHeader('Subject'),
          from: getHeader('From'),
          date: getHeader('Date'),
          snippet: msg.data.snippet || ''
        };
      } catch (e) {
        return { id, error: e.message };
      }
    }));

    res.json({ messages: details, userId, count: details.length });
  } catch (e) {
    console.error('[gmail] messages error:', e.message);
    res.status(500).json({ error: 'gmail_fetch_failed', message: e.message });
  }
});

// ------------------------------
// Hardened Server-side Google Login (Firebase-less fallback)
// ------------------------------
const jsonwebtoken = require('jsonwebtoken');
const SESSION_COOKIE = 'cleary_session';
const SESSION_SECRET = process.env.APP_SESSION_SECRET || 'insecure-demo-secret-change-me';

function issueJwt(profile) {
  const payload = {
    sub: profile.id,
    email: profile.email,
    name: profile.name,
    picture: profile.picture,
    iat: Math.floor(Date.now() / 1000)
  };
  return jsonwebtoken.sign(payload, SESSION_SECRET, { expiresIn: '7d' });
}

function verifyJwt(token) {
  try { return jsonwebtoken.verify(token, SESSION_SECRET); } catch { return null; }
}

function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  return header.split(';').reduce((acc, part) => {
    const [k, v] = part.split('=');
    if (k && v) acc[k.trim()] = decodeURIComponent(v.trim());
    return acc;
  }, {});
}

// Auth URL for popup login
app.get('/api/auth/google/login', (req, res) => {
  try {
    const client = createOAuthClient();
    if (!client) {
      console.log('[auth/login] OAuth not configured - returning helpful error message');
      return res.status(503).json({ 
        error: 'oauth_not_configured',
        message: 'Google Sign-In is not set up yet. To enable it:\n\n1. Go to https://console.cloud.google.com/apis/credentials\n2. Create an OAuth 2.0 Client ID\n3. Add redirect URI: http://localhost:5001/api/auth/google/callback\n4. Copy Client ID and Client Secret to .env file\n\nFor now, you can use guest mode or create a local account.',
        setupUrl: 'https://console.cloud.google.com/apis/credentials'
      });
    }
    const state = req.query.state || ('login-' + Date.now());
    const url = client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['openid','profile','email'],
      state
    });
    res.json({ url, state });
  } catch (e) {
    console.error('[auth/login] error:', e.message);
    res.status(500).json({ error: 'internal_error', message: 'Failed to generate login URL' });
  }
});

// Middleware augmenting callback with secure session for login states
app.use('/api/auth/google/callback', async (req, res, next) => {
  if (req.method !== 'GET') return next();
  const state = req.query.state || '';
  if (!state.startsWith('login-')) return next();
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).send('Missing authorization code. Please try signing in again.');
    }
    const client = createOAuthClient();
    if (!client) {
      return res.status(503).send('OAuth not configured. Contact administrator.');
    }
    const { tokens } = await client.getToken(code);
    if (!tokens || !tokens.access_token) {
      throw new Error('Failed to obtain access token from Google');
    }
    client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const { data: profile } = await oauth2.userinfo.get();
    if (!profile || !profile.email) {
      throw new Error('Failed to retrieve user profile from Google');
    }
    const jwtToken = issueJwt(profile);
    const secure = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(jwtToken)}; Path=/; HttpOnly; SameSite=Lax${secure?'; Secure':''}; Max-Age=${7*24*3600}`);
    const script = `<!doctype html><html><body><script>
      (function(){
        const data = { profile: ${JSON.stringify({ id: profile.id, email: profile.email, name: profile.name, picture: profile.picture })} };
        if (window.opener) { window.opener.postMessage({ type: 'cleary-google-login', data }, '*'); }
        setTimeout(function(){ window.close(); }, 500);
      })();
    </script><p>Login successful! This window will close automatically...</p></body></html>`;
    res.setHeader('Content-Type', 'text/html');
    return res.send(script);
  } catch (e) {
    console.error('[oauth-login] error:', e.message, e.stack);
    const errorMsg = e.message || 'Unknown error occurred';
    return res.status(500).send(`
      <!doctype html><html><body>
        <h2>Login Failed</h2>
        <p>Error: ${errorMsg}</p>
        <p>Please close this window and try again. If the problem persists, contact support.</p>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'cleary-google-login-error', error: '${errorMsg}' }, '*');
          }
          setTimeout(function(){ window.close(); }, 5000);
        </script>
      </body></html>
    `);
  }
});

// Session introspection
app.get('/api/auth/me', (req, res) => {
  try {
    const cookies = parseCookies(req);
    const token = cookies[SESSION_COOKIE];
    if (!token) return res.status(401).json({ authenticated: false, message: 'No session cookie found' });
    const payload = verifyJwt(token);
    if (!payload) return res.status(401).json({ authenticated: false, message: 'Invalid or expired session' });
    res.json({ 
      authenticated: true, 
      user: { 
        id: payload.sub, 
        email: payload.email, 
        name: payload.name, 
        photoURL: payload.picture 
      } 
    });
  } catch (e) {
    console.error('[auth/me] error:', e.message);
    res.status(500).json({ authenticated: false, error: 'internal_error' });
  }
});

// Logout route
app.post('/api/auth/logout', (req, res) => {
  try {
    res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`);
    res.json({ ok: true, message: 'Logged out successfully' });
  } catch (e) {
    console.error('[auth/logout] error:', e.message);
    res.status(500).json({ ok: false, error: 'Failed to logout' });
  }
});

app.listen(PORT, () => {
  console.log(`[cleary-api] listening on http://localhost:${PORT}`);
});
