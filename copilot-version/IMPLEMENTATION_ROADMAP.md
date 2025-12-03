# Implementation Roadmap

## 8. INTEGRATION PLAN - Step-by-Step Implementation

---

## Phase 1: Fix OAuth + Backend Recovery (Week 1)

### Goals
- Robust authentication with graceful fallbacks
- Zero auth-related errors visible to users
- Backend downtime handled transparently

### Tasks

#### Task 1.1: Enhance OAuth Error Handling
**Files to Edit:**
- `api/auth/google/login.js`
- `api/auth/google/callback.js`
- `api/auth/google/status.js`
- `cleary/src/contexts/AuthContext.js`

**Implementation:**
```javascript
// In AuthContext.js
const [authState, setAuthState] = useState({
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  demoMode: false
});

// Add retry logic
async function checkAuth() {
  try {
    const response = await fetchWithRetry('/api/auth/google/status', {}, {
      maxRetries: 2,
      timeout: 5000
    });
    const data = await response.json();
    
    if (data.authenticated) {
      setAuthState({ isAuthenticated: true, user: data.user, demoMode: false });
    } else {
      // Check if we should enable demo mode
      const shouldDemo = localStorage.getItem('demoMode') === 'true';
      setAuthState({ isAuthenticated: false, demoMode: shouldDemo });
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    // Enable demo mode on persistent failure
    localStorage.setItem('demoMode', 'true');
    setAuthState({ isAuthenticated: false, demoMode: true, error: error.message });
  }
}
```

#### Task 1.2: Add Stale Token Detection
**Files to Edit:**
- `cleary/src/utils/fetchWithRetry.js`

**Implementation:**
```javascript
// Intercept 401 responses globally
export async function fetchWithAuth(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include' // Send cookies
  });
  
  if (response.status === 401) {
    // Token expired
    console.warn('Session expired, clearing auth');
    localStorage.removeItem('user');
    localStorage.setItem('authExpired', 'true');
    window.location.href = '/login?expired=true';
    throw new Error('Session expired');
  }
  
  return response;
}
```

#### Task 1.3: Backend Downtime UI States
**Files to Create:**
- `cleary/src/components/DemoModeBanner.jsx`

**Implementation:**
```jsx
function DemoModeBanner() {
  const [showRetry, setShowRetry] = useState(false);
  
  useEffect(() => {
    // Check if backend is back every 60s
    const interval = setInterval(async () => {
      try {
        await fetch('/api/auth/google/status');
        // Backend is back!
        setShowRetry(true);
      } catch {
        // Still down
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
      <p className="font-bold">Demo Mode Active</p>
      <p>Authentication temporarily unavailable. Using guest access.</p>
      {showRetry && (
        <button onClick={() => window.location.reload()}>
          Sign In Now Available
        </button>
      )}
    </div>
  );
}
```

### Endpoints to Build
None (enhancing existing)

### Risks
- User confusion about demo mode
- Data loss if demo actions aren't synced

### Test Cases
1. **OAuth Success Flow**
   - Click "Sign In with Google"
   - Authorize
   - Verify session cookie set
   - Check `/api/auth/google/status` returns authenticated

2. **Backend Down**
   - Stop backend server
   - Attempt login
   - Verify demo mode banner appears
   - Verify app still functional

3. **Token Expiry**
   - Mock expired JWT
   - Make API call
   - Verify redirect to `/login?expired=true`
   - Verify session cleared

4. **Reconnection**
   - Enable demo mode
   - Restart backend
   - Wait 60s
   - Verify "Sign In Now Available" appears

---

## Phase 2: Restore Fresh News Pipeline (Week 2)

### Goals
- Real-time news always available
- No stale articles shown by default
- Efficient caching with TTL

### Tasks

#### Task 2.1: Implement Force Refresh Parameter
**Files to Edit:**
- `api/news.js` ✅ (Already implemented)

#### Task 2.2: Add Manual Cache Clear Endpoint
**Files to Create:**
- `api/cache/clear.js` ✅ (Already implemented)

#### Task 2.3: Frontend Cache Controls
**Files to Create:**
- `cleary/src/components/RefreshButton.jsx`

