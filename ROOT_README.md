# Cleary News Platform - Dual Version Repository

This repository contains **two completely isolated versions** of the Cleary news application:

1. **Anti-Gravity Version** (Baseline) - `/anti-gravity-version/`
2. **GitHub Copilot Version** (Enhanced) - `/copilot-version/`

---

## 📁 Folder Structure

```
/
├── anti-gravity-version/       # Original baseline version
│   ├── api/                    # Serverless functions
│   ├── cleary/                 # React frontend
│   ├── package.json            # Root scripts (port 3001/5002)
│   ├── vercel.json             # Deployment config
│   └── README.md               # Version-specific docs
│
├── copilot-version/            # Enhanced GitHub Copilot version
│   ├── api/                    # Enhanced serverless functions
│   │   ├── cache/              # Cache management endpoints
│   │   ├── user/               # User interaction tracking
│   │   └── ...                 # Core news/shorts/auth APIs
│   ├── cleary/                 # Enhanced React frontend
│   ├── package.json            # Root scripts (port 3000/5001)
│   ├── vercel.json             # Deployment config
│   └── README.md               # Version-specific docs
│
└── README.md                   # This file
```

---

## 🚀 Quick Start

### Run Anti-Gravity Version (Port 3001)

```bash
cd anti-gravity-version
npm install
npm run dev
```

**Ports:**
- Frontend: http://localhost:3001
- Backend: http://localhost:5002

### Run GitHub Copilot Version (Port 3000)

```bash
cd copilot-version
npm install
npm run dev
```

**Ports:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

---

## 🎯 Version Comparison

| Feature | Anti-Gravity | GitHub Copilot |
|---------|-------------|----------------|
| **OAuth** | Basic | ✅ Robust server-side with fallback |
| **News Caching** | Standard | ✅ Smart TTL + force refresh |
| **Article Classification** | Basic | ✅ AI-powered left/center/right |
| **Personalization** | None | ✅ Interest-based scoring |
| **Shorts Feed** | Card grid | ✅ TikTok-style vertical scroll |
| **Video Handling** | Basic | ✅ Max 2:30, trim, autoplay |
| **Engagement** | Basic | ✅ Like/dislike/comments/share |
| **Backend Fallback** | Limited | ✅ Retry logic + graceful degradation |
| **User Tracking** | None | ✅ Click tracking for learning |

---

## 🔧 GitHub Copilot Version: New Features

### 1. **OAuth Fix with Fallback**
- Robust server-side Google OAuth
- Graceful error states when backend is down
- JWT session cookies with 7-day expiry
- Demo mode fallback

**Implementation:**
- `api/auth/google/login.js` - OAuth initiation
- `api/auth/google/callback.js` - Token exchange
- `api/auth/google/status.js` - Session validation

### 2. **Fresh News System**
- Force refresh parameter: `?forceRefresh=true`
- Smart caching with soft (3min) and hard (10min) TTL
- Stale-while-revalidate pattern
- Background cache refresh
- Manual cache clear endpoint: `POST /api/cache/clear`

**Usage:**
```bash
# Force fresh articles
curl "http://localhost:3000/api/news?category=breaking&forceRefresh=true"

# Clear cache (requires admin token)
curl -X POST "http://localhost:3000/api/cache/clear" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. **Article Classification (Left/Right/Center)**
Every article is tagged with political lean:
- `left`, `lean-left`, `center`, `lean-right`, `right`
- AI-powered detection using Gemini
- Confidence scores and reasoning
- Fallback to keyword-based heuristics

**Response:**
```json
{
  "title": "Breaking News...",
  "lean": "center",
  "leanScore": 0.12,
  "leanConfidence": 0.87,
  "leanReasons": ["Neutral language", "Balanced sourcing"]
}
```

### 4. **Personalization for New Users**
Tracks user interactions and adapts feed:

**Automatic Learning:**
- Monitors article clicks, likes, shares
- Extracts topic keywords from engaged content
- Tracks lean preference distribution
- Builds interest profile after first 5+ clicks

**API Endpoints:**
```bash
# Track click
POST /api/user/interactions
{
  "userId": "user123",
  "articleId": "article-url",
  "action": "click",
  "metadata": {
    "title": "AI Breakthrough...",
    "lean": "center"
  }
}

