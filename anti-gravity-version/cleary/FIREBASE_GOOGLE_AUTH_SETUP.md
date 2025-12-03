# Firebase Google Sign-In Setup Guide

## Current Issue
You're seeing: `Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)`

This happens because Firebase environment variables are not set, so the app uses demo config which can't authenticate.

## Step-by-Step Setup

### 1. Create/Access Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Name it (e.g., "Cleary News")
4. Continue through setup (Google Analytics optional)

### 2. Enable Authentication

1. In Firebase Console → **Authentication**
2. Click "Get Started"
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Enable **Google** provider:
   - Click on Google
   - Toggle "Enable"
   - Enter support email
   - Save

### 3. Enable Identity Toolkit API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project from dropdown
3. Go to **APIs & Services** → **Library**
4. Search for "Identity Toolkit API"
5. Click it and press **ENABLE**

### 4. Add Authorized Domains

1. Back in Firebase Console → **Authentication** → **Settings** tab
2. Scroll to **Authorized domains**
3. Add these domains:
   - `localhost` (should be there by default)
   - Your production domain (e.g., `cleary.vercel.app`)

### 5. Get Firebase Configuration

1. Firebase Console → **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web** icon `</>`
4. Register app with nickname (e.g., "Cleary Web")
5. Copy the `firebaseConfig` object values

You'll see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

### 6. Add Environment Variables

Create or update `/Users/adisanghavi/Github Copilot/cleary/.env.local` with:

```bash
# Firebase Authentication (frontend)
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Backend API keys (from existing .env)
GEMINI_API_KEY=AIzaSyB5lb1sZ5aDb3-DRTaEVKZS4B_Qzzfk6hw
PORT=5001

# Google OAuth (for Gmail integration - optional for now)
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REDIRECT=http://localhost:5001/api/auth/google/callback
```

**Important**: Use `.env.local` for frontend vars (not `.env`). Create React App only reads `REACT_APP_*` vars from `.env.local`.

### 7. Restart Development Server

After adding env vars:
```bash
# Stop current dev server (Ctrl+C)
npm start
```

The app will now use real Firebase instead of demo mode.

### 8. Test Google Sign-In

1. Go to `http://localhost:3000/login`
2. Click "Continue with Google"
3. Sign in with your Google account
4. Should redirect to `/feed` after successful auth

## Troubleshooting

### Still seeing "api-key-not-valid"?
- Check `.env.local` exists in `/Users/adisanghavi/Github Copilot/cleary/` (not in subdirs)
- Verify no typos in `REACT_APP_FIREBASE_API_KEY`
- Restart dev server after adding vars
- Check browser console for `[firebase] initialization failed` warnings

### "unauthorized-domain" error?
- Add your domain to Firebase → Authentication → Settings → Authorized domains
- For localhost, add: `localhost`

### "auth/popup-blocked"?
- Allow popups for localhost in browser settings
- Try sign-in in the same tab instead

### Identity Toolkit API not enabled?
- Go to Google Cloud Console
- Select your Firebase project
- Enable "Identity Toolkit API" from API Library

## Verify Configuration

After setup, check browser console for:
```
✅ No "[firebase] initialization failed" warning
✅ No "demo mode" messages
✅ Click Google sign-in → opens Google consent popup
```

## Optional: Gmail OAuth Setup

For Gmail integration (separate from Firebase auth):

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project → **APIs & Services** → **Credentials**
3. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:5001/api/auth/google/callback`
4. Copy Client ID and Client Secret
5. Add to `.env` (backend server file):
```bash
GOOGLE_OAUTH_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_OAUTH_REDIRECT=http://localhost:5001/api/auth/google/callback
```

## Files Modified

- `.env.local` (new file) - Frontend Firebase config
- `.env` (existing) - Backend API keys

## Next Steps

Once Firebase is working:
1. Google Sign-In will work
2. User data persists in Firebase Auth
3. Can add Firestore for article preferences
4. Can deploy with same config (update domains)
