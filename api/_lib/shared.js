const { GoogleGenerativeAI } = require('@google/generative-ai');
const Parser = require('rss-parser');
const sanitizeHtml = require('sanitize-html');

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const rssParser = new Parser();

const RSS_FEEDS = {
  breaking: [
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    'https://www.theguardian.com/world/rss',
    'https://moxie.foxnews.com/google-publisher/latest.xml',
    'https://feeds.reuters.com/reuters/topNews',
    'http://rss.cnn.com/rss/cnn_topstories.rss',
  ],
  politics: [
    'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
    'https://www.theguardian.com/politics/rss',
    'https://moxie.foxnews.com/google-publisher/politics.xml',
    'http://rss.cnn.com/rss/cnn_allpolitics.rss',
  ],
  health: [
    'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
    'https://www.theguardian.com/society/health/rss',
    'http://rss.cnn.com/rss/cnn_health.rss',
  ],
  science: [
    'https://www.sciencedaily.com/rss/all.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml',
    'http://rss.cnn.com/rss/cnn_tech.rss',
  ],
  world: [
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    'https://www.aljazeera.com/xml/rss/all.xml',
    'https://feeds.reuters.com/Reuters/worldNews',
    'https://www.theguardian.com/world/rss'
  ],
  business: [
    'https://feeds.bbci.co.uk/news/business/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
    'https://feeds.reuters.com/reuters/businessNews',
    'https://www.theguardian.com/uk/business/rss'
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
    const iframeRegex = /<iframe[^>]*src=["']([^"']+)["'][^>]*>/gi;
    while ((match = iframeRegex.exec(html)) !== null) {
      videos.push({ kind: 'iframe', src: match[1] });
    }
  } catch {}
  return { images, videos };
};

async function fetchFromRSS(category = 'breaking') {
  const feeds = RSS_FEEDS[category] || RSS_FEEDS.breaking;
  const allArticles = [];

  for (const feedUrl of feeds) {
    try {
      const feed = await rssParser.parseURL(feedUrl);
      const articles = feed.items.slice(0, 15).map((item) => {
        let fullContent = item['content:encoded'] || item.content || item.summary || item.description || '';
        const contentHtml = fullContent ? sanitizeHtml(fullContent, { allowedTags: [], allowedAttributes: {} }) : '';
        const { images: htmlImages, videos: htmlVideos } = extractMediaFromHtml(fullContent);
        const cleanContent = stripHtml(fullContent);

        return {
          title: item.title,
          description: item.contentSnippet || stripHtml(item.description) || '',
          url: item.link,
          urlToImage: item.enclosure?.url || htmlImages[0]?.src || '',
          source: { name: feed.title || 'RSS Feed' },
          publishedAt: item.pubDate || new Date().toISOString(),
          content: cleanContent || item.contentSnippet || '',
          contentHtml,
          media: { images: htmlImages, videos: htmlVideos },
        };
      });
      allArticles.push(...articles);
    } catch (e) {
      console.error(`RSS error for ${feedUrl}:`, e.message);
    }
  }
  return allArticles;
}

// Fetch from an explicit list of feed URLs (used for regional/grouped feeds)
async function fetchFromFeeds(feedUrls = []) {
  const allArticles = [];
  for (const feedUrl of feedUrls) {
    try {
      const feed = await rssParser.parseURL(feedUrl);
      const articles = feed.items.slice(0, 15).map((item) => {
        let fullContent = item['content:encoded'] || item.content || item.summary || item.description || '';
        const contentHtml = fullContent ? sanitizeHtml(fullContent, { allowedTags: [], allowedAttributes: {} }) : '';
        const { images: htmlImages, videos: htmlVideos } = extractMediaFromHtml(fullContent);
        const cleanContent = stripHtml(fullContent);

        return {
          title: item.title,
          description: item.contentSnippet || stripHtml(item.description) || '',
          url: item.link,
          urlToImage: item.enclosure?.url || htmlImages[0]?.src || '',
          source: { name: feed.title || 'RSS Feed' },
          publishedAt: item.pubDate || new Date().toISOString(),
          content: cleanContent || item.contentSnippet || '',
          contentHtml,
          media: { images: htmlImages, videos: htmlVideos },
        };
      });
      allArticles.push(...articles);
    } catch (e) {
      console.error(`RSS error for ${feedUrl}:`, e.message);
    }
  }
  return allArticles;
}

async function summarizeWithAI(text, maxLength = 160) {
  if (!genAI || !text) return text.slice(0, maxLength);
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Summarize this news article in ${maxLength} characters or less:\n\n${text}`;
    const result = await model.generateContent(prompt);
    return result.response.text().slice(0, maxLength);
  } catch {
    return text.slice(0, maxLength);
  }
}

async function detectCategory(title, description) {
  if (!genAI) return 'general';
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Categorize this news article into ONE of these: politics, health, science, technology, business, world, sports. Title: ${title}. Description: ${description}. Return ONLY the category name.`;
    const result = await model.generateContent(prompt);
    const cat = result.response.text().trim().toLowerCase();
    return ['politics', 'health', 'science', 'technology', 'business', 'world', 'sports'].includes(cat) ? cat : 'general';
  } catch {
    return 'general';
  }
}

function inferLean(source) {
  const leftSources = ['cnn', 'msnbc', 'huffpost', 'guardian', 'nytimes'];
  const rightSources = ['fox', 'breitbart', 'newsmax', 'dailycaller'];
  const lowerSource = source.toLowerCase();
  if (leftSources.some(s => lowerSource.includes(s))) return 'left';
  if (rightSources.some(s => lowerSource.includes(s))) return 'right';
  return 'center';
}

module.exports = {
  genAI,
  rssParser,
  fetchFromRSS,
  fetchFromFeeds,
  summarizeWithAI,
  detectCategory,
  inferLean,
  stripHtml,
  REGIONAL_FEEDS,
};
