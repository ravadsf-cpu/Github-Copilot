import { useEffect } from 'react';

export default function useInfiniteScroll({ sentinelId, onLoadMore, enabled = true }) {
  useEffect(() => {
    if (!enabled) return;
    const el = document.getElementById(sentinelId);
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) onLoadMore && onLoadMore();
      });
    }, { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [sentinelId, onLoadMore, enabled]);
}
