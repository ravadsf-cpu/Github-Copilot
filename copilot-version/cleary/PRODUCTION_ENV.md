# Cleary Production Environment Variables

Use this guide to configure a production (e.g. Vercel) deployment of the Cleary backend + React frontend.

## Required (Authentication / Security)
| Purpose | Preferred Name | Fallback Name | Notes |
|---------|----------------|---------------|-------|
| Google OAuth Client ID | `GOOGLE_OAUTH_CLIENT_ID` | `GOOGLE_CLIENT_ID` | Web application OAuth 2.0 client. |
| Google OAuth Client Secret | `GOOGLE_OAUTH_CLIENT_SECRET` | `GOOGLE_CLIENT_SECRET` | Keep secret; never commit. |
| Google OAuth Redirect URI | `GOOGLE_OAUTH_REDIRECT` | `OAUTH_REDIRECT_URI` | Must match the authorized URI in Google Cloud. |
| Session signing secret | `SESSION_SECRET` | — | Use a long, random string (>= 32 chars). |

## Optional / Feature Flags
| Purpose | Name | Default | Effect |
|---------|------|---------|--------|
| Post-login browser redirect | `OAUTH_POST_LOGIN_REDIRECT` | (unset) | If set, callback redirects instead of showing close-page helper. |
| Gemini AI key | `GEMINI_API_KEY` | (unset) | Enables AI chat + article enrichment. Fallback heuristics used if absent. |
| Disable Firebase Auth UI | `REACT_APP_ENABLE_FIREBASE_AUTH` | `false` | Keep `false` if using pure Google OAuth server-side flow. |

## Example `.env` (Production)
```env
GOOGLE_OAUTH_CLIENT_ID=your-prod-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-prod-secret
GOOGLE_OAUTH_REDIRECT=https://yourdomain.com/api/auth/google/callback
SESSION_SECRET=prod-super-long-random-secret-value-CHANGE-ME
OAUTH_POST_LOGIN_REDIRECT=https://yourdomain.com/app
GEMINI_API_KEY=sk-prod-gemini-key
REACT_APP_ENABLE_FIREBASE_AUTH=false
```

If you are still using the legacy variable names:
```env
GOOGLE_CLIENT_ID=your-prod-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-prod-secret
OAUTH_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
SESSION_SECRET=prod-super-long-random-secret-value-CHANGE-ME
```
(Do NOT set both sets unless necessary; the server gives priority to the `GOOGLE_OAUTH_*` names.)

## Verification Checklist
1. Deploy with variables set in hosting provider (e.g. Vercel Project Settings → Environment Variables).
2. Open: `GET /api/auth/google/init` → Should return JSON containing a `url` with your `redirect_uri` encoded.
3. Complete consent flow → Should store tokens (currently in-memory) and either redirect (if `OAUTH_POST_LOGIN_REDIRECT` set) or close the popup.
4. Test email metadata: `GET /api/gmail/messages?userId=<yourUserId>` → Expect JSON list.
5. Confirm AI enrichment (optional): Hit any news endpoint; look for AI-based fields only if `GEMINI_API_KEY` present.

## Security Notes
- Rotate `SESSION_SECRET` if suspected compromise; invalidates existing cookie signatures.
- Consider moving token storage from in-memory Map to a secure database (encrypted at rest) for multi-instance deployments.
- Restrict `GOOGLE_OAUTH_REDIRECT` to a single canonical HTTPS domain in production.
- Never expose `GOOGLE_OAUTH_CLIENT_SECRET` to frontend; keep it server-only.

## Common Issues
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| 503 missing_oauth_config | Variable names not set / typo | Ensure one full set of required vars. |
| Auth URL uses `localhost` in prod | Forgot to override redirect URI | Set `GOOGLE_OAUTH_REDIRECT` to production callback. |
| No refresh token | Consent not forced / already granted | Revoke app or ensure `prompt=consent` remains. |
| AI responses generic | Missing `GEMINI_API_KEY` | Add key or accept heuristic fallback. |

## Future Hardening (Recommended)
- Persist tokens with encryption (e.g. KMS + DB column encryption).
- Add token refresh job for long-lived sessions.
- Implement structured audit logging for auth events.
- Add CSRF protection around OAuth initiation.
- Rate-limit `/api/auth/google/init`.

---
Last updated: <DATE>
