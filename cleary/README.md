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
