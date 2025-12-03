# REST API Contracts

Complete TypeScript-style API specifications for all endpoints.

## 3. REST API CONTRACTS

### Authentication Endpoints

#### POST /api/auth/google/login
**Description:** Initiate OAuth flow with Google

**Request:**
```typescript
// No body required
GET /api/auth/google/login
```

**Response (Success 200):**
```typescript
{
  url: string;           // Google OAuth consent URL
  state: string;         // CSRF token
}
```

**Response (Error 500):**
```typescript
{
  error: string;
  message: string;
}
```

**Retry Behavior:** No retry (user-initiated action)

**Fallback:** Show "Continue as Guest" button

---

#### GET /api/auth/google/callback
**Description:** OAuth callback handler

**Request:**
```typescript
GET /api/auth/google/callback?code=xxx&state=yyy
```

**Response (Success 302):**
- Sets `cleary_session` cookie (HttpOnly, Secure, 7-day expiry)
- Redirects to `/` with success message

**Response (Error 400):**
```typescript
{
  error: 'Invalid request',
  message: 'Missing code or state parameter'
}
```

**Response (Error 401):**
```typescript
{
  error: 'Authentication failed',
  message: 'Invalid authorization code'
}
```

**Retry Behavior:** User must re-initiate OAuth flow

**Fallback:** Redirect to `/login?error=auth_failed`

---

#### GET /api/auth/google/status
**Description:** Check current session status

**Request:**
```typescript
GET /api/auth/google/status
Headers:
  Cookie: cleary_session=jwt_token
```

**Response (Authenticated 200):**
```typescript
{
  authenticated: true;
  user: {
    id: string;
    email: string;
    name: string;
    picture: string;
  };
  expiresAt: string; // ISO timestamp
}
```

**Response (Unauthenticated 401):**
```typescript
{
  authenticated: false;
  message: 'No valid session';
}
```

**Retry Behavior:** No retry on 401 (redirect to login)

**Fallback:** Demo mode

---

### News Endpoints

#### GET /api/news
**Description:** Fetch articles with optional personalization

**Request:**
```typescript
GET /api/news?category=breaking&preference=balanced&personalized=true&interests=ai,economy&userLean=center&forceRefresh=false&includeTrending=true

Query Parameters:
{
  category?: 'breaking' | 'politics' | 'technology' | 'sports' | 'business';
  preference?: 'balanced' | 'reinforce' | 'challenge';
  personalized?: 'true' | 'false';
  interests?: string; // Comma-separated keywords
  userLean?: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right';
  forceRefresh?: 'true' | 'false';
  includeTrending?: 'true' | 'false';
  query?: string; // Search filter
}
```

**Response (Success 200):**
```typescript
{
  articles: Article[];
  trending?: TrendingTopic[];
  cached: boolean;
  personalized: boolean;
  interests: string[];
  forceRefreshed: boolean;
  cacheStats: {
    entries: number;
    trending: 'cached' | 'empty';
    trendingAge: number;
  };
}

interface Article {
  id: string;
  title: string;
  url: string;
  urlToImage: string;
  source: {
    name: string;
  };
  publishedAt: string; // ISO timestamp
  description: string;
  content: string;
  contentHtml?: string;
  
  // Classification
  lean: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right';
  leanScore: number; // -1.0 to 1.0
  leanConfidence: number; // 0.0 to 1.0
  leanReasons: string[];
  
  // Metadata
  category: string;
  readTime: number; // minutes
  
  // Media
  media: {
    images: Array<{ src: string; alt?: string }>;
    videos: Array<{
      kind: 'youtube' | 'vimeo' | 'iframe' | 'video';
      src: string;
      thumbnail?: string;
    }>;
  };
  
  // Personalization (if personalized=true)
  personalization?: {
    score: number;
    components: {
      recency: number;
      video: number;
      interests: number;
      leanAlignment: number;
      matches: string[];
    };
  };
}

interface TrendingTopic {
  topic: string;
  count: number;
  articles: string[]; // Article IDs
}
```

**Response (Error 500):**
```typescript
{
  error: 'Failed to fetch news';
  message: string;
  articles: [];
  trending: [];
}
```

**Retry Behavior:**
- Retry 3 times with exponential backoff (500ms, 1s, 2s)
- On final failure, show cached data if available

**Fallback Rules:**
- If backend down: serve stale cache (if <10min old)
- If cache empty: show error page with retry button
- If AI classification fails: use keyword fallback
- If no articles: show "No articles available" placeholder

---

#### GET /api/article
**Description:** Fetch single article with full content

**Request:**
```typescript
GET /api/article?url=https://example.com/article

Query Parameters:
{
  url: string; // Article URL (URL-encoded)
}
```

**Response (Success 200):**
```typescript
{
  article: Article; // Same structure as /api/news
}
```

**Response (Error 404):**
```typescript
{
  error: 'Article not found';
  message: string;
}
```

**Retry Behavior:** Retry 2 times, 1s apart

**Fallback:** Redirect to original article URL

---

### Personalization Endpoints

#### POST /api/user/interactions
**Description:** Track user engagement (clicks, likes, shares)

**Request:**
```typescript
POST /api/user/interactions
Content-Type: application/json

Body:
{
  userId: string;
  articleId: string;
  articleUrl: string;
  action: 'click' | 'like' | 'dislike' | 'share' | 'view';
  metadata?: {
    title?: string;
    lean?: string;
    category?: string;
    duration?: number; // seconds
    scrollDepth?: number; // percentage
  };
}
```