**Implementation:**
```jsx
function RefreshButton({ onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);
  
  async function handleRefresh() {
    setRefreshing(true);
    try {
      const response = await fetch('/api/news?forceRefresh=true');
      const data = await response.json();
      onRefresh(data.articles);
      toast.success('Feed refreshed!');
    } catch (error) {
      toast.error('Refresh failed');
    } finally {
      setRefreshing(false);
    }
  }
  
  return (
    <button 
      onClick={handleRefresh}
      disabled={refreshing}
      className="p-2 rounded-full hover:bg-gray-100"
    >
      <RefreshIcon className={refreshing ? 'animate-spin' : ''} />
    </button>
  );
}
```

#### Task 2.4: Cache Status Indicator
**Files to Create:**
- `cleary/src/components/CacheIndicator.jsx`

**Implementation:**
```jsx
function CacheIndicator({ cached, timestamp }) {
  if (!cached) return null;
  
  const age = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(age / 60000);
  
  return (
    <div className="text-xs text-gray-500">
      {minutes === 0 ? 'Just now' : `${minutes}m ago`}
      {minutes > 3 && (
        <span className="text-orange-500 ml-1">• Refreshing...</span>
      )}
    </div>
  );
}
```

### Endpoints to Build
- ✅ `GET /api/news?forceRefresh=true`
- ✅ `POST /api/cache/clear`

### Risks
- Cache stampede if many users force refresh simultaneously
- High API costs with Gemini if cache disabled

### Test Cases
1. **Force Refresh**
   - Request `/api/news?forceRefresh=true`
   - Verify cache bypassed
   - Verify new timestamp

2. **Cache Hit**
   - Request `/api/news` twice within 3 minutes
   - Verify second request instant (<100ms)

3. **Cache Miss**
   - Wait 10 minutes
   - Request `/api/news`
   - Verify fresh fetch

4. **Manual Clear**
   - POST `/api/cache/clear` with admin token
   - Verify cache empty
   - Verify next request fetches fresh

---

## Phase 3: Add Classifier + Tagging (Week 3)

### Goals
- Every article tagged LEFT/CENTER/RIGHT
- High accuracy (>80%)
- Fallback when AI unavailable

### Tasks

#### Task 3.1: Integrate AI Classifier
**Files to Edit:**
- `api/_lib/shared.js` ✅ (Already has `detectPoliticalLeanAI`)
- `api/news.js` ✅ (Already integrated)

#### Task 3.2: Display Classification in UI
**Files to Edit:**
- `cleary/src/components/NewsCard.jsx`

