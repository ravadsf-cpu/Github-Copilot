/**
 * Retry Fetch Utility
 * Implements exponential backoff for API requests
 */

const DEFAULT_OPTIONS = {
  maxRetries: 3,
  initialDelay: 500,
  maxDelay: 5000,
  backoffFactor: 2,
  timeout: 10000
};

/**
 * Fetch with automatic retry and exponential backoff
 * @param {string} url - URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {Object} retryOptions - Retry configuration
 * @returns {Promise<Response>}
 */
export async function fetchWithRetry(url, options = {}, retryOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...retryOptions };
  let lastError;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Consider 5xx as retryable, but not 4xx client errors
      if (response.ok || response.status < 500) {
        return response;
      }

      throw new Error(`Server error: ${response.status} ${response.statusText}`);

    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors or aborted requests (except timeout)
      if (error.name === 'AbortError') {
        console.warn(`[fetchWithRetry] Timeout on attempt ${attempt + 1}/${config.maxRetries + 1}`);
      } else if (error.message.includes('404') || error.message.includes('400')) {
        throw error; // Don't retry client errors
      }

      // Last attempt, throw error
      if (attempt === config.maxRetries) {
        console.error(`[fetchWithRetry] All ${config.maxRetries + 1} attempts failed for ${url}`);
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffFactor, attempt),
        config.maxDelay
      );

      console.warn(
        `[fetchWithRetry] Attempt ${attempt + 1}/${config.maxRetries + 1} failed, ` +
        `retrying in ${delay}ms...`,
        error.message
      );

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Fetch JSON with retry
 * @param {string} url - URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {Object} retryOptions - Retry configuration
 * @returns {Promise<any>}
 */
export async function fetchJSON(url, options = {}, retryOptions = {}) {
  const response = await fetchWithRetry(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }, retryOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Example usage for news API
 */
export async function fetchNews(params = {}, retryOptions = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `/api/news${queryString ? '?' + queryString : ''}`;
  
  return fetchJSON(url, {}, {
    maxRetries: 2,
    initialDelay: 1000,
    ...retryOptions
  });
}

/**
 * Example usage for shorts API
 */
export async function fetchShorts(retryOptions = {}) {
  return fetchJSON('/api/shorts', {}, {
    maxRetries: 2,
    initialDelay: 1000,
    timeout: 15000, // Shorts take longer
    ...retryOptions
  });
}

/**
 * Track user interaction with retry
 */
export async function trackInteraction(userId, articleId, action, metadata = {}) {
  return fetchJSON('/api/user/interactions', {
    method: 'POST',
    body: JSON.stringify({ userId, articleId, action, metadata })
  }, {
    maxRetries: 1, // Don't retry interactions too much
    initialDelay: 500
  });
}

export default {
  fetchWithRetry,
  fetchJSON,
  fetchNews,
  fetchShorts,
  trackInteraction
};
