# Project Overview

This repository contains the Cleary news application with rich UI components, serverless RSS/news endpoints, and Google OAuth login via server-side flow.

## Key Features
- Server-side Google OAuth (no Firebase required by default)
- Fallback demo mode with hard Firebase disable
- JWT session cookie (7 day expiry, HttpOnly, Secure, SameSite=Lax)
- News aggregation via RSS parsing
- Adaptive political/region news categorization
 - Personalized news ranking (interests + lean preference + video boost)

## Local Development
```bash
# Install dependencies (root + cleary app if separate)
npm install
cd cleary && npm install

# Start local servers (Express + React)
cd cleary
npm run server &
npm start
```

## Environment Variables
Copy `.env.example` to `.env` locally. Never commit the real `.env`.

Minimum required for Google OAuth:
```
APP_SESSION_SECRET=your-long-random-secret
GOOGLE_OAUTH_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=xxxxx
# Omit GOOGLE_OAUTH_REDIRECT locally (auto uses http://localhost:5001/api/auth/google/callback)
```

Optional:
```
GEMINI_API_KEY=... (for AI features)
```

To enable Firebase (optional):
```
REACT_APP_ENABLE_FIREBASE_AUTH=true
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
```
If `REACT_APP_ENABLE_FIREBASE_AUTH` is not true, server OAuth is used.

## Deployment (Vercel)

1. Push code to GitHub (ensure `.env` excluded; `.gitignore` already set)
2. Import project in Vercel dashboard
3. Set environment variables under Settings > Environment Variables:
```
GEMINI_API_KEY=your-real-key
APP_SESSION_SECRET=long-random-string
GOOGLE_OAUTH_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=xxxxx
GOOGLE_OAUTH_REDIRECT=https://your-deployment.vercel.app/api/auth/google/callback
```
4. In Google Cloud Console, add authorized redirect URI:
```
https://your-deployment.vercel.app/api/auth/google/callback
```
5. Deploy; use Google Sign-In button to test.

### Vercel CLI (optional)
```bash
vercel env add GEMINI_API_KEY production
vercel env add APP_SESSION_SECRET production
vercel env add GOOGLE_OAUTH_CLIENT_ID production
vercel env add GOOGLE_OAUTH_CLIENT_SECRET production
```

## Serverless Auth Endpoints
Implemented under `api/auth/google/login.js` and `api/auth/google/callback.js`.

- `/api/auth/google/login` returns consent URL + state
- `/api/auth/google/callback` exchanges code, sets `cleary_session` cookie, posts profile back via popup

## Security Notes
- JWT stored only in HttpOnly cookie
- Refresh by re-login; future improvement: refresh token rotation
- Session secret should be long & random (>= 32 chars)

## Next Improvements
- Add refresh endpoint for JWT rotation
- Store user profiles in persistent DB (Postgres/Supabase)
- Add rate limiting for auth endpoints

## News API Personalization

Endpoint: `/api/news`

Query parameters:

| Param | Example | Description |
|-------|---------|-------------|
| `category` | `breaking` | News category (maps to internal RSS sets) |
| `preference` | `balanced` | Political preference: `balanced`, `reinforce`, `challenge` (affects lean sorting + personalization lean weight) |
| `userLean` | `center` | User's self-declared lean: `left`, `lean-left`, `center`, `lean-right`, `right` |
| `includeTrending` | `true` | Include detected trending topics |
| `forceRefresh` | `true` | Bypass cache and fetch fresh articles immediately (still updates cache) |
| `personalized` | `true` | Enable personalization scoring and ordering |
| `interests` | `ai,election,economy` | Comma-separated interest keywords; boosts matching articles |
| `query` | `ukraine` | Simple substring filter across title/description |

Response JSON (additional fields when `personalized=true`):
```
{
	articles: [
		{
			title: "...",
			personalization: {
				score: 1.42,
				components: {
					recency: 0.93,
					video: 0.3,
					interests: 0.15,
					leanAlignment: 0.04,
					matches: ["ai"]
				}
			}
		}
	],
	personalized: true,
	interests: ["ai","election","economy"],
	forceRefreshed: false,
	cached: false
}
```

Scoring model (per article):
- Recency: linear decay over 12h window (freshness up to 1.0)
- Video boost: +0.3 if at least one video
- Interest matches: +0.15 per matching keyword
- Lean alignment: up to +0.2 reinforcement or challenge based on `preference`
- Balanced preference grants small boost to centrist content

Personalized ordering is computed dynamically on top of cached base articles; cache remains non-personalized for efficiency.

## Troubleshooting
- Seeing Firebase api-key error: ensure `REACT_APP_ENABLE_FIREBASE_AUTH` is false OR provide all Firebase env vars.
- OAuth not configured error: check Google client ID/secret set in Vercel.
- Popup blocked: allow popups for your domain.

## License
Proprietary / All rights reserved (update as needed).