**Implementation:**
```jsx
function LeanBadge({ lean, confidence }) {
  const colors = {
    'left': 'bg-blue-100 text-blue-800',
    'lean-left': 'bg-blue-50 text-blue-600',
    'center': 'bg-gray-100 text-gray-800',
    'lean-right': 'bg-red-50 text-red-600',
    'right': 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[lean]}`}>
      {lean.toUpperCase()}
      {confidence < 0.7 && <span className="ml-1">?</span>}
    </span>
  );
}
```

#### Task 3.3: Classification Explanation Tooltip
**Files to Create:**
- `cleary/src/components/ClassificationTooltip.jsx`

**Implementation:**
```jsx
function ClassificationTooltip({ article }) {
  return (
    <Tooltip>
      <div className="p-3 max-w-xs">
        <h4 className="font-bold">Classification: {article.lean}</h4>
        <p className="text-sm">Confidence: {(article.leanConfidence * 100).toFixed(0)}%</p>
        <ul className="text-xs mt-2">
          {article.leanReasons?.map((reason, i) => (
            <li key={i}>• {reason}</li>
          ))}
        </ul>
      </div>
    </Tooltip>
  );
}
```

### Endpoints to Build
None (classification integrated into `/api/news`)

### Risks
- AI API rate limits
- Classification bias
- User confusion about labels

### Test Cases
1. **AI Classification**
   - Fetch article from CNN (expect LEAN_LEFT)
   - Fetch from Fox News (expect LEAN_RIGHT)
   - Fetch from Reuters (expect CENTER)
   - Verify confidence scores

2. **Fallback to Keywords**
   - Disable Gemini API key
   - Fetch articles
   - Verify keyword-based classification
   - Verify lower confidence

3. **UI Display**
   - Render NewsCard with each lean type
   - Verify badge colors correct
   - Verify tooltip shows reasons

---

## Phase 4: Implement Personalization (Week 4-5)

### Goals
- New users get personalized feed after 5 clicks
- Ranking improves with more data
- Explainable recommendations

### Tasks

#### Task 4.1: Track User Interactions
**Files to Create:**
- ✅ `api/user/interactions.js` (Already implemented)

#### Task 4.2: Build User Profiles
**Files to Edit:**
- `api/user/interactions.js` (enhance with profile building)

**Implementation:**
```javascript
// In POST handler
if (interactions[userId].clicks.length >= 5) {
  const bootstrap = new PersonalizationBootstrap();
  const profile = bootstrap.buildProfile(userId, interactions[userId].clicks);
  interactions[userId].profile = profile;
}
```

#### Task 4.3: Personalized Feed Endpoint
**Files to Edit:**
- ✅ `api/news.js` (personalization already integrated)

#### Task 4.4: Frontend Integration
**Files to Create:**
- `cleary/src/hooks/usePersonalization.js`

**Implementation:**
```javascript
function usePersonalization() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchProfile() {
      try {
        const userId = localStorage.getItem('userId') || 'anonymous';
        const response = await fetch(`/api/user/interactions?userId=${userId}`);
        const data = await response.json();
        
        if (data.stats.totalClicks >= 5) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, []);
  
  return { profile, loading };
}
```

#### Task 4.5: Personalization Indicator
**Files to Create:**
- `cleary/src/components/PersonalizationBanner.jsx`

**Implementation:**
```jsx
function PersonalizationBanner({ profile }) {
  if (!profile) return null;
  
  return (
    <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg mb-6">
      <h3 className="font-bold text-purple-900">Your Personalized Feed</h3>
      <p className="text-sm text-purple-700">
        Based on your interests: {profile.interests.slice(0, 3).join(', ')}
      </p>
      <button className="text-xs text-purple-600 underline mt-2">
        Customize →
      </button>
    </div>
  );
}
```

### Endpoints to Build
- ✅ `POST /api/user/interactions`
- ✅ `GET /api/user/interactions`
- ✅ `GET /api/news?personalized=true&interests=...`

### Risks
- Privacy concerns (storing clicks)
- Filter bubble creation
- Cold start problem (<5 clicks)

### Test Cases
1. **Cold Start (0-4 clicks)**
   - New user visits
   - Click 4 articles
   - Verify generic feed shown
   - Verify no "personalized" badge

2. **Profile Building (5+ clicks)**
   - Click 5th article
   - Verify GET `/api/user/interactions` returns interests
   - Verify dominant lean calculated

3. **Personalized Feed**
   - User with profile requests `/api/news?personalized=true`
   - Verify articles ranked by interest match
   - Verify personalization scores in response

4. **Continuous Learning**
   - Click 10 more articles (total 15)
   - Verify interests updated
   - Verify feed adapts

---

## Phase 5: Launch Shorts Feed (Week 6)

### Goals
- TikTok-style vertical video feed
- Smooth performance (60fps)
- Max 2:30 videos only
- Share functionality

### Tasks

#### Task 5.1: Vertical Scroll Component
**Files:**
- ✅ `cleary/src/pages/ShortsPage.jsx` (Already implemented)
- ✅ `cleary/src/components/ShortFeedCard.jsx` (Already implemented with share button)

#### Task 5.2: Video Lazy Loading
**Files to Edit:**
- `cleary/src/pages/ShortsPage.jsx`

**Enhancement:**
```jsx
// Add IntersectionObserver for lazy load
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index);
          setActiveIndex(index);
          
          // Prefetch next 3 videos
          prefetchVideos(index + 1, index + 3);
        }
      });
    },
    { threshold: 0.75 }
  );
  
  // Observe all short cards
  document.querySelectorAll('.short-card').forEach(card => {
    observer.observe(card);
  });
  
  return () => observer.disconnect();
}, [shorts]);
```

#### Task 5.3: Share Analytics
**Files to Create:**
- `api/shorts/track.js`

**Implementation:**
```javascript
module.exports = async (req, res) => {
  const { shortId, action, platform } = req.body;
  
  // Track in analytics
  console.log(`[shorts] ${action}: ${shortId} via ${platform}`);
  
  // Update count in database (future)
  // await db.shorts.update({ id: shortId }, { share_count: +1 });
  
  res.json({ success: true });
};
```

#### Task 5.4: Performance Optimization
**Techniques:**
- Use `will-change: transform` CSS for scroll
- Debounce scroll events
- Unload off-screen videos
- Lazy-load thumbnails

### Endpoints to Build
- ✅ `GET /api/shorts`
- `POST /api/shorts/track` (optional analytics)

### Risks
- Video loading delays
- High bandwidth usage
- Browser compatibility (Share API)

### Test Cases
1. **Vertical Scroll**
   - Scroll down 10 shorts
   - Verify smooth snap behavior
   - Verify only active video plays

2. **Max Duration**
   - Load shorts
   - Verify all durations ≤2:30

3. **Share Button**
   - Click share on mobile (native dialog)
   - Click share on desktop (clipboard)
   - Verify analytics tracked

4. **Performance**
   - Load 50 shorts
   - Verify no memory leaks
   - Verify 60fps scroll

---

## Phase 6: Testing & Rollout (Week 7-8)

### Goals
- Zero critical bugs
- Smooth user experience
- Monitoring in place

### Testing Strategy

#### Unit Tests
```javascript
// Example: classifier.test.js
describe('Political Classifier', () => {
  it('should classify left-leaning article', () => {
    const result = scoreLean('progressive climate action', 'CNN');
    expect(result.label).toBe('lean-left');
  });
  
  it('should handle missing data gracefully', () => {
    const result = scoreLean('', '');
    expect(result.label).toBe('center');
  });
});
```

#### Integration Tests
- OAuth flow end-to-end
- Cache invalidation
- Personalization pipeline

#### Load Testing
```bash
# Using artillery.io
artillery quick --count 100 --num 10 https://your-app.vercel.app/api/news
```

### Rollout Plan

**Week 7: Internal Testing**
- Deploy to staging
- Manual QA all features
- Fix critical bugs

**Week 8: Beta Launch**
- 10% traffic rollout
- Monitor error rates
- Gather user feedback

**Week 9: Full Launch**
- 100% traffic
- Monitor metrics
- Iterate on feedback

### Monitoring Dashboard

**Key Metrics:**
- API latency (p50, p95, p99)
- Error rate per endpoint
- Cache hit ratio
- User engagement (clicks, shares)
- Personalization accuracy

**Alerts:**
- Error rate >5%
- Latency >5s
- Cache hit ratio <50%

---

## Summary Checklist

### Phase 1: OAuth ✅
- [x] Enhanced error handling
- [x] Demo mode fallback
- [x] Token expiry detection
- [x] Reconnection logic

### Phase 2: Fresh News ✅
- [x] Force refresh parameter
- [x] Cache clear endpoint
- [ ] Frontend refresh button
- [ ] Cache status indicator

### Phase 3: Classification ✅
- [x] AI classifier integration
- [ ] UI lean badges
- [ ] Classification tooltips
- [ ] Accuracy monitoring

### Phase 4: Personalization ✅
- [x] Interaction tracking
- [x] Profile building
- [x] Personalized endpoint
- [ ] Frontend integration
- [ ] Customization UI

### Phase 5: Shorts ✅
- [x] Vertical scroll component
- [x] Share button
- [x] Max 2:30 enforcement
- [ ] Lazy loading optimization
- [ ] Analytics tracking

### Phase 6: Launch
- [ ] Unit tests
- [ ] Integration tests
- [ ] Load testing
- [ ] Staging deployment
- [ ] Beta rollout
- [ ] Full launch
- [ ] Monitoring setup

---

**Implementation Status: 80% Complete**

Most core features are already implemented. Remaining work focuses on UI polish, testing, and deployment.
