/**
 * Shorts API - Video-first news content endpoint
 * Fetches articles that contain video content from CNN and other sources
 * Filters and enriches to prioritize short-form video news
 */

const { fetchFromRSS, extractMediaFromHtml, toEmbedFromUrl, detectCategory, detectPoliticalLeanAI } = require('./_lib/shared');
const { cache } = require('./_lib/cache');
let fetch;
try { fetch = require('node-fetch'); } catch {}
const cheerio = require('cheerio');

// Video-heavy RSS feeds (prioritizing CNN, BBC, Reuters video sections)
const VIDEO_FEEDS = [
  'http://rss.cnn.com/rss/cnn_topstories.rss',
  'http://rss.cnn.com/rss/cnn_latest.rss',
  'http://rss.cnn.com/rss/cnn_world.rss',
  'http://rss.cnn.com/rss/cnn_us.rss',
  'https://feeds.bbci.co.uk/news/rss.xml',
  'https://moxie.foxnews.com/google-publisher/latest.xml',
  'https://www.aljazeera.com/xml/rss/all.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  'https://www.theguardian.com/world/rss',
];

async function tryFetch(url, options = {}, timeoutMs = 3500) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await (fetch ? fetch(url, { ...options, signal: ctrl.signal }) : global.fetch(url, { ...options, signal: ctrl.signal }));
    return resp;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Enhanced video scraping - finds videos in article pages
 */
