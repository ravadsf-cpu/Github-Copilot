# Cleary - Professional News Intelligence Platform

## Major Updates Summary

### UI/UX Enhancements
- ✅ Removed all emoji icons, replaced with professional Lucide React icons
- ✅ Applied Material Design principles throughout
- ✅ Clean, professional typography and spacing
- ✅ Subtle shadows and hover effects
- ✅ Refined color palette with purple/pink gradients
- ✅ Professional news cards with bias indicators
- ✅ Enhanced header with clean navigation

### Backend Enhancements
- ✅ Expanded source bias map to 40+ news sources
- ✅ Fetch up to 100 articles per request (configurable pagination)
- ✅ Full article content retrieval from NewsAPI
- ✅ AI-powered summarization using OpenAI GPT-4o-mini
- ✅ Enhanced political lean inference algorithm
- ✅ Smart recommendation engine with 3 strategies:
  - **Reinforce**: Prioritize articles matching your political lean
  - **Challenge**: Show opposing viewpoints
  - **Balanced**: Interleave center/left/right sources

### New Features

#### Article Reading Experience
- Full ArticlePage with complete article content
- AI-generated summaries highlighted in special cards
- Professional typography for long-form reading
- Source attribution and external links
- Bookmark and share functionality
- Metadata display (author, publish date, read time)

#### AI-Powered Personalization
- Automatic political lean detection based on reading patterns
- Real-time tracking of article interactions
- Smart content ordering based on detected preferences
- Bias indicators on every article card
- "Recommended for you" section with explanation

#### Professional UI Components
- Clean NewsCard design with hover effects
- Material-inspired Header with icon-based navigation
- Professional Landing Page without emojis
- Login/Signup pages with clean forms
- Consistent design language across all pages

### Technical Stack

**Frontend:**
- React 19 with React Router
- Tailwind CSS 3 with custom theme
- Framer Motion for animations
- Lucide React for professional icons

**Backend:**
- Express.js server
- NewsAPI integration for real news
- OpenAI GPT-4o-mini for AI summarization
- In-memory political lean tracking
- CORS and JSON middleware

### API Endpoints

#### GET /api/news
Fetch personalized news articles with optional filters.

**Query Parameters:**
- `mood`: Filter by detected mood (hopeful, concerning, inspiring, mixed)
- `category`: Filter by category (technology, business, health, world, etc.)
- `q`: Search query
- `personalize`: Set to 'true' to enable personalization
- `strategy`: Personalization strategy (balanced, reinforce, challenge)
- `page`: Page number for pagination (default: 1)
- `pageSize`: Articles per page (default: 100)

**Response:**
```json
{
  "articles": [
    {
      "id": "article-url",
      "title": "Article Title",
      "summary": "AI-generated summary...",
      "content": "Full article content...",
      "image": "https://...",
      "source": "Source Name",
      "url": "https://...",
      "category": "technology",
      "bias": "center",
      "mood": "hopeful",
      "publishedAt": "2025-11-03T...",
      "author": "Author Name"
    }
  ],
  "total": 100,
  "lean": "centrist"
}
```

#### POST /api/interactions
Track article clicks for political lean inference.

**Request Body:**
```json
{
  "url": "article-url",
  "source": "source-name"
}
```

**Response:**
```json
{
  "ok": true,
  "lean": "democrat",
  "counts": {
    "leftClicks": 5,
    "rightClicks": 2
  }
}
```

#### GET /api/lean
Get current inferred political lean.

**Response:**
```json
{
  "lean": "centrist",
  "counts": {
    "leftClicks": 0,
    "rightClicks": 0
  }
}
```

#### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "ok": true
}
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Required for real news
NEWS_API_KEY=your_newsapi_key_here

# Optional for AI summarization
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4o-mini

# Optional
PORT=5001
AI_PROVIDER=openai
```

### Setup Instructions

1. **Install dependencies:**
```bash
cd cleary
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Add your API keys to .env
```

3. **Start development servers:**
```bash
npm run dev
```

This runs both frontend (port 3000) and backend (port 5001) concurrently.

4. **Build for production:**
```bash
npm run build
```

### Key Features Explained

#### Political Lean Detection
The system analyzes your reading patterns by tracking which sources you click on. Each source is pre-categorized as left-leaning, right-leaning, or center. After 5+ interactions, the algorithm infers your political lean:
- **Democrat**: 20%+ more left-leaning clicks
- **Republican**: 20%+ more right-leaning clicks
- **Centrist**: Balanced reading patterns

#### Recommendation Strategies
 
---

## Deployment Notes

- 2025-11-11: Triggering redeploy to Vercel. Serverless API now lives at repository root `/api/*`, and frontend builds from `cleary/` to `cleary/build` as configured in `vercel.json`.
Based on your detected lean and Profile preferences:
- **Balanced**: Interleaves center/left/right articles
- **Reinforce**: Shows more articles matching your lean
- **Challenge**: Prioritizes opposing viewpoints

#### AI Summarization
When OPENAI_API_KEY is set:
- Articles are summarized in 3-4 clear, neutral sentences
- Fallback to simple text truncation if API unavailable
- Summaries cached per article URL
- Temperature set to 0.3 for consistency

### Source Bias Categories

**Left-leaning (15 sources):**
- New York Times, Washington Post, CNN
- MSNBC, HuffPost, The Guardian
- Vox, Slate, Mother Jones
- The Daily Beast, Politico, The Atlantic
- New Republic, The Nation, Salon

**Right-leaning (15 sources):**
- Fox News, Breitbart, National Review
- NY Post, The Federalist, Daily Caller
- The Blaze, Washington Examiner, Townhall
- OANN, Newsmax, Washington Times
- RealClearPolitics, The Spectator, RedState

**Center (15 sources):**
- Associated Press, Reuters, BBC
- NPR, Wall Street Journal, USA Today
- Christian Science Monitor, The Hill, Axios
- Bloomberg, Financial Times, The Economist
- Time, Newsweek

### Design Philosophy

**Material-Inspired Principles:**
- Clean, uncluttered layouts
- Subtle elevation and shadows
- Professional iconography (no emojis)
- Consistent spacing (4px grid system)
- Hover states for interactive feedback
- Smooth animations (Framer Motion)
- Accessible color contrasts

**Typography:**
- Headlines: Bold, large, gradient text
- Body: Readable gray tones
- Metadata: Smaller, subdued colors
- Professional font stack (Inter/system fonts)

**Color Palette:**
- Primary: Purple/Pink gradients
- Backgrounds: Dark with subtle transparency
- Text: White/Gray scale
- Accents: Contextual (red for logout, blue for share, etc.)

### Future Enhancements

- [ ] Persistent user data (Firebase/Firestore)
- [ ] Real-time lean updates in UI
- [ ] Article bookmarking with backend storage
- [ ] Social sharing with Open Graph metadata
- [ ] Mobile-optimized responsive design
- [ ] Dark/Light theme toggle
- [ ] Notification system for breaking news
- [ ] Advanced filtering (date range, sentiment)
- [ ] Reading history analytics
- [ ] Export reading data
- [ ] Multi-language support
- [ ] Offline mode with service workers

### Contributing

Please follow Material Design guidelines and maintain the professional, emoji-free aesthetic when contributing.

### License

MIT

---

Built with ❤️ (but no emojis in the UI!)
