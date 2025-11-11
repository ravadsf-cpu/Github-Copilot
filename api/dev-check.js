(async () => {
  const s = require('./_lib/shared');
  const arts = await s.fetchFromRSS('breaking');
  const out = arts.slice(0, 10).map(a => ({
    title: (a.title || '').slice(0, 50),
    urlToImage: a.urlToImage || null,
    images: (a.media && a.media.images ? a.media.images.length : 0),
    videos: (a.media && a.media.videos ? a.media.videos.length : 0),
    source: a.source && a.source.name
  }));
  console.log(JSON.stringify(out, null, 2));
})();