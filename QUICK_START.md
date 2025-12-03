# Quick Start Guide

## 🎯 Choose Your Version

### Option 1: GitHub Copilot Version (Recommended)
**Location:** `/copilot-version/`  
**Features:** All enhancements including OAuth, personalization, TikTok-style shorts, share button  
**Port:** 3000 (frontend), 5001 (backend)

### Option 2: Anti-Gravity Version (Baseline)
**Location:** `/anti-gravity-version/`  
**Features:** Original implementation  
**Port:** 3001 (frontend), 5002 (backend)

---

## ⚡ 3-Step Setup

### 1. Install Dependencies
```bash
# Copilot Version
cd copilot-version
npm install
cd cleary && npm install

# OR Anti-Gravity Version
cd anti-gravity-version
npm install
cd cleary && npm install
```

### 2. Set Environment Variables
Copy `.env.example` to `.env` in `cleary/` folder:

```env
# Copilot Version
APP_SESSION_SECRET=your-random-secret-32-chars-min
GOOGLE_OAUTH_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=xxx
GEMINI_API_KEY=your-gemini-key
ADMIN_TOKEN=your-cache-clear-token
```

### 3. Run Development Server
```bash
# From version root (copilot-version/ or anti-gravity-version/)
npm run dev
```

**Open:** http://localhost:3000 (Copilot) or http://localhost:3001 (Anti-Gravity)

---

## 🧪 Test New Features (Copilot Version Only)

### 1. Force Fresh News
```bash
curl "http://localhost:5001/api/news?category=breaking&forceRefresh=true"
```

### 2. Get Personalized Feed
```bash
curl "http://localhost:5001/api/news?personalized=true&interests=ai,economy&userLean=center"
```

### 3. Track User Click
```bash
curl -X POST "http://localhost:5001/api/user/interactions" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "articleId": "article-url",
    "action": "click",
    "metadata": { "title": "Test Article", "lean": "center" }
  }'
```

### 4. Get User Profile
```bash
curl "http://localhost:5001/api/user/interactions?userId=test-user"
```

### 5. Clear Cache
```bash
curl -X POST "http://localhost:5001/api/cache/clear" \
  -H "Authorization: Bearer your-admin-token"
```

---

## 📱 Frontend Features to Try

### Copilot Version
1. **Personalized News:**
   - Click 5+ articles
   - Refresh feed
   - Notice articles matching your interests appear more

2. **Shorts Page:**
   - Navigate to `/shorts`
   - Scroll vertically (or use ↑/↓ keys)
   - Like/dislike/comment on videos
   - Click share button (uses native share or copies link)
   - Try trim controls (✂️ button)

3. **OAuth Login:**
   - Click "Sign In with Google"
   - Complete OAuth flow
   - Check session persists

### Anti-Gravity Version
- Standard features without enhancements

---

## 🚀 Deploy to Vercel

```bash
# From version root
vercel --prod

# Set environment variables in Vercel dashboard
vercel env add GEMINI_API_KEY production
vercel env add APP_SESSION_SECRET production
vercel env add GOOGLE_OAUTH_CLIENT_ID production
vercel env add GOOGLE_OAUTH_CLIENT_SECRET production
vercel env add GOOGLE_OAUTH_REDIRECT production
```

**Don't forget:** Update Google OAuth redirect URIs in Google Cloud Console!

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# OR use different port
PORT=3002 npm run dev
```

### OAuth Not Working
1. Check `.env` file has all required variables
2. Verify Google OAuth redirect URI matches your URL
3. Check console for error messages

### No Articles Loading
1. Check backend is running: `curl http://localhost:5001/api/news`
2. Try force refresh: `?forceRefresh=true`
3. Check Gemini API key is valid

### Shorts Not Loading
1. Check `/api/shorts` endpoint: `curl http://localhost:5001/api/shorts`
2. Look for video enrichment logs in terminal
3. Try clearing cache

---

## 📚 Documentation

- **Full README:** `/ROOT_README.md`
- **Implementation Details:** `/copilot-version/IMPLEMENTATION_SUMMARY.md`
- **API Docs:** `/copilot-version/README.md`

---

## 🎓 Key Differences

| Feature | Anti-Gravity | Copilot |
|---------|--------------|---------|
| Port | 3001 | 3000 |
| OAuth | Basic | ✅ Enhanced |
| Personalization | ❌ | ✅ Yes |
| Classification | Basic | ✅ AI-powered |
| Shorts | Card grid | ✅ Vertical feed |
| Share Button | ❌ | ✅ Yes |
| Force Refresh | ❌ | ✅ Yes |
| User Tracking | ❌ | ✅ Yes |

---

## ⚠️ Important Notes

1. **Never mix versions** - Keep them completely separate
2. **Different ports** - Can run both simultaneously for comparison
3. **Environment variables** - Set separately for each version
4. **Deployment** - Deploy to different Vercel projects

---

## 🆘 Need Help?

- Check logs in terminal for error messages
- Review `/copilot-version/IMPLEMENTATION_SUMMARY.md`
- Check Vercel function logs if deployed
- Look at browser console for frontend errors

---

**Last Updated:** November 30, 2025  
**Version:** Copilot 2.0, Anti-Gravity 1.0
