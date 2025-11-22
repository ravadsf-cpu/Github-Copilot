# 🔐 Google OAuth Setup Guide

## Current Error:
```
Failed to sign in with Google: Server OAuth configuration error. Contact administrator.
```

## ✅ Quick Fix: The error is because Google OAuth credentials are not configured yet!

You have 2 options:

### Option 1: Use the App Without Google Sign-In (Recommended for now)
The app works perfectly fine without Google OAuth. Just use:
- **Guest Mode** - Browse anonymously
- **Local Account** - Create account with email/password (if implemented)
- **Firebase Auth** - If you configure Firebase credentials

### Option 2: Set Up Google OAuth (Takes 10 minutes)

If you really want Google Sign-In, follow these steps:

## 📋 Setup Steps:

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/apis/credentials

### 2. Create a Project (if you don't have one)
- Click "Select Project" → "New Project"
- Name it "Cleary News App"
- Click "Create"

### 3. Enable Google+ API
- Go to "Library" in the left menu
- Search for "Google+ API"
- Click it and press "Enable"

### 4. Create OAuth Consent Screen
- Go to "OAuth consent screen" in left menu
- Choose "External" → Click "Create"
- Fill in:
  - App name: `Cleary News`
  - User support email: Your email
  - Developer contact: Your email
- Click "Save and Continue"
- Skip scopes → Click "Save and Continue"
- Add test users (your email) → Click "Save and Continue"

### 5. Create OAuth 2.0 Client ID
- Go to "Credentials" in left menu
- Click "Create Credentials" → "OAuth client ID"
- Application type: "Web application"
- Name: `Cleary Web Client`
- Authorized redirect URIs:
  ```
  http://localhost:5001/api/auth/google/callback
  http://localhost:3000/auth/callback
  ```
- Click "Create"

### 6. Copy Credentials to .env file
You'll see a popup with your credentials. Copy them:

```bash
# Open .env file in cleary folder
cd "/Users/adisanghavi/Github Copilot/cleary"
nano .env
```

Replace these lines in `.env`:
```properties
GOOGLE_OAUTH_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret-here
GOOGLE_OAUTH_REDIRECT=http://localhost:5001/api/auth/google/callback
```

With your actual values:
```properties
GOOGLE_OAUTH_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-abc123def456xyz789
GOOGLE_OAUTH_REDIRECT=http://localhost:5001/api/auth/google/callback
```

### 7. Restart Backend Server
```bash
# Stop backend (Ctrl+C in terminal)
# Then restart:
npm run server
```

### 8. Test Google Sign-In
- Visit http://localhost:3000/login
- Click "Continue with Google"
- Should open Google consent popup
- After consent, you'll be logged in!

## 🔍 Verification:

After setup, the backend should log:
```
[oauth] ✅ OAuth client configured successfully
[cleary-api] listening on http://localhost:5001
```

Click "Continue with Google" should:
1. Open popup window
2. Show Google account selection
3. Ask for consent (first time)
4. Close popup and log you in

## ⚠️ Common Issues:

### "redirect_uri_mismatch"
- Make sure redirect URI in Google Console exactly matches `.env`:
  ```
  http://localhost:5001/api/auth/google/callback
  ```

### "Access blocked: This app's request is invalid"
- Go to OAuth consent screen
- Add your email as a test user
- Make sure app is in "Testing" mode (not "Production")

### Still showing "Server OAuth configuration error"
- Check `.env` file has all 3 values (CLIENT_ID, CLIENT_SECRET, REDIRECT)
- Make sure no extra spaces or quotes around values
- Restart backend server after editing `.env`

## 🚀 Production Deployment:

When deploying to production (Vercel, etc.):

1. Update redirect URI in Google Console:
   ```
   https://your-domain.com/api/auth/google/callback
   ```

2. Update `.env` or Vercel environment variables:
   ```
   GOOGLE_OAUTH_REDIRECT=https://your-domain.com/api/auth/google/callback
   ```

3. Verify OAuth consent screen
   - Publishing status: In production
   - Or keep in Testing with explicit test users

---

**TL;DR:** Google Sign-In needs OAuth credentials from Google Cloud Console. It's optional - the app works without it. If you want it, follow steps above to get credentials and add to `.env` file.
