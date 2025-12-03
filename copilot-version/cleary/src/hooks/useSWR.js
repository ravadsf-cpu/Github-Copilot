import { useEffect, useMemo, useState } from 'react';
import { withSWR } from '../services/cache';

// Simple SWR hook: returns cached data immediately, then revalidates in background
export default function useSWR(key, fetcher, { staleMs = 180000, hardMs = 600000 } = {}) {
  const [{ data, promise }, setState] = useState(() => withSWR(key, fetcher, { staleMs, hardMs }));
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(!data);
    setError(null);
    promise
      .then((d) => { if (!mounted) return; setState({ data: d, promise: Promise.resolve(d) }); setLoading(false); })
      .catch((e) => { if (!mounted) return; setError(e); setLoading(false); });
    return () => { mounted = false; };
  }, [key]);

  const refresh = () => setState(withSWR(key + ':refresh:' + Date.now(), fetcher, { staleMs: 0, hardMs: 0 }));
  return useMemo(() => ({ data, loading, error, refresh }), [data, loading, error]);
}
