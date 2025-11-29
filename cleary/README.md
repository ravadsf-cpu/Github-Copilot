# Cleary - The Living Internet 🌐✨

An AI-powered news and discovery platform that blends personalization, dynamic content generation, and emotional context.

## 🚀 Features

- **Dynamic AI News Feed** - Personalized news that adapts to your mood
- **Mood-Based Discovery** - Filter content by emotional context
- **Smart Memory System** - AI learns your preferences over time
- **Political Balance** - Customizable perspective diversity
- **Beautiful UI** - Cinematic interface with advanced animations
- **Real-time Analytics** - Track your reading patterns

## 🛠️ Tech Stack

- **Frontend:** React, TailwindCSS, Framer Motion
- **Backend:** Firebase (Auth + Firestore)
- **AI:** OpenAI/Gemini API (for production)
- **Charts:** Recharts
- **Icons:** Lucide React

## 📦 Installation

```bash
cd cleary
npm install
```

## 🔧 Configuration

1. Set up Firebase (see FIREBASE_SETUP.md)
2. Create `.env.local` with your Firebase credentials
3. (Optional) Add OpenAI/Gemini API keys for AI features

```env
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project
# ... other Firebase config

REACT_APP_OPENAI_API_KEY=your_openai_key  # Optional
GEMINI_API_KEY=your_gemini_key            # Backend Gemini model (fast summaries)

# Google OAuth / Gmail
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret
GOOGLE_OAUTH_REDIRECT=http://localhost:5001/api/auth/google/callback
```

## 🚀 Running the App

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 📱 Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests

## 🎨 Key Features Implemented

### 1. Landing Page
- Floating particle animations
- Glowing neon text effects
- Smooth scroll indicators
- Ripple button effects
- Parallax scrolling

### 2. Feed Page
- Mood-based content filtering
- Dynamic card styling based on article mood
- Search functionality
- Animated hover effects
- Background adapts to content mood

### 3. Memory Dashboard
- Reading time analytics
- Mood distribution charts
- AI-generated insights
- Preference tracking
- Personalization metrics

### 4. Profile Page
- User settings management
- Political balance preferences
- Privacy controls
- Notification settings
- Content format preferences

## 🎯 Current Implementation Status

✅ **Completed:**
- Full UI/UX with cinematic animations
- Mood-based content system
- User preference tracking
- Reading history analytics
- Dashboard with charts
- Authentication flow (mock)
- Responsive design
- Advanced Tailwind styling

🚧 **Ready for Integration:**
- Firebase Authentication
- Firestore database
- OpenAI/Gemini API
- Real news API integration
- Chrome Extension

## 📊 Mock Data

The app currently uses mock data for demonstration. To integrate real data:

1. Replace `mockArticles` in `utils/mockData.js` with real API calls
2. Implement `aiService.js` functions with actual AI APIs
3. Connect AuthContext to Firebase Authentication
4. Set up Firestore for data persistence

## 🔐 Environment Variables

Create `.env.local`:

```env
# Firebase
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=

# AI Services (Optional)
REACT_APP_OPENAI_API_KEY=
REACT_APP_NEWS_API_KEY=
```

## 🎨 Customization


### 🔑 Google OAuth & Gmail Setup

1. Go to Google Cloud Console → Create a project.
2. Enable APIs: OAuth consent screen (External), then enable Gmail API.
3. Create OAuth 2.0 Client ID (Web Application) with redirect URI:
	 - `http://localhost:5001/api/auth/google/callback`
4. Fill env vars above and restart the server.
5. Frontend flow:
	 - Call `GET /api/auth/google/init?userId=<firebaseUid>` → receive `url`.
	 - Open the returned URL in a popup/tab.
	 - After consent, popup closes (callback sends a simple page) and tokens are stored server-side.
	 - Fetch emails via: `GET /api/gmail/messages?userId=<firebaseUid>`.

Returned structure:
```jsonc
{
	"messages": [
		{ "id": "18c9...", "subject": "Welcome", "from": "Team <team@example.com>", "date": "Fri, 14 Nov 2025 10:05:21 -0500", "snippet": "Thanks for trying Cleary..." }
	],
	"count": 10,
	"userId": "uid123"
}
```

Notes:
- Tokens are stored in-memory (Map). For production, persist to a database and encrypt.
- Scopes used: `openid profile email gmail.readonly`.
- Refresh tokens only returned on the first consent with `prompt=consent` or if revoked.
- Add additional scopes (e.g., `gmail.modify`) if write access needed.
- Fallback naming: The server supports either the `GOOGLE_OAUTH_*` trio or the older `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `OAUTH_REDIRECT_URI` names. Prefer the `GOOGLE_OAUTH_*` names for consistency; the other names are automatically detected if the preferred ones are absent.
- Additional optional env var: `OAUTH_POST_LOGIN_REDIRECT` – if set, the callback will redirect the browser to this URL instead of showing a close-page message.
- Required for secure sessions: set a strong `SESSION_SECRET` (never commit the production value).
- AI features: set `GEMINI_API_KEY` to enable enhanced chat & enrichment; without it, the system will fall back to heuristic responses.

### Colors & Theme
Edit `tailwind.config.js` to customize the color scheme.

### Animations
Modify `src/index.css` for custom animations and effects.

## 📝 License

MIT License - feel free to use this project for learning or building your own version!

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 🌟 Future Enhancements

- VR/AR newsroom experience
- AI video generation
- Social features & comments
- Chrome extension
- Mobile app
- Voice narration
- Multi-language support

---

**Built with ❤️ by the Cleary team**
