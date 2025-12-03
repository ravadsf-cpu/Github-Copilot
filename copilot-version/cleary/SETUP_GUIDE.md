# 🔥 Firebase Google Sign-In - Complete Setup Guide with Links

**Estimated time: 10-15 minutes**

---

## 📍 PART 1: Create Firebase Project & Get Config

### Step 1: Create Firebase Project (5 min)

1. **Go to Firebase Console**
   - 🔗 Link: https://console.firebase.google.com/
   - Click **"Add project"** (or select existing project if you have one)

2. **Name your project**
   - Enter: `Cleary News` (or any name you prefer)
   - Click **Continue**

3. **Google Analytics (Optional)**
   - Toggle OFF if you don't want analytics (saves time)
   - Or leave ON and select account
   - Click **Create project**
   - Wait 30-60 seconds for project creation

4. **Click "Continue"** when setup completes

---

### Step 2: Get Firebase Configuration (2 min)

1. **In Firebase Console home page**, click the **gear icon** (⚙️) next to "Project Overview"
   - Or direct link: https://console.firebase.google.com/project/_/settings/general/
   - (Replace `_` with your project ID in URL)

2. **Scroll down** to "Your apps" section

3. **Click the Web icon** (`</>` symbol)
   - It says "Add an app to get started"

4. **Register your app:**
   - App nickname: `Cleary Web`
   - ⚠️ **DO NOT check** "Also set up Firebase Hosting" (not needed)
   - Click **Register app**

5. **Copy the config object:**
   ```javascript
   // You'll see something like this - COPY THESE VALUES:
   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "cleary-news-xxxxx.firebaseapp.com",
     projectId: "cleary-news-xxxxx",
     storageBucket: "cleary-news-xxxxx.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abc123def456",
     measurementId: "G-XXXXXXXXXX"
   };
   ```

