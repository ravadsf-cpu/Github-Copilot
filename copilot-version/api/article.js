const { toEmbedFromUrl } = require('./_lib/shared');
const sanitizeHtml = require('sanitize-html');
let fetch;
try { fetch = require('node-fetch'); } catch { /* Vercel Node 18 has global fetch */ }

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Support POST for summary generation
    if (req.method === 'POST') {
      const { summarizeWithAI } = require('./_lib/shared');
      let body = {};
      try { body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}'); } catch {}
      const { title, content } = body || {};
      const text = [title || '', content || ''].join('\n\n').trim();
      if (!text) return res.status(400).json({ error: 'Missing content to summarize' });
      const summary = await summarizeWithAI(text, 220);
      return res.status(200).json({ summary });
    }

    const url = req.query.url || req.query.u;
    if (!url) return res.status(400).json({ error: 'Missing url parameter' });

    const resp = await (fetch ? fetch(url, { redirect: 'follow' }) : global.fetch(url));
    if (!resp || !resp.ok) {
      return res.status(502).json({ error: `Failed to fetch article: ${resp && resp.status}` });
    }
    const html = await resp.text();

    // Lazy-load cheerio to keep cold start minimal
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);

    const images = [];
    const videos = [];

    // Open Graph and Twitter cards
    $('meta[property="og:image"], meta[name="og:image"]').each((_, el) => {
      const src = $(el).attr('content');
      if (src) images.push({ src });
    });
    $('meta[property="twitter:image"], meta[name="twitter:image"]').each((_, el) => {
      const src = $(el).attr('content');
      if (src) images.push({ src });
    });

    // OG video
    $('meta[property="og:video"], meta[property="og:video:secure_url"]').each((_, el) => {
      const src = $(el).attr('content');
      if (src) {
        const emb = toEmbedFromUrl(src) || { kind: 'iframe', src };
        videos.push(emb);
      }
    });
    // Twitter player
    $('meta[name="twitter:player"]').each((_, el) => {
      const src = $(el).attr('content');
      if (src) videos.push({ kind: 'iframe', src });
    });

    // Iframes in content
    $('iframe').each((_, el) => {
      const src = $(el).attr('src');
      if (src) {
        const emb = toEmbedFromUrl(src) || { kind: 'iframe', src };
        videos.push(emb);
      }
    });
    // Video tags
    $('video').each((_, el) => {
      const src = $(el).attr('src');
      if (src) {
        const emb = toEmbedFromUrl(src) || { kind: 'video', src };
        videos.push(emb);
      }
      $(el).find('source').each((__, se) => {
        const s = $(se).attr('src');
        const t = $(se).attr('type');
        if (s) videos.push({ kind: 'video', src: s, type: t });
      });
    });

    // Anchor links to YouTube/Vimeo
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      const emb = toEmbedFromUrl(href);
      if (emb) videos.push(emb);
    });

    // Basic content extraction (optional)
    let contentHtml = '';
    const articleEl = $('article');
    if (articleEl.length) {
      contentHtml = sanitizeHtml(articleEl.html() || '', {
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
      });
    } else {
      const mainEl = $('main');
      if (mainEl.length) {
        contentHtml = sanitizeHtml(mainEl.html() || '', {
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
        });
      }
    }

    // Dedup by src
    const dedupBySrc = (arr) => {
      const seen = new Set();
      return arr.filter(x => {
        const key = (typeof x === 'string') ? x : x.src;
        if (!key || seen.has(key)) return false;
        seen.add(key); return true;
      });
    };

    res.status(200).json({
      media: {
        images: dedupBySrc(images),
        videos: dedupBySrc(videos),
      },
      contentHtml
    });
  } catch (err) {
    console.error('Article scrape error:', err);
    res.status(500).json({ error: 'Failed to enrich article' });
  }
};