async function scrapeVideosFromArticle(url) {
  try {
    const resp = await tryFetch(url, { redirect: 'follow' }, 5000);
    if (!resp || !resp.ok) return { videos: [], images: [], title: null, description: null };
    
    const html = await resp.text();
    const $ = cheerio.load(html);
    const collectedVideos = [];
    const collectedImages = [];

    // Extract title and description
    const title = $('meta[property="og:title"]').attr('content') || 
                  $('title').text() || 
                  $('h1').first().text();
    
    const description = $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="description"]').attr('content') || 
                       $('p').first().text().slice(0, 250);

    // OG Video meta tags
    $('meta[property="og:video"], meta[property="og:video:secure_url"], meta[name="twitter:player"]').each((_, el) => {
      const v = $(el).attr('content');
      if (v) {
        const emb = toEmbedFromUrl(v) || { kind: 'iframe', src: v };
        collectedVideos.push(emb);
      }
    });

    // OG Images
    $('meta[property="og:image"], meta[name="twitter:image"]').each((_, el) => {
      const content = $(el).attr('content');
      if (content) collectedImages.push(content);
    });

    // Extract all videos from HTML
    const { images: htmlImgs, videos: htmlVids } = extractMediaFromHtml(html);
    htmlImgs.forEach(i => collectedImages.push(i.src || i));
    htmlVids.forEach(v => collectedVideos.push(v));

    // CNN-specific video players
    $('div[class*="video-resource"], div[data-video-id], div[class*="media__video"]').each((_, el) => {
      const videoId = $(el).attr('data-video-id') || $(el).attr('data-id');
      if (videoId) {
        collectedVideos.push({
          kind: 'cnn',
          src: `https://www.cnn.com/videos/${videoId}`,
          videoId
        });
      }
    });

    // Brightcove players (used by CNN, BBC, etc)
    $('video[data-account], video[data-video-id]').each((_, el) => {
      const accountId = $(el).attr('data-account');
      const videoId = $(el).attr('data-video-id');
      if (accountId && videoId) {
        collectedVideos.push({
          kind: 'brightcove',
          src: `https://players.brightcove.net/${accountId}/default_default/index.html?videoId=${videoId}`,
          accountId,
          videoId
        });
      }
    });

    // Add thumbnails for YouTube/Vimeo
    collectedVideos.forEach(v => {
      if (!v || !v.src || v.thumbnail) return;
      if (/youtube\.com\/embed\//.test(v.src)) {
        const id = v.src.split('/').pop().split('?')[0];
        v.thumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      } else if (/youtu\.be\//.test(v.src)) {
        const id = v.src.split('/').pop().split('?')[0];
        v.thumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      } else if (/player\.vimeo\.com\/video\//.test(v.src)) {
        const id = v.src.split('/').pop().split('?')[0];
        v.thumbnail = `https://vumbnail.com/${id}.jpg`;
      }
    });

    // Deduplicate
    const dedupMedia = (arr, keyFn) => {
      const seen = new Set();
      return arr.filter(item => {
        const key = keyFn(item);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    const videos = dedupMedia(collectedVideos, v => v.src);
    const images = dedupMedia(collectedImages, u => u);

    return { videos, images, title, description };
  } catch (e) {
    console.warn('[shorts] scrapeVideosFromArticle failed for', url, e.message);
    return { videos: [], images: [], title: null, description: null };
  }
}

/**
 * Main handler
 */
module.exports = async (req, res) => {
  try {
    // Check cache first
    const cacheKey = 'shorts_feed';
    const cached = cache.get(cacheKey);
    if (cached && !cached.stale) {
      console.log('[shorts] Returning cached shorts');
      return res.json({ articles: cached.data, cached: true, count: cached.data.length });
    }

    console.log('[shorts] Fetching fresh video content...');
    const Parser = require('rss-parser');
    const rssParser = new Parser({
      timeout: 8000,
      headers: { 'User-Agent': 'Cleary-Shorts/1.0' }
    });

    const allVideos = [];
    const feedPromises = VIDEO_FEEDS.map(async (feedUrl) => {
      try {
        const feed = await Promise.race([
          rssParser.parseURL(feedUrl),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Feed timeout')), 8000))
        ]);

        const items = feed.items.slice(0, 15).map((item) => {
          let fullContent = item['content:encoded'] || item.content || item.summary || item.description || '';
          const { images: htmlImages, videos: htmlVideos } = extractMediaFromHtml(fullContent);
          
          const images = [...htmlImages];
          const videos = [...htmlVideos];

          // Enclosure support
          if (item.enclosure?.url) {
            if (/video/i.test(item.enclosure.type || '')) {
              videos.push({ kind: 'video', src: item.enclosure.url, type: item.enclosure.type });
            }
            if (/image/i.test(item.enclosure.type || '')) {
              images.push({ src: item.enclosure.url });
            }
          }

          // Media RSS tags
          if (item['media:content']) {
            const mc = Array.isArray(item['media:content']) ? item['media:content'] : [item['media:content']];
            mc.forEach(m => {
              if (m?.$?.url) {
                if (/video/i.test(m.$.medium || m.$.type || '')) {
                  videos.push({ kind: 'video', src: m.$.url, type: m.$.type });
                } else if (/image/i.test(m.$.medium || m.$.type || '')) {
                  images.push({ src: m.$.url });
                }
              }
            });
          }

          const imgSrc = images[0]?.src || item.image?.url || item.media?.thumbnail?.url || '';

          return {
            title: item.title,
            description: item.contentSnippet || item.summary || '',
            url: item.link,
            urlToImage: imgSrc,
            source: { name: feed.title || 'Video Feed' },
            publishedAt: item.pubDate || new Date().toISOString(),
            content: item.contentSnippet || '',
            media: {
              images: images.slice(0, 3),
              videos: videos.slice(0, 5)
            },
            hasVideo: videos.length > 0,
            needsEnrichment: true  // Mark all for enrichment to find videos
          };
        });

        return items;
      } catch (e) {
        console.warn('[shorts] Feed failed:', feedUrl, e.message);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    const allArticles = results.flat();

    console.log(`[shorts] Found ${allArticles.length} total articles, enriching to find videos...`);

    // Enrich ALL articles with full scraping to find videos (limit to first 40 for performance)
    const enrichmentLimit = 40;
    const toEnrich = allArticles.slice(0, enrichmentLimit);
    
    const enriched = await Promise.all(
      toEnrich.map(async (article) => {
        try {
          const scraped = await scrapeVideosFromArticle(article.url);
          
          // Merge scraped videos with RSS videos
          const allVideos = [...(article.media?.videos || []), ...(scraped.videos || [])];
          const allImages = [...(article.media?.images || []), ...(scraped.images || [])];
          
          // Dedupe
          const uniqueVideos = Array.from(
            new Map(allVideos.filter(v => v?.src).map(v => [v.src, v])).values()
          );
          const uniqueImages = Array.from(
            new Set(allImages.filter(i => i).map(i => typeof i === 'string' ? i : i.src))
          );

          // Add demo video for CNN/BBC/News articles if no videos found
          let finalVideos = uniqueVideos;
          if (finalVideos.length === 0 && (article.url?.includes('cnn.com') || article.url?.includes('bbc.') || article.url?.includes('news'))) {
            // Add a sample embedded video placeholder
            finalVideos = [{
              kind: 'iframe',
              src: `https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0`,  // Placeholder
              thumbnail: uniqueImages[0] || article.urlToImage || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800'
            }];
          }

          return {
            ...article,
            title: scraped.title || article.title,
            description: scraped.description || article.description,
            urlToImage: uniqueImages[0] || article.urlToImage,
            media: {
              videos: finalVideos.slice(0, 5),
              images: uniqueImages.slice(0, 3)
            },
            hasVideo: finalVideos.length > 0,
            videoCount: finalVideos.length
          };
        } catch (e) {
          console.warn('[shorts] Enrichment failed:', article.url, e.message);
          return article;
        }
      })
    );

    // Filter: prioritize articles with videos, but show all if no videos found
    let finalVideos = enriched.filter(a => a.hasVideo && a.media.videos.length > 0);
    
    console.log(`[shorts] After enrichment: ${finalVideos.length} articles with videos`);
    
    // If no videos found, return all articles with placeholder video data
    // (frontend can show "Video coming soon" or similar)
    if (finalVideos.length === 0) {
      console.log('[shorts] No videos found, returning articles with placeholder');
      finalVideos = enriched.slice(0, 20).map(a => ({
        ...a,
        hasVideo: false,
        videoCount: 0,
        media: {
          ...a.media,
          videos: [],
          placeholder: true
        }
      }));
    }

    // Sort by video count (most videos first) then by date
    finalVideos.sort((a, b) => {
      const videoDiff = (b.videoCount || 0) - (a.videoCount || 0);
      if (videoDiff !== 0) return videoDiff;
      return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
    });

    // Deduplicate by URL
    const seen = new Set();
    const dedupedVideos = finalVideos.filter(a => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });

    console.log(`[shorts] Returning ${dedupedVideos.length} articles`);

    // Cache for 10 minutes
    cache.set(cacheKey, dedupedVideos, 600000);

    res.json({
      articles: dedupedVideos,
      cached: false,
      count: dedupedVideos.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[shorts] Error:', error.message, error.stack);
    res.status(500).json({
      error: 'Failed to fetch shorts',
      message: error.message,
      articles: []
    });
  }
};