6. **Click "Continue to console"** (you're done with this step!)

---

## 📍 PART 2: Enable Authentication Methods

### Step 3: Enable Email/Password & Google Sign-In (3 min)

1. **Go to Authentication**
   - 🔗 Direct link: https://console.firebase.google.com/project/_/authentication/providers
   - (Replace `_` with your project ID)
   - OR: In left sidebar, click **"Authentication"** → **"Get started"** (if first time)

2. **Click "Sign-in method" tab** (top of page)

3. **Enable Email/Password:**
   - Find "Email/Password" in the list
   - Click on it
   - Toggle **Enable** to ON
   - Click **Save**

4. **Enable Google Sign-In:**
   - Find "Google" in the list (usually second row)
   - Click on it
   - Toggle **Enable** to ON
   - **Project support email**: Select your email from dropdown
   - Click **Save**

✅ **You should now see both "Email/Password" and "Google" showing "Enabled"**

---

### Step 4: Enable Identity Toolkit API (2 min)

⚠️ **This is the most commonly missed step!**

1. **Go to Google Cloud Console**
   - 🔗 Link: https://console.cloud.google.com/
   - Make sure your Firebase project is selected (check project name in top bar)

2. **Navigate to API Library**
   - 🔗 Direct link: https://console.cloud.google.com/apis/library
   - OR: Click hamburger menu (☰) → **"APIs & Services"** → **"Library"**

3. **Search for Identity Toolkit**
   - In search box, type: `Identity Toolkit`
   - Click **"Identity Toolkit API"** (the exact match)

4. **Enable the API**
   - Click big blue **"ENABLE"** button
   - Wait 5-10 seconds
   - You should see "API enabled" with a green checkmark

---

### Step 5: Add Authorized Domains (1 min)

1. **Back to Firebase Console**
   - 🔗 Link: https://console.firebase.google.com/project/_/authentication/settings
   - OR: **Authentication** → **Settings** tab

2. **Scroll to "Authorized domains" section**

3. **Verify localhost is listed:**
   - You should see `localhost` already there
   - If not, click **"Add domain"** and add: `localhost`

4. **For production (later):**
   - When you deploy, add your production domain here
   - Example: `cleary.vercel.app`

---

## 📍 PART 3: Configure Your Local App

### Step 6: Create .env.local file (3 min)

**Open your terminal in VS Code** (or use your existing terminal)

```bash
# Navigate to your project
cd "/Users/adisanghavi/Github Copilot/cleary"

# Copy the template
cp .env.local.template .env.local

# Open the file in VS Code
code .env.local
```

**OR manually create the file:**
1. In VS Code, right-click `cleary` folder
2. Select "New File"
3. Name it: `.env.local`

---

### Step 7: Fill in Firebase Values (2 min)

**In your `.env.local` file**, replace the placeholder values with your Firebase config from Step 2:

```bash
# Firebase Authentication (frontend - REQUIRED for Google Sign-In)
# 👇 Paste YOUR values from Step 2 here:
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=cleary-news-xxxxx.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=cleary-news-xxxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=cleary-news-xxxxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abc123def456
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Backend API Keys (already configured - don't change)
GEMINI_API_KEY=AIzaSyB5lb1sZ5aDb3-DRTaEVKZS4B_Qzzfk6hw
PORT=5001

# Google OAuth for Gmail (optional - skip for now)
# GOOGLE_OAUTH_CLIENT_ID=
# GOOGLE_OAUTH_CLIENT_SECRET=
# GOOGLE_OAUTH_REDIRECT=http://localhost:5001/api/auth/google/callback
```

**Save the file** (Cmd+S or Ctrl+S)

---

### Step 8: Verify & Test (3 min)

1. **Run the environment checker:**
   ```bash
   cd "/Users/adisanghavi/Github Copilot/cleary"
   ./check-env.sh
   ```

   **Expected output:**
   ```
   ✅ .env.local found
   ✅ Firebase API Key configured
   ✅ Firebase Project ID configured
   ✅ .env found (backend)
   ✅ Gemini API Key configured
   ```

2. **Restart your dev server:**
   ```bash
   # Stop current server (Ctrl+C if running)
   npm start
   ```

3. **Test Google Sign-In:**
   - Open browser: http://localhost:3000/login
   - Click **"Continue with Google"** button
   - Should open Google sign-in popup
   - Select your Google account
   - Should redirect to `/feed` page after successful sign-in

---

## ✅ Verification Checklist

Check off each item as you complete it:

- [ ] Firebase project created
- [ ] Got Firebase config values (7 values)
- [ ] Email/Password authentication enabled
- [ ] Google sign-in provider enabled
- [ ] Identity Toolkit API enabled in Google Cloud
- [ ] Authorized domains includes `localhost`
- [ ] `.env.local` file created
- [ ] All 7 Firebase values pasted into `.env.local`
- [ ] File saved
- [ ] Environment checker shows all ✅
- [ ] Dev server restarted
- [ ] Google Sign-In popup opens
- [ ] Successfully signed in and redirected to feed

---

## 🐛 Troubleshooting

### Error: "auth/api-key-not-valid"
**Solution:** 
- Double-check you copied the FULL API key from Firebase Console
- Verify no extra spaces before/after the value in `.env.local`
- Make sure the file is named `.env.local` (not `.env.local.txt`)

### Error: "auth/unauthorized-domain"
**Solution:**
- Add `localhost` to Firebase → Authentication → Settings → Authorized domains
- Direct link: https://console.firebase.google.com/project/_/authentication/settings

### Google Sign-In button does nothing
**Solution:**
- Check browser console (F12) for errors
- Verify `.env.local` is in the root `cleary` folder (not in `src`)
- Restart dev server after adding `.env.local`

### Popup is blocked
**Solution:**
- Allow popups for `localhost` in browser settings
- Try Chrome/Firefox if using Safari

### Still seeing "demo mode" in console
**Solution:**
- File must be named `.env.local` (with dot at start)
- Variables must start with `REACT_APP_`
- Restart dev server: Stop (Ctrl+C) → `npm start`

---

## 📞 Quick Reference Links

| Resource | URL |
|----------|-----|
| Firebase Console | https://console.firebase.google.com/ |
| Google Cloud Console | https://console.cloud.google.com/ |
| Firebase Auth Setup | https://console.firebase.google.com/project/_/authentication/providers |
| Identity Toolkit API | https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com |
| Firebase Documentation | https://firebase.google.com/docs/auth/web/google-signin |

---

## 🎉 Success!

Once you see the Google popup and can sign in, you're all set! 

Your Firebase authentication is now:
- ✅ Fully configured
- ✅ Google Sign-In enabled
- ✅ Identity Toolkit API active
- ✅ Ready for production deployment

---

## 📚 Next Steps (Optional)

### Want to add Gmail integration?

Follow the Gmail OAuth setup in `README.md` section "Google OAuth & Gmail Setup"

### Want to deploy to production?

1. Add your production domain to Firebase Authorized Domains
2. Update `.env.local` with production values
3. Build: `npm run build`
4. Deploy to Vercel/Netlify with same environment variables

---

**Need help?** Check browser console (F12) for specific error messages.