# Get user profile
GET /api/user/interactions?userId=user123
```

**Personalized Feed:**
```bash
# Request personalized news
curl "http://localhost:3000/api/news?personalized=true&interests=ai,economy,climate&userLean=center"
```

**Scoring Model:**
- **Recency**: Linear decay over 12 hours (0-1.0)
- **Video Boost**: +0.3 if video present
- **Interest Match**: +0.15 per matching keyword
- **Lean Alignment**: ±0.2 based on preference (reinforce/challenge/balanced)

### 5. **Shorts Page: Vertical Scrolling Feed**
Complete redesign from card grid to TikTok-style:

**Features:**
- ✅ Vertical full-screen snap scrolling
- ✅ Max 2:30 video duration enforced
- ✅ Autoplay with trim controls (start/end seconds)
- ✅ Like/dislike/comment system
- ✅ **Share button** (Web Share API + clipboard fallback)
- ✅ Keyboard navigation (↑/↓ arrows)
- ✅ Engagement persistence in localStorage
- ✅ Lazy loading & prefetch

**Component:**
- `cleary/src/pages/ShortsPage.jsx` - Feed wrapper
- `cleary/src/components/ShortFeedCard.jsx` - Individual short

**Share Implementation:**
```javascript
// Shares via native dialog or copies to clipboard
handleShare = async () => {
  if (navigator.share) {
    await navigator.share({ title, text, url });
  } else {
    await navigator.clipboard.writeText(url);
    alert('Link copied!');
  }
};
```

### 6. **Backend Enhancements**

**New Endpoints:**
- `GET /api/news` - Enhanced with personalization params
- `POST /api/cache/clear` - Manual cache invalidation
- `POST /api/user/interactions` - Track clicks/likes
- `GET /api/user/interactions` - Get user profile
- `GET /api/shorts` - Video-first content (unchanged)

**Retry Logic:**
Frontend automatically retries failed requests with exponential backoff (planned - see TODO).

**Structured Logging:**
All endpoints log cache hits/misses, enrichment stats, timing.

---

## 📦 Installation

### Prerequisites
- Node.js 18+ (both versions)
- npm or yarn
- Vercel CLI (optional, for deployment)

### Install Dependencies

**Anti-Gravity Version:**
```bash
cd anti-gravity-version
npm install
cd cleary && npm install
```

**Copilot Version:**
```bash
cd copilot-version
npm install
cd cleary && npm install
```

---

## 🌐 Deployment

Both versions can be deployed independently to Vercel.

### Deploy Anti-Gravity Version

```bash
cd anti-gravity-version
vercel --prod
```

**Environment Variables:**
```env
GEMINI_API_KEY=your-api-key
APP_SESSION_SECRET=your-session-secret
GOOGLE_OAUTH_CLIENT_ID=your-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REDIRECT=https://your-domain.vercel.app/api/auth/google/callback
```

### Deploy Copilot Version

```bash
cd copilot-version
vercel --prod
```

**Additional Environment Variables:**
```env
# Same as above, plus:
ADMIN_TOKEN=your-cache-clear-token
```

**Important:** Update Google OAuth redirect URIs in Google Cloud Console for each deployment.

---

## 🧪 Testing Plan

### OAuth Testing
1. **Happy Path:** Login → callback → session cookie set
2. **Backend Down:** Fallback to demo mode
3. **Invalid Token:** Graceful error message
4. **Token Refresh:** Re-login after 7 days

### News Freshness Testing
1. **Cache Hit:** Articles served instantly (<50ms)
2. **Cache Miss:** Fresh fetch within 2-5s
3. **Force Refresh:** Bypasses cache, updates cache
4. **Stale Serve:** Returns old + refreshes background

### Personalization Testing
1. **New User:** Generic feed (no personalization)
2. **After 5 Clicks:** Profile built, interests extracted
3. **Left-Leaning User:** More left articles in reinforce mode
4. **Interest Match:** "AI" keyword → AI articles boosted
5. **Video Preference:** Users who watch videos get more video content

### Shorts Feed Testing
1. **Vertical Scroll:** Snap to each video
2. **Max Duration:** Videos >2:30 trimmed or skipped
3. **Autoplay:** Starts on active card
4. **Share:** Native dialog or clipboard
5. **Engagement:** Like/comment persists across sessions
6. **Trim Controls:** Start/end sliders work, persist

---

## 🔒 Security Notes

- JWT tokens stored in HttpOnly cookies only
- OAuth state parameter validates CSRF
- Admin cache clear requires Bearer token
- User interactions stored per-user (no cross-contamination)
- No sensitive data logged to console

---

## 🚧 TODO / Future Improvements

### Anti-Gravity Version
- Maintain baseline functionality
- Minimal changes for stability

### Copilot Version
- [ ] Add frontend retry wrapper with exponential backoff
- [ ] Persist user interactions to database (currently file-based)
- [ ] Add rate limiting to interaction endpoints
- [ ] Implement A/B testing framework
- [ ] Add analytics dashboard for personalization metrics
- [ ] WebSocket support for real-time article updates
- [ ] Progressive Web App (PWA) offline support

---

## 📝 Contributing

When making changes:
1. **Choose the correct version folder**
2. **Never mix files between versions**
3. **Test independently** in each environment
4. **Update this README** if adding new features

---

## 📄 License

Proprietary / All rights reserved

---

## 🤝 Support

For questions or issues:
- Anti-Gravity Version: Contact original development team
- GitHub Copilot Version: Review `/copilot-version/README.md`

---

## 🎓 Learning Resources

**Copilot Version Technologies:**
- React 18 + Hooks
- Framer Motion (animations)
- Cheerio (web scraping)
- RSS Parser
- Google Gemini AI
- JWT authentication
- Vercel serverless functions

**Key Files to Study:**
- `copilot-version/api/news.js` - Personalization logic
- `copilot-version/api/_lib/cache.js` - Smart caching
- `copilot-version/cleary/src/components/ShortFeedCard.jsx` - Shorts UI
- `copilot-version/api/user/interactions.js` - User tracking

---

**Last Updated:** November 30, 2025  
**Repository:** Github-Copilot  
**Maintainer:** Development Team
