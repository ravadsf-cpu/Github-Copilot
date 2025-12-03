# ✅ Quick Google OAuth Setup (3 Minutes)

Your app is **ready** for Google OAuth! Just add your credentials:

---

## Step 1: Get Credentials from Google Cloud

1. Open: **https://console.cloud.google.com/apis/credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted for consent screen:
   - Click **"Configure Consent Screen"**
   - Choose **"External"**
   - Fill in:
     - App name: `Cleary News` (or anything)
     - User support email: your email
     - Developer contact: your email
   - Click **"Save and Continue"** 3 times (skip everything else)
   - Back to Credentials
4. Create OAuth client ID:
   - Application type: **"Web application"**
   - Name: anything (e.g., "Cleary Web")
   - Authorized redirect URIs: click **"+ ADD URI"** and paste:
     ```
     http://localhost:5001/api/auth/google/callback
     ```
   - Click **"Create"**
5. **COPY** the Client ID and Client Secret from the popup

---

## Step 2: Add to Your .env File

1. Open terminal and run:
   ```bash
   nano "/Users/adisanghavi/Github Copilot/cleary/.env"
   ```

2. Replace these lines with your actual values:
   ```properties
   GOOGLE_OAUTH_CLIENT_ID=paste-your-client-id-here.apps.googleusercontent.com
   GOOGLE_OAUTH_CLIENT_SECRET=paste-your-secret-here
   ```

3. Save: `Ctrl+X`, then `Y`, then `Enter`

---

## Step 3: Restart Backend

```bash
cd "/Users/adisanghavi/Github Copilot/cleary"
npm run server
```

You should see:
```
[cleary-api] listening on http://localhost:5001
```

---

## Step 4: Test It

1. Start the frontend (in a new terminal):
   ```bash
   cd "/Users/adisanghavi/Github Copilot/cleary"
   npm start
   ```

2. Visit **http://localhost:3000/login**

3. Click **"Sign in with Google"**

4. It should work! 🎉

---

## 🔧 Troubleshooting

**"redirect_uri_mismatch"**
- Make sure the redirect URI in Google Console is **exactly**: `http://localhost:5001/api/auth/google/callback`

**"Access blocked: This app's request is invalid"**
- Go back to OAuth consent screen
- Add your email as a **Test User**
- Make sure the app is in "Testing" mode

**Still not working?**
- Check that both `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` are in `.env`
- No extra spaces or quotes around the values
- Backend must be restarted after changing `.env`

---

## 🚀 For Production (Vercel)

1. Add the production redirect URI in Google Console:
   ```
   https://your-app.vercel.app/api/auth/google/callback
   ```

2. Add environment variables in Vercel:
   - Settings → Environment Variables
   - Add: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT`
   - Redeploy
