# System Architecture Documentation

## 1. Architecture Diagram (Written Description)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  React Web App (Port 3000)                                       │
│  ├── Landing Page                                                │
│  ├── News Feed (Personalized)                                    │
│  ├── Shorts Feed (TikTok-style)                                  │
│  ├── Article Detail                                              │
│  └── Auth Components (OAuth)                                     │
│                                                                   │
│  Components:                                                      │
│  - fetchWithRetry.js (exponential backoff)                       │
│  - ErrorBoundary (graceful fallbacks)                            │
│  - ServiceWorker (offline cache)                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  Vercel Serverless Functions (Node.js 18)                        │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Authentication Service                                      │  │
│  │ ├── /api/auth/google/login                                 │  │
│  │ ├── /api/auth/google/callback                              │  │
│  │ └── /api/auth/google/status                                │  │
│  │                                                              │  │
│  │ Features:                                                    │  │
│  │ - JWT session management (7-day expiry)                     │  │
│  │ - OAuth2 flow with Google                                   │  │
│  │ - CSRF protection (state parameter)                         │  │
│  │ - Fallback to demo mode                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ News Service                                                │  │
│  │ ├── /api/news (main feed)                                  │  │
│  │ ├── /api/news-fast (minimal processing)                    │  │
│  │ └── /api/article (single article detail)                   │  │
│  │                                                              │  │
│  │ Features:                                                    │  │
│  │ - RSS aggregation (CNN, BBC, NYT, etc.)                    │  │
│  │ - Full article scraping (Cheerio)                          │  │
│  │ - Media extraction (videos, images)                        │  │
│  │ - Political classification                                  │  │
│  │ - Personalization scoring                                   │  │
│  │ - Smart caching (3min/10min TTL)                           │  │
│  │ - Force refresh support                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Classification Service                                       │  │
│  │ ├── detectPoliticalLeanAI() - Gemini AI                    │  │
│  │ └── scoreLean() - Keyword fallback                         │  │
│  │                                                              │  │
│  │ Classifies: LEFT | LEAN_LEFT | CENTER | LEAN_RIGHT | RIGHT │  │
│  │ Returns: { label, score, confidence, reasons }             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Personalization Service                                      │  │
│  │ ├── /api/user/interactions (track clicks)                  │  │
│  │ └── applyPersonalization() - Dynamic ranking               │  │
│  │                                                              │  │
│  │ Scoring:                                                     │  │
│  │ - Recency (12h decay)                                       │  │
│  │ - Interest match (keyword overlap)                          │  │
│  │ - Lean alignment (reinforce/challenge)                      │  │
│  │ - Video presence boost                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Shorts Service                                               │  │
│  │ └── /api/shorts (video feed)                               │  │
│  │                                                              │  │
│  │ Features:                                                    │  │
│  │ - Video-first RSS filtering                                 │  │
│  │ - Max 2:30 duration enforcement                             │  │
│  │ - Thumbnail generation                                       │  │
│  │ - Engagement tracking                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Cache Management                                             │  │
│  │ └── /api/cache/clear (admin only)                          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      CACHING LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  In-Memory Cache (ArticleCache class)                            │
│  ├── Soft TTL: 3 minutes                                         │
│  ├── Hard TTL: 10 minutes                                        │
│  ├── Stale-while-revalidate pattern                              │
│  └── Background refresh with locks                               │
│                                                                   │
│  Future: Redis/Upstash                                            │
│  ├── Distributed caching                                          │
│  ├── Persistent storage                                           │
│  └── Cross-instance sharing                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA STORAGE LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Current: File-based (/tmp/user-interactions.json)               │
│  ├── User profiles                                                │
│  ├── Click tracking                                               │
│  └── Interest extraction                                          │
│                                                                   │
│  Recommended: Supabase PostgreSQL                                 │
│  ├── Users table                                                  │
│  ├── Articles table                                               │
│  ├── Interactions table                                           │
│  ├── Classifications table                                        │
│  └── Shorts table                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────┤
│  Google OAuth2                                                    │
│  ├── Authorization endpoint                                       │
│  ├── Token exchange                                               │
│  └── User profile API                                             │
│                                                                   │
│  Google Gemini AI                                                 │
│  ├── Political classification                                     │
│  ├── Trending topic detection                                     │
│  └── Content summarization                                        │
│                                                                   │
│  RSS Feeds (External News Sources)                                │
│  ├── CNN, BBC, NYT, Reuters, Fox, Al Jazeera                     │
│  ├── RSS Parser library                                           │
│  └── Fallback on timeout                                          │
└─────────────────────────────────────────────────────────────────┘

## Flow Diagrams

### A. Fresh Article Pipeline

1. Client requests: GET /api/news?forceRefresh=true
2. API checks forceRefresh flag → skip cache
3. Fetch from RSS feeds (parallel, 8s timeout)
4. Parse articles → extract title, description, URL
5. Enrich articles (parallel, concurrency=8):
   - Scrape full content (Cheerio)
   - Extract media (videos, images)
   - Classify political lean (AI + fallback)
   - Detect trending topics
6. Deduplicate by URL
7. Diversify sources (max 5 per source)
8. Filter incomplete articles
9. Sort: videos first, then by date
10. Cache results (10min TTL)
11. Return to client

### B. New User Personalization Flow

**Phase 1: Cold Start (0-4 clicks)**
- User sees generic feed (recency-based)
- No personalization applied
- Track clicks: POST /api/user/interactions

