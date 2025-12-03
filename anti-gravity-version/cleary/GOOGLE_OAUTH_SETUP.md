# 🔐 Simple Google OAuth Setup (5 Steps)

## What You Need to Do:

Google Sign-In is **optional** - the app works fine without it! But if you want it, here's the simple version:

---

## Step 1: Go to Google Cloud Console
🔗 Visit: **https://console.cloud.google.com/apis/credentials**

---

## Step 2: Create Your App (if needed)
1. Click **"Create Project"** at the top
2. Name it anything (e.g., "My News App")
3. Click **"Create"**

---

## Step 3: Set Up OAuth Consent Screen
1. In the left menu, click **"OAuth consent screen"**
2. Choose **"External"** (this is the default)
3. Fill in just these 2 fields:
   - **App name**: Your App Name (e.g., "My News App")
   - **User support email**: Your email
   - **Developer contact**: Your email (same one)
4. Click **"Save and Continue"** three times (skip everything else)
5. You're done! ✅ (Don't worry about "Publish" - leave it in Testing mode)

---

## Step 4: Create OAuth Credentials
1. In the left menu, click **"Credentials"**
2. Click the blue **"+ CREATE CREDENTIALS"** button at the top
3. Select **"OAuth client ID"**
4. Choose **"Web application"**
5. Under **"Authorized redirect URIs"**, click **"+ ADD URI"** and paste:
   ```
   http://localhost:5001/api/auth/google/callback
   ```
6. Click **"Create"**
7. **Copy your credentials** from the popup (you'll need them next!)

---

## Step 5: Add Credentials to Your App
1. Open your terminal and run:
   ```bash
   cd "/Users/adisanghavi/Github Copilot/cleary"
   nano .env
   ```
2. Add these 3 lines (paste your actual values from Step 4):
   ```
   GOOGLE_OAUTH_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-your-secret-here
   GOOGLE_OAUTH_REDIRECT=http://localhost:5001/api/auth/google/callback
   ```
3. Press `Ctrl+X`, then `Y`, then `Enter` to save
4. Restart your backend server

---

## Done! 🎉

Test it by clicking "Sign in with Google" in your app.

### If it doesn't work:
- Make sure you copied the redirect URI **exactly**: `http://localhost:5001/api/auth/google/callback`
- Add your email as a test user in OAuth consent screen
- Check that all 3 environment variables are in your `.env` file
- Restart the backend server

---

## For Vercel Deployment:
1. In Google Cloud Console, add this redirect URI:
   ```
   https://your-vercel-domain.vercel.app/api/auth/google/callback
   ```
2. In Vercel, go to Settings → Environment Variables and add:
   - `GOOGLE_OAUTH_CLIENT_ID`
   - `GOOGLE_OAUTH_CLIENT_SECRET`
   - `GOOGLE_OAUTH_REDIRECT` (with your Vercel domain)
3. Redeploy your app

