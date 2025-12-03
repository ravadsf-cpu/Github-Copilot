# Neon Futurism UI – Components and Usage

This folder contains immersive, animated UI components for the News App.

## Components

- `TrendingTicker` – Breaking news marquee ticker with hover bounce
- `ArticleCardNeon` – Neon-glow immersive article card with tilt and microinteractions
- `ShortsVideo` – TikTok/Shorts-style autoplay video with overlays
- `ui/LikeButton` – Heart with burst particles
- `ui/BookmarkButton` – Bookmark with fly-away animation
- `hooks/useInView` – Observe element visibility
- `hooks/useInfiniteScroll` – Trigger load-more when sentinel enters viewport

## Theme

Neon-dark theme tokens are defined in `src/index.css`:

- LEFT: `--neon-blue: #3B82F6`
- RIGHT: `--neon-red: #EF4444`
- CENTER: `--neon-gold: #FBBF24`

Helper classes:
- `.lean-left-glow`, `.lean-right-glow`, `.lean-center-glow`

## Examples

### TrendingTicker
```jsx
import TrendingTicker from '../components/TrendingTicker';

<TrendingTicker
  headlines={["Breaking: Senate passes bill", "Markets surge on CPI"]}
  onClickHeadline={(h) => console.log('open', h)}
/>
```

### ArticleCardNeon
```jsx
import ArticleCardNeon from '../components/ArticleCardNeon';

<ArticleCardNeon
  title="Breaking News Headline"
  snippet="Summary of the article..."
  source="CNN"
  leaning="left" // 'left'|'lean-left'|'center'|'lean-right'|'right'
  publishedAt="5m ago"
  image="https://source.unsplash.com/random/800x600?news"
  onClick={() => openArticle(articleId)}
/>
```

### ShortsVideo
```jsx
import ShortsVideo from '../components/ShortsVideo';

<ShortsVideo
  videoUrl="/short.mp4"
  duration={150}
  title="Breaking Video News"
  source="BBC"
  onLike={() => {/* handle like */}}
  onShare={() => {/* handle share */}}
/>
```

### Like and Bookmark
```jsx
import LikeButton from '../components/ui/LikeButton';
import BookmarkButton from '../components/ui/BookmarkButton';

<LikeButton liked={liked} count={12} onToggle={() => setLiked(v=>!v)} />
<BookmarkButton saved={saved} onToggle={() => setSaved(v=>!v)} />
```

### Infinite Scroll Sentinel
```jsx
import useInfiniteScroll from '../hooks/useInfiniteScroll';

useInfiniteScroll({ sentinelId: 'feed-sentinel', onLoadMore: loadNextPage });

<div id="feed-sentinel" className="h-1" />
```

## Integration Notes

- `FeedPage.jsx` includes the `TrendingTicker` and showcases the first 3 cards using `ArticleCardNeon`.
- `ShortsPage.jsx` already implements a vertical, snap-based shorts feed via `ShortFeedCard`. `ShortsVideo` demonstrates the minimal core mechanics if you prefer a simpler component.
- Tailwind is active via `index.css`. Glow helpers and neon tokens are ready.

## Accessibility

- Buttons include `aria-pressed` and operate via click/tap.
- High-contrast neon colors are used on dark backgrounds; adjust as needed in `index.css`.

## Performance

- Animations favor GPU-friendly transforms.
- Infinite scroll uses `IntersectionObserver` with a large root margin.
- Images/videos should be lazy loaded via browser defaults.