**Phase 2: Profile Building (5+ clicks)**
- Backend extracts keywords from clicked titles
- Count lean distribution (left/center/right)
- Build interest set (words >4 chars)
- Store in user profile

**Phase 3: Personalized Feed (ongoing)**
1. Client requests: GET /api/news?personalized=true&interests=ai,economy
2. Fetch base articles from cache
3. Score each article:
   - Recency: age-based decay (0-1)
   - Interest match: +0.15 per keyword
   - Lean alignment: ±0.2 based on preference
   - Video boost: +0.3 if video present
4. Sort by total score (descending)
5. Return personalized feed

**Phase 4: Continuous Learning**
- Every click updates interest set
- Lean distribution refined
- Personalization improves over time

### C. OAuth Flow + Fallback

**Happy Path:**
1. User clicks "Sign In with Google"
2. Frontend: GET /api/auth/google/login
3. Backend generates state token, returns consent URL
4. User redirects to Google OAuth
5. User authorizes
6. Google redirects: GET /api/auth/google/callback?code=XXX&state=YYY
7. Backend validates state, exchanges code for tokens
8. Backend creates JWT, sets HttpOnly cookie
9. Redirect to app with success message
10. Frontend checks session: GET /api/auth/google/status

**Backend Down Fallback:**
1. Frontend detects /api/auth/google/login fails (timeout)
2. Show error: "Authentication unavailable"
3. Offer "Continue as Guest" (demo mode)
4. Store demoMode=true in localStorage
5. Retry auth every 60s in background
6. When backend recovers, show "Sign in now available"

**Token Expiry Recovery:**
1. API returns 401 Unauthorized
2. Frontend intercepts error
3. Clear session cookie + localStorage
4. Redirect to /login with message "Session expired"
5. User re-authenticates

### D. Shorts Feed Rendering

1. User navigates to /shorts
2. Fetch: GET /api/shorts
3. Receive array of video articles
4. Render vertical scroll container (CSS snap)
5. Load first video only (lazy load rest)
6. IntersectionObserver detects active card
7. Autoplay active video
8. Pause when scrolled away
9. Track engagement (like/share) in localStorage
10. Prefetch next 3 videos on scroll
11. Share button: navigator.share() or clipboard

## Failure Modes & Recovery

### 1. RSS Feeds Timeout
- **Problem:** External feed unreachable
- **Detection:** 8s timeout per feed
- **Recovery:** 
  - Skip failed feed
  - Continue with available feeds
  - Log warning
  - Return partial results

### 2. AI Classification Unavailable
- **Problem:** Gemini API key invalid or rate limited
- **Detection:** API returns 4xx/5xx
- **Recovery:**
  - Fallback to keyword-based scoreLean()
  - Tag with lower confidence
  - Continue pipeline

### 3. Cache Corruption
- **Problem:** Invalid JSON in cache
- **Detection:** JSON.parse throws
- **Recovery:**
  - Clear cache entry
  - Fetch fresh data
  - Log error

### 4. Database Down (Future)
- **Problem:** PostgreSQL connection fails
- **Detection:** Connection timeout
- **Recovery:**
  - Fallback to in-memory storage
  - Queue writes for retry
  - Alert monitoring

### 5. Client Network Issues
- **Problem:** Intermittent connectivity
- **Detection:** fetch() rejects
- **Recovery:**
  - Retry with exponential backoff (3 attempts)
  - Show cached data if available
  - Display offline indicator

## Security Architecture

### Authentication
- OAuth2 Authorization Code Flow (PKCE not required for server-side)
- State parameter prevents CSRF
- JWT stored in HttpOnly cookie (XSS protection)
- 7-day expiry with refresh on activity
- Secure + SameSite=Lax flags

### Authorization
- Cache clear endpoint requires Bearer token
- Admin token stored in env vars
- Rate limiting (future): 100 req/min per IP

### Data Privacy
- No PII stored except OAuth ID
- User interactions anonymous by default
- Can delete profile: DELETE /api/user/interactions?userId=XXX

### Content Security
- CSP headers on frontend
- HTTPS only in production
- No eval() or inline scripts
- External resources via iframe sandbox

## Performance Optimizations

### Caching Strategy
- L1: Browser cache (service worker)
- L2: In-memory server cache (3-10min)
- L3: CDN cache (future, Vercel Edge)

### Lazy Loading
- Shorts: Load 1 initially, prefetch next 3
- Images: Intersection observer
- Routes: React.lazy() code splitting

### Compression
- Gzip response bodies
- Image optimization (WebP)
- Minified JS/CSS

### Concurrency
- RSS fetching: Parallel with Promise.all()
- Article enrichment: Worker pool (8 concurrent)
- API calls: Retry with jitter

## Monitoring & Observability

### Metrics (Future)
- Request latency (p50, p95, p99)
- Cache hit ratio
- Error rate per endpoint
- Personalization accuracy

### Logging
- Structured JSON logs
- Cache HIT/MISS labels
- Timing information
- Error stack traces

### Alerts (Future)
- Error rate >5%
- Latency >5s
- Cache hit ratio <60%
- OAuth failures >10/hr

## Scalability Considerations

### Current (Hobby Plan)
- Serverless functions (auto-scale)
- In-memory cache (per-instance)
- File-based storage (ephemeral)
- Suitable for <10k users

### Future (Production)
- Redis for distributed cache
- PostgreSQL for persistence
- Read replicas for queries
- CDN for static assets
- Handles 100k+ users

---

**Next:** Database schemas, API contracts, and implementation code.