**Response (Success 200):**
```typescript
{
  success: true;
  message: 'Interaction tracked';
  userId: string;
  action: string;
}
```

**Response (Error 400):**
```typescript
{
  error: 'Missing required fields';
  required: ['articleId', 'action'];
}
```

**Response (Error 500):**
```typescript
{
  error: 'Failed to process interaction';
  message: string;
}
```

**Retry Behavior:** Retry once after 500ms

**Fallback:** Queue in localStorage, sync when online

---

#### GET /api/user/interactions
**Description:** Retrieve user profile and interaction history

**Request:**
```typescript
GET /api/user/interactions?userId=user123

Query Parameters:
{
  userId?: string; // Defaults to 'anonymous'
}
```

**Response (Success 200):**
```typescript
{
  userId: string;
  stats: {
    totalClicks: number;
    totalLikes: number;
    totalShares: number;
  };
  interests: string[]; // Top 10 keywords
  dominantLean: 'left' | 'center' | 'right';
  leanDistribution: {
    left: number;
    center: number;
    right: number;
  };
}
```

**Response (Error 500):**
```typescript
{
  error: 'Failed to retrieve profile';
  message: string;
}
```

**Retry Behavior:** No retry (read-only)

**Fallback:** Return empty profile

---

### Shorts Endpoints

#### GET /api/shorts
**Description:** Fetch video-first news content

**Request:**
```typescript
GET /api/shorts

// No query parameters currently
```

**Response (Success 200):**
```typescript
{
  articles: ShortArticle[];
  cached: boolean;
  count: number;
  timestamp: string; // ISO timestamp
}

interface ShortArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  source: {
    name: string;
  };
  publishedAt: string;
  content: string;
  
  // Video metadata
  hasVideo: boolean;
  videoCount: number;
  media: {
    videos: Array<{
      kind: string;
      src: string;
      thumbnail?: string;
      accountId?: string;
      videoId?: string;
    }>;
    images: string[];
    placeholder?: boolean; // True if no real videos found
  };
}
```

**Response (Error 500):**
```typescript
{
  error: 'Failed to fetch shorts';
  message: string;
  articles: [];
}
```

**Retry Behavior:** Retry 2 times, 1s apart

**Fallback:** Show cached shorts (if <10min old), or empty state

---

#### POST /api/shorts/share (Future)
**Description:** Track short share event

**Request:**
```typescript
POST /api/shorts/share
Content-Type: application/json

Body:
{
  shortId: string;
  userId?: string;
  platform: 'twitter' | 'facebook' | 'copy' | 'native';
}
```

**Response (Success 200):**
```typescript
{
  success: true;
  shareCount: number; // Updated count
}
```

---

### Cache Management Endpoints

#### POST /api/cache/clear
**Description:** Manually purge all caches (admin only)

**Request:**
```typescript
POST /api/cache/clear
Headers:
  Authorization: Bearer ADMIN_TOKEN
```

**Response (Success 200):**
```typescript
{
  success: true;
  message: 'Cache cleared successfully';
  beforeStats: {
    entries: number;
    trending: string;
  };
  afterStats: {
    entries: number;
    trending: string;
  };
  timestamp: string;
}
```

**Response (Error 401):**
```typescript
{
  error: 'Unauthorized';
  message: 'Valid admin token required';
}
```

**Response (Error 405):**
```typescript
{
  error: 'Method not allowed';
}
```

**Retry Behavior:** No retry (admin action)

**Fallback:** None

---

## Error Format Standards

All errors follow consistent structure:

```typescript
{
  error: string;        // Short error code
  message: string;      // Human-readable description
  details?: any;        // Optional additional context
  timestamp?: string;   // ISO timestamp
  requestId?: string;   // For debugging (future)
}
```

## HTTP Status Codes

| Code | Meaning | Retry? |
|------|---------|--------|
| 200 | Success | No |
| 400 | Bad Request (client error) | No |
| 401 | Unauthorized | No (redirect to login) |
| 403 | Forbidden | No |
| 404 | Not Found | No |
| 405 | Method Not Allowed | No |
| 429 | Too Many Requests | Yes (after delay) |
| 500 | Internal Server Error | Yes (3x) |
| 502 | Bad Gateway | Yes (3x) |
| 503 | Service Unavailable | Yes (3x) |
| 504 | Gateway Timeout | Yes (3x) |

## Retry Strategy

Default exponential backoff:
```typescript
const delays = [500, 1000, 2000]; // ms
for (let attempt = 0; attempt <= maxRetries; attempt++) {
  try {
    return await fetch(url);
  } catch (error) {
    if (attempt === maxRetries) throw error;
    await sleep(delays[attempt]);
  }
}
```

Jitter (optional):
```typescript
const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
```

## Rate Limiting (Future)

Suggested limits:
- `/api/news`: 60 requests/minute per IP
- `/api/user/interactions`: 100 requests/minute per user
- `/api/cache/clear`: 10 requests/hour (admin only)

Headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1701360000
```

## CORS Policy

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

Production: Restrict origin to specific domains

## Caching Headers

### Static Assets
```
Cache-Control: public, max-age=31536000, immutable
```

### API Responses
```
Cache-Control: no-store
```
(Caching handled server-side, client always fetches fresh)

### HTML
```
Cache-Control: no-cache
```
(Always revalidate to avoid stale SPA)

---

**Next:** Classifier implementation and personalization engine code.
